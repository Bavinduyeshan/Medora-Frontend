import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type {
  DepartmentDto,
  PageResponse,
  ScheduleDayDto,
  TenantDto,
  TenantRequestPayload,
} from "../../types/api";

export const tenantsApi = {
  requestRegistration: (payload: TenantRequestPayload) =>
    unwrap<TenantDto>(
      http.post("/api/tenants/request", payload),
      adapters.tenant,
    ),

  list: (page = 0, size = 20, status?: string) =>
    unwrap<PageResponse<TenantDto>>(
      http.get("/api/tenants", { params: { page, size, status } }),
      adapters.tenant,
    ),

  listPending: (page = 0, size = 20) =>
    unwrap<PageResponse<TenantDto>>(
      http.get("/api/tenants/pending", { params: { page, size } }),
      adapters.tenant,
    ),

  approve: (id: string) =>
    unwrap<TenantDto>(http.put(`/api/tenants/${id}/approve`), adapters.tenant),

  reject: (id: string, reason: string) =>
    unwrap<TenantDto>(
      http.put(`/api/tenants/${id}/reject`, { reason }),
      adapters.tenant,
    ),

  suspend: (id: string, reason?: string) =>
    unwrap<TenantDto>(
      http.put(`/api/tenants/${id}/suspend`, { reason }),
      adapters.tenant,
    ),

  getById: (id: string) =>
    unwrap<TenantDto>(http.get(`/api/tenants/${id}`), adapters.tenant),

  getSchedule: (id: string) =>
    unwrap<ScheduleDayDto[]>(http.get(`/api/tenants/${id}/schedule`)),

  updateSchedule: (id: string, schedule: ScheduleDayDto[]) =>
    unwrap<ScheduleDayDto[]>(
      http.put(`/api/tenants/${id}/schedule`, { schedule }),
    ),

  listDepartments: (id: string) =>
    unwrap<DepartmentDto[]>(
      http.get(`/api/tenants/${id}/departments`),
      adapters.department,
    ),

  addDepartment: (
    id: string,
    payload: { name: string; description?: string },
  ) =>
    unwrap<DepartmentDto>(
      http.post(`/api/tenants/${id}/departments`, payload),
      adapters.department,
    ),

  removeDepartment: (id: string, deptId: string) =>
    unwrap<void>(http.delete(`/api/tenants/${id}/departments/${deptId}`)),

  updateLogo: (id: string, logoUrl: string) =>
    unwrap<TenantDto>(
      http.put(`/api/tenants/${id}/logo`, { logoUrl }),
      adapters.tenant,
    ),
};
