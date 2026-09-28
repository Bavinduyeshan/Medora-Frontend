'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Users, ChevronLeft, ChevronRight, Ban, CheckCircle2 } from 'lucide-react';
import { useUpdateUserStatus, useUsers } from '@/hooks/useAdminData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, roleLabel } from '@/lib/utils';
import { ApiError } from '@/lib/http';
import type { AccountStatus } from '@/types/api';

const STATUS_TONE: Record<AccountStatus, 'success' | 'neutral' | 'danger' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'danger',
  PENDING_VERIFICATION: 'warning',
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const { data: users, isLoading, error, refetch } = useUsers(page, 20);
  const updateStatus = useUpdateUserStatus();

  const onToggle = async (id: string, current: AccountStatus) => {
    const next: AccountStatus = current === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await updateStatus.mutateAsync({ id, status: next });
      toast.success(`Account ${next === 'SUSPENDED' ? 'suspended' : 'reactivated'}.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update account status.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Accounts" title="User Management" description="All registered accounts across the platform." />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!users || users.content.length === 0) && <EmptyState icon={Users} title="No users found" />}

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {users?.content.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="text-xs font-bold text-ink-800">{u.username}</p>
                  <p className="text-[11px] text-ink-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-ink-600">{roleLabel(u.role)}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[u.status]}>{u.status.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-ink-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={u.status === 'SUSPENDED' ? 'outline' : 'ghost'}
                    icon={u.status === 'SUSPENDED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    onClick={() => onToggle(u.id, u.status)}
                  >
                    {u.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users && users.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-400">
            Page {users.number + 1} of {users.totalPages} · {users.totalElements} users
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={users.first} onClick={() => setPage((p) => Math.max(0, p - 1))} icon={<ChevronLeft className="h-3.5 w-3.5" />}>
              Prev
            </Button>
            <Button size="sm" variant="outline" disabled={users.last} onClick={() => setPage((p) => p + 1)} icon={<ChevronRight className="h-3.5 w-3.5" />} className="flex-row-reverse">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
