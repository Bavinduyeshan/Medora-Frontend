import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type {
  AffiliationDto,
  AffiliationStatus,
  DoctorCreatePayload,
  DoctorDto,
  DoctorScheduleDto,
} from "../../types/api";

export const doctorsApi = {
  create: (payload: DoctorCreatePayload) =>
    unwrap<DoctorDto>(http.post("/api/doctors", payload), adapters.doctor),

  list: () => unwrap<DoctorDto[]>(http.get("/api/doctors"), adapters.doctor),

  search: (q: string) =>
    unwrap<DoctorDto[]>(
      http.get("/api/doctors/search", { params: { q } }),
      adapters.doctor,
    ),

  bySpecialization: (spec: string) =>
    unwrap<DoctorDto[]>(
      http.get(`/api/doctors/specialization/${encodeURIComponent(spec)}`),
      adapters.doctor,
    ),

  bySlmc: (slmcNumber: string) =>
    unwrap<DoctorDto>(
      http.get(`/api/doctors/slmc/${slmcNumber}`),
      adapters.doctor,
    ),

  getByUserId: (userId: string) =>
    unwrap<DoctorDto>(http.get(`/api/doctors/user/${userId}`), adapters.doctor),

  getById: (id: string) =>
    unwrap<DoctorDto>(http.get(`/api/doctors/${id}`), adapters.doctor),

  update: (id: string, payload: Partial<DoctorCreatePayload>) =>
    unwrap<DoctorDto>(http.put(`/api/doctors/${id}`, payload), adapters.doctor),

  deactivate: (id: string) => unwrap<void>(http.delete(`/api/doctors/${id}`)),

  atTenant: (tenantId: string) =>
    unwrap<DoctorDto[]>(
      http.get(`/api/doctors/tenant/${tenantId}`),
      adapters.doctor,
    ),

  addAffiliation: (
    id: string,
    payload: { tenantId: string; departmentId?: string; roleAtTenant: string },
  ) =>
    unwrap<AffiliationDto>(
      http.post(`/api/doctors/${id}/affiliations`, payload),
      adapters.affiliation,
    ),

  listAffiliations: (id: string) =>
    unwrap<AffiliationDto[]>(
      http.get(`/api/doctors/${id}/affiliations`),
      adapters.affiliation,
    ),

  activeAffiliation: (id: string, tenantId: string) =>
    unwrap<boolean>(
      http.get(`/api/doctors/${id}/affiliations/active/${tenantId}`),
    ),

  updateAffiliationStatus: (
    id: string,
    tenantId: string,
    status: AffiliationStatus,
  ) =>
    unwrap<AffiliationDto>(
      http.put(`/api/doctors/${id}/affiliations/${tenantId}/status`, {
        status,
      }),
      adapters.affiliation,
    ),

  removeAffiliation: (id: string, tenantId: string) =>
    unwrap<void>(http.delete(`/api/doctors/${id}/affiliations/${tenantId}`)),

  tenantAffiliations: async (tenantId: string) => {
    const affiliations = await unwrap<AffiliationDto[]>(
      http.get(`/api/doctors/affiliations/tenant/${tenantId}`),
      adapters.affiliation,
    );
    const doctors = await doctorsApi.atTenant(tenantId);
    return affiliations.map((a) => {
      const d = doctors.find((d) => d.id === a.doctorId);
      return {
        ...a,
        doctorName: d ? `${d.firstName} ${d.lastName}` : a.doctorName,
      };
    });
  },

  upsertSchedule: (
    id: string,
    payload: Omit<DoctorScheduleDto, "id" | "doctorId">,
  ) =>
    unwrap<DoctorScheduleDto>(
      http.post(`/api/doctors/${id}/schedules`, payload),
      adapters.schedule,
    ),

  listSchedules: (id: string) =>
    unwrap<DoctorScheduleDto[]>(
      http.get(`/api/doctors/${id}/schedules`),
      adapters.schedule,
    ),

  scheduleAtTenant: (id: string, tenantId: string) =>
    unwrap<DoctorScheduleDto[]>(
      http.get(`/api/doctors/${id}/schedules/tenant/${tenantId}`),
      adapters.schedule,
    ),

  removeScheduleAtTenant: (id: string, tenantId: string) =>
    unwrap<void>(
      http.delete(`/api/doctors/${id}/schedules/tenant/${tenantId}`),
    ),
};
