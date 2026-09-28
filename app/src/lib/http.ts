import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { sessionCookies } from './sessionCookies';
import type { ApiEnvelope, AuthTokensDto } from '../types/api';

export class ApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function correlationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  config.headers['X-Correlation-ID'] = correlationId();
  const token = sessionCookies.accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PRIMARY_ID_FIELDS = [
  'appointmentId',
  'recordId',
  'prescriptionId',
  'itemId',
  'labReportId',
  'reportId',
  'auditId',
  'notificationId',
  'affiliationId',
  'scheduleId',
  'departmentId',
  'diseaseId',
  'doctorId',
  'patientId',
  'tenantId',
  'scanId',
  'qrId',
  'userId',
] as const;

type JsonObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function setIfMissing(target: JsonObject, key: string, value: unknown) {
  if (target[key] === undefined && value !== undefined && value !== null) {
    target[key] = value;
  }
}

function normalizeApiValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => normalizeApiValue(item)) as T;
  if (!isPlainObject(value)) return value;

  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = normalizeApiValue(item);
  }

  for (const idField of PRIMARY_ID_FIELDS) {
    setIfMissing(out, 'id', out[idField]);
    if (out.id !== undefined) break;
  }

  setIfMissing(out, 'number', out.page);
  if (typeof out.number === 'number') setIfMissing(out, 'first', out.number === 0);

  setIfMissing(out, 'active', out.isActive);
  setIfMissing(out, 'createdAt', out.occurredAt);
  setIfMissing(out, 'createdAt', out.dateIssued);
  setIfMissing(out, 'issuedAt', out.createdAt);
  setIfMissing(out, 'scannedByUserId', out.scannedBy);
  setIfMissing(out, 'requestedByUserId', out.requestedBy);
  setIfMissing(out, 'fileUrl', out.reportUrl);
  setIfMissing(out, 'type', out.reportType);
  setIfMissing(out, 'title', out.reportFilename);
  setIfMissing(out, 'title', out.reportType);
  setIfMissing(out, 'resultsSummary', out.notes);
  setIfMissing(out, 'reportedAt', out.uploadedAt);
  setIfMissing(out, 'reportedAt', out.testDate);

  if (out.flagged === undefined && (out.labReportId !== undefined || out.reportUrl !== undefined)) {
    out.flagged = false;
  }

  if (out.user === undefined && out.accessToken && out.userId) {
    out.user = normalizeApiValue({
      userId: out.userId,
      username: out.username,
      email: out.email,
      role: out.role,
      tenantId: out.tenantId ?? null,
      status: out.status,
      emailVerified: out.emailVerified ?? false,
      createdAt: out.createdAt ?? new Date().toISOString(),
    });
  }

  return out as T;
}

// --- Single-flight refresh-token handling -----------------------------------
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = sessionCookies.refreshToken;
  if (!refreshToken) return null;
  try {
    const res = await axios.post<ApiEnvelope<AuthTokensDto>>(
      `${env.apiBaseUrl}/api/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const tokens = normalizeApiValue(res.data?.data);
    if (!tokens?.accessToken) return null;
    sessionCookies.setAccessToken(tokens.accessToken);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      }
      sessionCookies.clear();
      onSessionExpired?.();
    }

    const message =
      error.response?.data?.message ||
      (error.response?.data as { error?: string } | undefined)?.error ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new ApiError(message, status, error.code));
  }
);

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const res = await promise;
  return normalizeApiValue(res.data?.data) as T;
}
