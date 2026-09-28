import { http, unwrap } from '../http';
import type {
  AffiliationDto,
  AffiliationStatus,
  DoctorCreatePayload,
  DoctorDto,
  DoctorScheduleDto,
} from '../../types/api';

export const doctorsApi = {
  create: (payload: DoctorCreatePayload) => unwrap<DoctorDto>(http.post('/api/doctors', payload)),

  list: () => unwrap<DoctorDto[]>(http.get('/api/doctors')),

  search: (q: string) => unwrap<DoctorDto[]>(http.get('/api/doctors/search', { params: { q } })),

  bySpecialization: (spec: string) =>
    unwrap<DoctorDto[]>(http.get(`/api/doctors/specialization/${encodeURIComponent(spec)}`)),

  bySlmc: (slmcNumber: string) => unwrap<DoctorDto>(http.get(`/api/doctors/slmc/${slmcNumber}`)),

  getByUserId: (userId: string) => unwrap<DoctorDto>(http.get(`/api/doctors/user/${userId}`)),

  getById: (id: string) => unwrap<DoctorDto>(http.get(`/api/doctors/${id}`)),

  update: (id: string, payload: Partial<DoctorCreatePayload>) =>
    unwrap<DoctorDto>(http.put(`/api/doctors/${id}`, payload)),

  deactivate: (id: string) => unwrap<void>(http.delete(`/api/doctors/${id}`)),

  atTenant: (tenantId: string) => unwrap<DoctorDto[]>(http.get(`/api/doctors/tenant/${tenantId}`)),

  addAffiliation: (
    id: string,
    payload: { tenantId: string; departmentId?: string; roleAtTenant: string }
  ) => unwrap<AffiliationDto>(http.post(`/api/doctors/${id}/affiliations`, payload)),

  listAffiliations: (id: string) => unwrap<AffiliationDto[]>(http.get(`/api/doctors/${id}/affiliations`)),

  activeAffiliation: (id: string, tenantId: string) =>
    unwrap<AffiliationDto | null>(http.get(`/api/doctors/${id}/affiliations/active/${tenantId}`)),

  updateAffiliationStatus: (id: string, tenantId: string, status: AffiliationStatus) =>
    unwrap<AffiliationDto>(http.put(`/api/doctors/${id}/affiliations/${tenantId}/status`, { status })),

  removeAffiliation: (id: string, tenantId: string) =>
    unwrap<void>(http.delete(`/api/doctors/${id}/affiliations/${tenantId}`)),

  tenantAffiliations: (tenantId: string) =>
    unwrap<AffiliationDto[]>(http.get(`/api/doctors/affiliations/tenant/${tenantId}`)),

  upsertSchedule: (id: string, payload: Omit<DoctorScheduleDto, 'id' | 'doctorId'>) =>
    unwrap<DoctorScheduleDto>(http.post(`/api/doctors/${id}/schedules`, payload)),

  listSchedules: (id: string) => unwrap<DoctorScheduleDto[]>(http.get(`/api/doctors/${id}/schedules`)),

  scheduleAtTenant: (id: string, tenantId: string) =>
    unwrap<DoctorScheduleDto[]>(http.get(`/api/doctors/${id}/schedules/tenant/${tenantId}`)),

  removeScheduleAtTenant: (id: string, tenantId: string) =>
    unwrap<void>(http.delete(`/api/doctors/${id}/schedules/tenant/${tenantId}`)),
};
