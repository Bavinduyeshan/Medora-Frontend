import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "../config/env";
import { sessionCookies } from "./sessionCookies";
import type { ApiEnvelope, AuthTokensDto } from "../types/api";

export class ApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function correlationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  config.headers["X-Correlation-ID"] = correlationId();
  const token = sessionCookies.accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Single-flight refresh-token handling -----------------------------------
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = sessionCookies.refreshToken;
  if (!refreshToken) return null;
  try {
    const res = await axios.post<ApiEnvelope<AuthTokensDto>>(
      `${env.apiBaseUrl}/api/auth/refresh`,
      { refreshToken },
      {
        timeout: env.apiTimeoutMs,
        headers: { "Content-Type": "application/json" },
      },
    );
    const tokens = res.data?.data;
    if (!tokens?.accessToken || !tokens.refreshToken) return null;
    // Refresh tokens rotate on every use; persist the returned pair together.
    sessionCookies.setTokens(tokens);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
  return () => {
    if (onSessionExpired === handler) onSessionExpired = null;
  };
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = originalRequest?.url?.includes("/api/auth/");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
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
      "Something went wrong. Please try again.";
    return Promise.reject(new ApiError(message, status, error.code));
  },
);

export async function unwrap<T>(
  promise: Promise<{ data: ApiEnvelope<T> }>,
  adapter?: (value: unknown) => unknown,
): Promise<T> {
  const res = await promise;
  if (res.data?.success === false)
    throw new ApiError(res.data.message || "Request failed");
  return (adapter ? adapter(res.data?.data) : res.data?.data) as T;
}
