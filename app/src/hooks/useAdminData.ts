"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantsApi } from "@/lib/api/tenants";
import { usersApi } from "@/lib/api/users";
import { auditApi, type AuditSearchParams } from "@/lib/api/audit";
import type { AccountStatus } from "@/types/api";

export function usePendingTenants(page = 0, size = 20) {
  return useQuery({
    queryKey: ["tenants-pending", page, size],
    queryFn: () => tenantsApi.listPending(page, size),
  });
}

export function useApproveTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants-pending"] });
      qc.invalidateQueries({ queryKey: ["facility-directory"] });
    },
  });
}

export function useRejectTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tenantsApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants-pending"] });
      qc.invalidateQueries({ queryKey: ["facility-directory"] });
    },
  });
}

export function useSuspendTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      tenantsApi.suspend(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants-pending"] });
      qc.invalidateQueries({ queryKey: ["facility-directory"] });
    },
  });
}

export function useUsers(page = 0, size = 20) {
  return useQuery({
    queryKey: ["users", page, size],
    queryFn: () => usersApi.list(page, size),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AccountStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useAuditLogs(params: AuditSearchParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditApi.search(params),
  });
}
