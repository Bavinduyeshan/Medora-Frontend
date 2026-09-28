import { http, unwrap } from '../http';
import type { ReportCreatePayload, ReportDto } from '../../types/api';

export const reportsApi = {
  generate: (payload: ReportCreatePayload) => unwrap<ReportDto>(http.post('/api/reports', payload)),
  getById: (id: string) => unwrap<ReportDto>(http.get(`/api/reports/${id}`)),
  byTenant: (tenantId: string) => unwrap<ReportDto[]>(http.get(`/api/reports/tenant/${tenantId}`)),
  byPatient: (patientId: string) => unwrap<ReportDto[]>(http.get(`/api/reports/patient/${patientId}`)),
  byRequester: (userId: string) => unwrap<ReportDto[]>(http.get(`/api/reports/requested-by/${userId}`)),
};
