import { http, unwrap } from '../http';
import type { AppointmentCreatePayload, AppointmentDto } from '../../types/api';

export const appointmentsApi = {
  create: (payload: AppointmentCreatePayload) =>
    unwrap<AppointmentDto>(http.post('/api/appointments', payload)),

  getById: (id: string) => unwrap<AppointmentDto>(http.get(`/api/appointments/${id}`)),

  byPatient: (patientId: string) =>
    unwrap<AppointmentDto[]>(http.get(`/api/appointments/patient/${patientId}`)),

  byDoctor: (doctorId: string) =>
    unwrap<AppointmentDto[]>(http.get(`/api/appointments/doctor/${doctorId}`)),

  byTenant: (tenantId: string) =>
    unwrap<AppointmentDto[]>(http.get(`/api/appointments/tenant/${tenantId}`)),

  reschedule: (id: string, appointmentStart: string, appointmentEnd: string) =>
    unwrap<AppointmentDto>(http.put(`/api/appointments/${id}/reschedule`, { appointmentStart, appointmentEnd })),

  cancel: (id: string, reason = 'Cancelled by user') =>
    unwrap<AppointmentDto>(http.put(`/api/appointments/${id}/cancel`, { reason })),

  complete: (id: string) => unwrap<AppointmentDto>(http.put(`/api/appointments/${id}/complete`)),
};
