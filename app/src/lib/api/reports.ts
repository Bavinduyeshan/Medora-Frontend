import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type { ReportCreatePayload, ReportDto } from "../../types/api";

export const reportsApi = {
  generate: (payload: ReportCreatePayload) =>
    unwrap<ReportDto>(http.post("/api/reports", payload), adapters.report),
  getById: (id: string) =>
    unwrap<ReportDto>(http.get(`/api/reports/${id}`), adapters.report),
  byTenant: (tenantId: string) =>
    unwrap<ReportDto[]>(
      http.get(`/api/reports/tenant/${tenantId}`),
      adapters.report,
    ),
  byPatient: (patientId: string) =>
    unwrap<ReportDto[]>(
      http.get(`/api/reports/patient/${patientId}`),
      adapters.report,
    ),
  byRequester: (userId: string) =>
    unwrap<ReportDto[]>(
      http.get(`/api/reports/requested-by/${userId}`),
      adapters.report,
    ),
};
