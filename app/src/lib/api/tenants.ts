import { http, unwrap } from '../http';
import type {
  DepartmentDto,
  PageResponse,
  ScheduleDayDto,
  TenantDto,
  TenantRequestPayload,
} from '../../types/api';

export const tenantsApi = {
  requestRegistration: (payload: TenantRequestPayload) =>
    unwrap<TenantDto>(http.post('/api/tenants/request', payload)),

  listPending: (page = 0, size = 20) =>
    unwrap<PageResponse<TenantDto>>(http.get('/api/tenants/pending', { params: { page, size } })),

  approve: (id: string) => unwrap<TenantDto>(http.put(`/api/tenants/${id}/approve`)),

  reject: (id: string, reason: string) =>
    unwrap<TenantDto>(http.put(`/api/tenants/${id}/reject`, { reason })),

  suspend: (id: string, reason?: string) =>
    unwrap<TenantDto>(http.put(`/api/tenants/${id}/suspend`, { reason })),

  getById: (id: string) => unwrap<TenantDto>(http.get(`/api/tenants/${id}`)),

  getSchedule: (id: string) => unwrap<ScheduleDayDto[]>(http.get(`/api/tenants/${id}/schedule`)),

  updateSchedule: (id: string, schedule: ScheduleDayDto[]) =>
    unwrap<ScheduleDayDto[]>(http.put(`/api/tenants/${id}/schedule`, { schedule })),

  listDepartments: (id: string) => unwrap<DepartmentDto[]>(http.get(`/api/tenants/${id}/departments`)),

  addDepartment: (id: string, payload: { name: string; description?: string }) =>
    unwrap<DepartmentDto>(http.post(`/api/tenants/${id}/departments`, payload)),

  removeDepartment: (id: string, deptId: string) =>
    unwrap<void>(http.delete(`/api/tenants/${id}/departments/${deptId}`)),

  updateLogo: (id: string, logoUrl: string) =>
    unwrap<TenantDto>(http.put(`/api/tenants/${id}/logo`, { logoUrl })),
};
