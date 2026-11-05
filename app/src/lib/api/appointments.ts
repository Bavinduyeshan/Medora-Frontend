import { doctorsApi } from "./doctors";
import { tenantsApi } from "./tenants";
import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type { AppointmentCreatePayload, AppointmentDto } from "../../types/api";

async function labelledAppointments(
  promise: Promise<AppointmentDto[]>,
): Promise<AppointmentDto[]> {
  const visits = await promise;
  const doctors = new Map<string, string>();
  const facilities = new Map<string, string>();
  await Promise.all([
    ...[...new Set(visits.map((v) => v.doctorId))].map(async (id) => {
      try {
        const d = await doctorsApi.getById(id);
        doctors.set(id, `Dr. ${d.firstName} ${d.lastName}`);
      } catch {
        /* Keep appointments available if a label lookup fails. */
      }
    }),
    ...[...new Set(visits.map((v) => v.tenantId))].map(async (id) => {
      try {
        const t = await tenantsApi.getById(id);
        facilities.set(id, t.name);
      } catch {
        /* Keep the relationship ID as fallback. */
      }
    }),
  ]);
  return visits.map((v) => ({
    ...v,
    doctorName:
      v.doctorName ||
      doctors.get(v.doctorId) ||
      `Doctor · ${v.doctorId.slice(0, 8)}`,
    tenantName:
      v.tenantName ||
      facilities.get(v.tenantId) ||
      `Facility · ${v.tenantId.slice(0, 8)}`,
  }));
}

export const appointmentsApi = {
  create: (payload: AppointmentCreatePayload) =>
    unwrap<AppointmentDto>(
      http.post("/api/appointments", payload),
      adapters.appointment,
    ),

  getById: (id: string) =>
    unwrap<AppointmentDto>(
      http.get(`/api/appointments/${id}`),
      adapters.appointment,
    ),

  byPatient: (patientId: string) =>
    labelledAppointments(
      unwrap<AppointmentDto[]>(
        http.get(`/api/appointments/patient/${patientId}`),
        adapters.appointment,
      ),
    ),

  byDoctor: (doctorId: string) =>
    labelledAppointments(
      unwrap<AppointmentDto[]>(
        http.get(`/api/appointments/doctor/${doctorId}`),
        adapters.appointment,
      ),
    ),

  byTenant: (tenantId: string) =>
    labelledAppointments(
      unwrap<AppointmentDto[]>(
        http.get(`/api/appointments/tenant/${tenantId}`),
        adapters.appointment,
      ),
    ),

  reschedule: (id: string, appointmentStart: string, appointmentEnd: string) =>
    unwrap<AppointmentDto>(
      http.put(`/api/appointments/${id}/reschedule`, {
        appointmentStart,
        appointmentEnd,
      }),
      adapters.appointment,
    ),

  cancel: (id: string, reason = "Cancelled by user") =>
    unwrap<AppointmentDto>(
      http.put(`/api/appointments/${id}/cancel`, { reason }),
      adapters.appointment,
    ),

  complete: (id: string) =>
    unwrap<AppointmentDto>(
      http.put(`/api/appointments/${id}/complete`),
      adapters.appointment,
    ),
};
