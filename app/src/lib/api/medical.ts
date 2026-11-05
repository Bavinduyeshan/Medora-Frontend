import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { sessionCookies } from "../sessionCookies";
import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type {
  DiseaseDto,
  LabReportDto,
  MedicalRecordCreatePayload,
  MedicalRecordDto,
  PrescriptionCreatePayload,
  PrescriptionDto,
} from "../../types/api";

function clinicalContext() {
  const workspace = useActiveWorkspace.getState();
  if (sessionCookies.role !== "DOCTOR") return {};
  if (
    !workspace.activeTenantId ||
    workspace.ownerUserId !== sessionCookies.userId
  ) {
    throw new Error(
      "Choose your active facility before adding clinical information.",
    );
  }
  return { headers: { "X-Workspace-Tenant-ID": workspace.activeTenantId } };
}

export const medicalApi = {
  // Diseases
  listDiseases: () =>
    unwrap<DiseaseDto[]>(http.get("/api/diseases"), adapters.disease),
  getDisease: (id: string) =>
    unwrap<DiseaseDto>(http.get(`/api/diseases/${id}`), adapters.disease),
  createDisease: (payload: {
    name: string;
    icdCode?: string;
    category?: string;
    description?: string;
  }) =>
    unwrap<DiseaseDto>(
      http.post("/api/diseases", { category: "GENERAL", ...payload }),
      adapters.disease,
    ),

  // Records
  createRecord: (payload: MedicalRecordCreatePayload) =>
    unwrap<MedicalRecordDto>(
      http.post(
        "/api/records",
        { ...payload, followUpDate: payload.followUpDate || undefined },
        clinicalContext(),
      ),
      adapters.record,
    ),
  getRecord: (id: string) =>
    unwrap<MedicalRecordDto>(http.get(`/api/records/${id}`), adapters.record),
  updateRecord: (id: string, payload: Partial<MedicalRecordCreatePayload>) =>
    unwrap<MedicalRecordDto>(
      http.put(`/api/records/${id}`, payload),
      adapters.record,
    ),
  patientHistory: (patientId: string) =>
    unwrap<MedicalRecordDto[]>(
      http.get(`/api/records/patient/${patientId}`),
      adapters.record,
    ),
  patientHistoryAtTenant: (patientId: string, tenantId: string) =>
    unwrap<MedicalRecordDto[]>(
      http.get(`/api/records/patient/${patientId}/tenant/${tenantId}`),
      adapters.record,
    ),
  tenantRecords: (tenantId: string) =>
    unwrap<MedicalRecordDto[]>(
      http.get(`/api/records/tenant/${tenantId}`),
      adapters.record,
    ),

  // Prescriptions
  createPrescription: (recordId: string, payload: PrescriptionCreatePayload) =>
    unwrap<PrescriptionDto>(
      http.post(
        `/api/records/${recordId}/prescriptions`,
        payload,
        clinicalContext(),
      ),
      adapters.prescription,
    ),
  recordPrescriptions: (recordId: string) =>
    unwrap<PrescriptionDto[]>(
      http.get(`/api/records/${recordId}/prescriptions`),
      adapters.prescription,
    ),
  getPrescription: (id: string) =>
    unwrap<PrescriptionDto>(
      http.get(`/api/prescriptions/${id}`),
      adapters.prescription,
    ),
  patientPrescriptions: (patientId: string) =>
    unwrap<PrescriptionDto[]>(
      http.get(`/api/prescriptions/patient/${patientId}`),
      adapters.prescription,
    ),
  dispensePrescription: (id: string) =>
    unwrap<PrescriptionDto>(
      http.put(`/api/prescriptions/${id}/dispense`),
      adapters.prescription,
    ),

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
      http.post(
        "/api/lab-reports",
        {
          patientId: payload.patientId,
          recordId: payload.recordId,
          doctorId: payload.doctorId,
          reportUrl: payload.fileUrl,
          reportFilename: payload.title,
          reportType: payload.type,
          notes: payload.resultsSummary,
          testDate: payload.testDate ?? new Date().toISOString().slice(0, 10),
        },
        clinicalContext(),
      ),
      adapters.lab,
    ),
  patientLabReports: (patientId: string) =>
    unwrap<LabReportDto[]>(
      http.get(`/api/lab-reports/patient/${patientId}`),
      adapters.lab,
    ),
  recordLabReports: (recordId: string) =>
    unwrap<LabReportDto[]>(
      http.get(`/api/lab-reports/record/${recordId}`),
      adapters.lab,
    ),
  getLabReport: (id: string) =>
    unwrap<LabReportDto>(http.get(`/api/lab-reports/${id}`), adapters.lab),
};
