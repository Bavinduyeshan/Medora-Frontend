import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type { AuditLogDto, PageResponse } from "../../types/api";

export interface AuditSearchParams {
  action?: string;
  actorUserId?: string;
  tenantId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const auditApi = {
  search: (params: AuditSearchParams = {}) =>
    unwrap<PageResponse<AuditLogDto>>(
      http.get("/api/audit/logs", { params: { page: 0, size: 20, ...params } }),
      adapters.audit,
    ),

  byPatient: (patientId: string) =>
    unwrap<PageResponse<AuditLogDto>>(
      http.get(`/api/audit/logs/patient/${patientId}`),
      adapters.audit,
    ),

  byTenant: (tenantId: string) =>
    unwrap<PageResponse<AuditLogDto>>(
      http.get(`/api/audit/logs/tenant/${tenantId}`),
      adapters.audit,
    ),

  byActor: (userId: string) =>
    unwrap<PageResponse<AuditLogDto>>(
      http.get(`/api/audit/logs/actor/${userId}`),
      adapters.audit,
    ),
};
