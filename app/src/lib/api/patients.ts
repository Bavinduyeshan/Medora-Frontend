import { http, unwrap } from '../http';
import type {
  PageResponse,
  PatientCreatePayload,
  PatientDto,
  PatientQrDto,
  QrScanResultDto,
  ScanHistoryEntryDto,
} from '../../types/api';

export const patientsApi = {
  create: (payload: PatientCreatePayload) => unwrap<PatientDto>(http.post('/api/patients', payload)),

  list: (page = 0, size = 20) =>
    unwrap<PageResponse<PatientDto>>(http.get('/api/patients', { params: { page, size } })),

  getById: (patientId: string) => unwrap<PatientDto>(http.get(`/api/patients/${patientId}`)),

  getByUserId: (userId: string) => unwrap<PatientDto>(http.get(`/api/patients/user/${userId}`)),

  update: (patientId: string, payload: Partial<PatientCreatePayload>) =>
    unwrap<PatientDto>(http.put(`/api/patients/${patientId}`, payload)),

  getQr: (patientId: string) => unwrap<PatientQrDto>(http.get(`/api/patients/${patientId}/qr`)),

  regenerateQr: (patientId: string) =>
    unwrap<PatientQrDto>(http.post(`/api/patients/${patientId}/qr/regenerate`)),

  scanQr: (payload: { qrToken: string; tenantId: string; purpose: string }) =>
    unwrap<QrScanResultDto>(http.post('/api/patients/qr/scan', payload)),

  resolveQr: (token: string) => unwrap<PatientDto>(http.get(`/api/patients/qr/${token}`)),

  scanHistory: (patientId: string, page = 0, size = 20) =>
    unwrap<PageResponse<ScanHistoryEntryDto>>(
      http.get(`/api/patients/${patientId}/scan-history`, { params: { page, size } })
    ),
};
