'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorsApi } from '@/lib/api/doctors';
import { medicalApi } from '@/lib/api/medical';
import { patientsApi } from '@/lib/api/patients';
import { appointmentsApi } from '@/lib/api/appointments';
import { tenantsApi } from '@/lib/api/tenants';
import { useAuth } from '@/context/AuthContext';
import type {
  DoctorCreatePayload,
  MedicalRecordCreatePayload,
  PrescriptionCreatePayload,
} from '@/types/api';

export function useCurrentDoctor() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['doctor', 'me', user?.id],
    queryFn: () => doctorsApi.getByUserId(user!.id),
    enabled: !!user?.id && user.role === 'DOCTOR',
    retry: false,
  });
}

export function useCreateDoctorProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (payload: Omit<DoctorCreatePayload, 'userId'>) =>
      doctorsApi.create({ ...payload, userId: user!.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor', 'me', user?.id] }),
  });
}

export function useDoctorAffiliations(doctorId?: string) {
  return useQuery({
    queryKey: ['doctor-affiliations', doctorId],
    queryFn: () => doctorsApi.listAffiliations(doctorId!),
    enabled: !!doctorId,
  });
}

export function useDoctorAppointments(doctorId?: string) {
  return useQuery({
    queryKey: ['doctor-appointments', doctorId],
    queryFn: () => appointmentsApi.byDoctor(doctorId!),
    enabled: !!doctorId,
  });
}

export function useDoctorSchedules(doctorId?: string) {
  return useQuery({
    queryKey: ['doctor-schedules', doctorId],
    queryFn: () => doctorsApi.listSchedules(doctorId!),
    enabled: !!doctorId,
  });
}

export function useTenantLookup(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantsApi.getById(tenantId!),
    enabled: !!tenantId,
  });
}

export function useScanPatientQr() {
  return useMutation({
    mutationFn: (payload: { qrToken: string; tenantId: string; purpose: string }) =>
      patientsApi.scanQr(payload),
  });
}

export function usePatientHistoryAtTenant(patientId?: string, tenantId?: string) {
  return useQuery({
    queryKey: ['patient-history-tenant', patientId, tenantId],
    queryFn: () => medicalApi.patientHistoryAtTenant(patientId!, tenantId!),
    enabled: !!patientId && !!tenantId,
  });
}

export function useFullPatientHistory(patientId?: string) {
  return useQuery({
    queryKey: ['patient-history-full', patientId],
    queryFn: () => medicalApi.patientHistory(patientId!),
    enabled: !!patientId,
  });
}

export function useCreateMedicalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MedicalRecordCreatePayload) => medicalApi.createRecord(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['patient-history-full', variables.patientId] });
      qc.invalidateQueries({ queryKey: ['patient-history-tenant', variables.patientId] });
      qc.invalidateQueries({ queryKey: ['patient-records', variables.patientId] });
    },
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, payload }: { recordId: string; payload: PrescriptionCreatePayload }) =>
      medicalApi.createPrescription(recordId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient-prescriptions'] });
      qc.invalidateQueries({ queryKey: ['record-prescriptions'] });
    },
  });
}

export function useRecordPrescriptions(recordId?: string) {
  return useQuery({
    queryKey: ['record-prescriptions', recordId],
    queryFn: () => medicalApi.recordPrescriptions(recordId!),
    enabled: !!recordId,
  });
}

export function useDiseases() {
  return useQuery({
    queryKey: ['diseases'],
    queryFn: () => medicalApi.listDiseases(),
    staleTime: 5 * 60_000,
  });
}
