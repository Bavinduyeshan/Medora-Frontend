'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantsApi } from '@/lib/api/tenants';
import { doctorsApi } from '@/lib/api/doctors';
import { usersApi } from '@/lib/api/users';
import { appointmentsApi } from '@/lib/api/appointments';
import { reportsApi } from '@/lib/api/reports';
import type { AffiliationStatus, ReportCreatePayload, ScheduleDayDto } from '@/types/api';

export function useTenant(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantsApi.getById(tenantId!),
    enabled: !!tenantId,
  });
}

export function useTenantAffiliations(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant-affiliations', tenantId],
    queryFn: () => doctorsApi.tenantAffiliations(tenantId!),
    enabled: !!tenantId,
  });
}

export function useDoctorsAtTenant(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant-doctors', tenantId],
    queryFn: () => doctorsApi.atTenant(tenantId!),
    enabled: !!tenantId,
  });
}

export function useTenantUsers(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: () => usersApi.listByTenant(tenantId!),
    enabled: !!tenantId,
  });
}

export function useTenantDepartments(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant-departments', tenantId],
    queryFn: () => tenantsApi.listDepartments(tenantId!),
    enabled: !!tenantId,
  });
}

export function useAddDepartment(tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      tenantsApi.addDepartment(tenantId!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-departments', tenantId] }),
  });
}

export function useRemoveDepartment(tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deptId: string) => tenantsApi.removeDepartment(tenantId!, deptId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-departments', tenantId] }),
  });
}

export function useUpdateAffiliationStatus(tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, status }: { doctorId: string; status: AffiliationStatus }) =>
      doctorsApi.updateAffiliationStatus(doctorId, tenantId!, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-affiliations', tenantId] });
      qc.invalidateQueries({ queryKey: ['tenant-doctors', tenantId] });
    },
  });
}

export function useAddAffiliation(tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, departmentId, roleAtTenant }: { doctorId: string; departmentId?: string; roleAtTenant: string }) =>
      doctorsApi.addAffiliation(doctorId, { tenantId: tenantId!, departmentId, roleAtTenant }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-affiliations', tenantId] }),
  });
}

export function useTenantSchedule(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant-schedule', tenantId],
    queryFn: () => tenantsApi.getSchedule(tenantId!),
    enabled: !!tenantId,
  });
}

export function useUpdateTenantSchedule(tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schedule: ScheduleDayDto[]) => tenantsApi.updateSchedule(tenantId!, schedule),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-schedule', tenantId] }),
  });
}

export function useTenantAppointments(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant-appointments', tenantId],
    queryFn: () => appointmentsApi.byTenant(tenantId!),
    enabled: !!tenantId,
  });
}

export function useTenantReports(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant-reports', tenantId],
    queryFn: () => reportsApi.byTenant(tenantId!),
    enabled: !!tenantId,
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReportCreatePayload) => reportsApi.generate(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-reports'] }),
  });
}
