'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api/patients';
import { medicalApi } from '@/lib/api/medical';
import { appointmentsApi } from '@/lib/api/appointments';
import { useAuth } from '@/context/AuthContext';
import type { PatientCreatePayload } from '@/types/api';

export function useCurrentPatient() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['patient', 'me', user?.id],
    queryFn: () => patientsApi.getByUserId(user!.id),
    enabled: !!user?.id && user.role === 'PATIENT',
    retry: false,
  });
}

export function useCreatePatientProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (payload: Omit<PatientCreatePayload, 'userId'>) =>
      patientsApi.create({ ...payload, userId: user!.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient', 'me', user?.id] }),
  });
}

export function useUpdatePatientProfile(patientId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PatientCreatePayload>) => patientsApi.update(patientId!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function usePatientQr(patientId?: string) {
  return useQuery({
    queryKey: ['patient-qr', patientId],
    queryFn: () => patientsApi.getQr(patientId!),
    enabled: !!patientId,
  });
}

export function useRegenerateQr(patientId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => patientsApi.regenerateQr(patientId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient-qr', patientId] }),
  });
}

export function usePatientRecords(patientId?: string) {
  return useQuery({
    queryKey: ['patient-records', patientId],
    queryFn: () => medicalApi.patientHistory(patientId!),
    enabled: !!patientId,
  });
}

export function usePatientPrescriptions(patientId?: string) {
  return useQuery({
    queryKey: ['patient-prescriptions', patientId],
    queryFn: () => medicalApi.patientPrescriptions(patientId!),
    enabled: !!patientId,
  });
}

export function usePatientLabReports(patientId?: string) {
  return useQuery({
    queryKey: ['patient-lab-reports', patientId],
    queryFn: () => medicalApi.patientLabReports(patientId!),
    enabled: !!patientId,
  });
}

export function usePatientAppointments(patientId?: string) {
  return useQuery({
    queryKey: ['patient-appointments', patientId],
    queryFn: () => appointmentsApi.byPatient(patientId!),
    enabled: !!patientId,
  });
}

export function usePatientScanHistory(patientId?: string) {
  return useQuery({
    queryKey: ['patient-scan-history', patientId],
    queryFn: () => patientsApi.scanHistory(patientId!),
    enabled: !!patientId,
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => appointmentsApi.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient-appointments'] }),
  });
}
