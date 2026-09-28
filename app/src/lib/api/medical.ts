import { http, unwrap } from '../http';
import type {
  DiseaseDto,
  LabReportDto,
  MedicalRecordCreatePayload,
  MedicalRecordDto,
  PrescriptionCreatePayload,
  PrescriptionDto,
} from '../../types/api';

export const medicalApi = {
  // Diseases
  listDiseases: () => unwrap<DiseaseDto[]>(http.get('/api/diseases')),
  getDisease: (id: string) => unwrap<DiseaseDto>(http.get(`/api/diseases/${id}`)),
  createDisease: (payload: { name: string; icdCode?: string; category?: string; description?: string }) =>
    unwrap<DiseaseDto>(http.post('/api/diseases', { category: 'GENERAL', ...payload })),

  // Records
  createRecord: (payload: MedicalRecordCreatePayload) =>
    unwrap<MedicalRecordDto>(http.post('/api/records', payload)),
  getRecord: (id: string) => unwrap<MedicalRecordDto>(http.get(`/api/records/${id}`)),
  updateRecord: (id: string, payload: Partial<MedicalRecordCreatePayload>) =>
    unwrap<MedicalRecordDto>(http.put(`/api/records/${id}`, payload)),
  patientHistory: (patientId: string) =>
    unwrap<MedicalRecordDto[]>(http.get(`/api/records/patient/${patientId}`)),
  patientHistoryAtTenant: (patientId: string, tenantId: string) =>
    unwrap<MedicalRecordDto[]>(http.get(`/api/records/patient/${patientId}/tenant/${tenantId}`)),
  tenantRecords: (tenantId: string) => unwrap<MedicalRecordDto[]>(http.get(`/api/records/tenant/${tenantId}`)),

  // Prescriptions
  createPrescription: (recordId: string, payload: PrescriptionCreatePayload) =>
    unwrap<PrescriptionDto>(http.post(`/api/records/${recordId}/prescriptions`, payload)),
  recordPrescriptions: (recordId: string) =>
    unwrap<PrescriptionDto[]>(http.get(`/api/records/${recordId}/prescriptions`)),
  getPrescription: (id: string) => unwrap<PrescriptionDto>(http.get(`/api/prescriptions/${id}`)),
  patientPrescriptions: (patientId: string) =>
    unwrap<PrescriptionDto[]>(http.get(`/api/prescriptions/patient/${patientId}`)),
  dispensePrescription: (id: string) => unwrap<PrescriptionDto>(http.put(`/api/prescriptions/${id}/dispense`)),

  // Lab reports
  uploadLabReport: (payload: {
    patientId: string;
    recordId?: string;
    doctorId?: string;
    title: string;
    type: string;
    fileUrl?: string;
    resultsSummary?: string;
    flagged?: boolean;
    testDate?: string;
  }) =>
    unwrap<LabReportDto>(
      http.post('/api/lab-reports', {
        patientId: payload.patientId,
        recordId: payload.recordId,
        doctorId: payload.doctorId,
        reportUrl: payload.fileUrl,
        reportFilename: payload.title,
        reportType: payload.type,
        notes: payload.resultsSummary,
        testDate: payload.testDate ?? new Date().toISOString().slice(0, 10),
      })
    ),
  patientLabReports: (patientId: string) =>
    unwrap<LabReportDto[]>(http.get(`/api/lab-reports/patient/${patientId}`)),
  recordLabReports: (recordId: string) =>
    unwrap<LabReportDto[]>(http.get(`/api/lab-reports/record/${recordId}`)),
  getLabReport: (id: string) => unwrap<LabReportDto>(http.get(`/api/lab-reports/${id}`)),
};
