import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type {
  PageResponse,
  PatientCreatePayload,
  PatientDto,
  PatientQrDto,
  QrScanResultDto,
  ScanHistoryEntryDto,
} from "../../types/api";

export const patientsApi = {
  create: (payload: PatientCreatePayload) =>
    unwrap<PatientDto>(http.post("/api/patients", payload), adapters.patient),

  list: (page = 0, size = 20) =>
    unwrap<PageResponse<PatientDto>>(
      http.get("/api/patients", { params: { page, size } }),
      adapters.patient,
    ),

  getById: (patientId: string) =>
    unwrap<PatientDto>(
      http.get(`/api/patients/${patientId}`),
      adapters.patient,
    ),

  getByUserId: (userId: string) =>
    unwrap<PatientDto>(
      http.get(`/api/patients/user/${userId}`),
      adapters.patient,
    ),

  update: (patientId: string, payload: Partial<PatientCreatePayload>) =>
    unwrap<PatientDto>(
      http.put(`/api/patients/${patientId}`, payload),
      adapters.patient,
    ),

  getQr: (patientId: string) =>
    unwrap<PatientQrDto>(
      http.get(`/api/patients/${patientId}/qr`),
      adapters.qr,
    ),

  regenerateQr: (patientId: string) =>
    unwrap<PatientQrDto>(
      http.post(`/api/patients/${patientId}/qr/regenerate`),
      adapters.qr,
    ),

  scanQr: (payload: { qrToken: string; tenantId: string; purpose: string }) =>
    unwrap<QrScanResultDto>(http.post("/api/patients/qr/scan", payload)),

  resolveQr: (token: string) =>
    unwrap<PatientDto>(http.get(`/api/patients/qr/${token}`), adapters.patient),

  scanHistory: (patientId: string, page = 0, size = 20) =>
    unwrap<PageResponse<ScanHistoryEntryDto>>(
      http.get(`/api/patients/${patientId}/scan-history`, {
        params: { page, size },
      }),
      adapters.scan,
    ),
};
