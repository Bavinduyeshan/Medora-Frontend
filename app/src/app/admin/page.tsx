'use client';

import Link from 'next/link';
import { Building2, Users, ScrollText, ArrowRight } from 'lucide-react';
import { useAuditLogs, usePendingTenants, useUsers } from '@/hooks/useAdminData';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader, StatCard, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { timeAgo } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: pendingTenants, isLoading: tenantsLoading } = usePendingTenants(0, 5);
  const { data: users, isLoading: usersLoading } = useUsers(0, 5);
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs({ page: 0, size: 6 });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform Admin"
        title="Network Overview"
        description="Facility approvals, user accounts, and platform-wide audit visibility."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Pending Facilities" value={pendingTenants?.totalElements ?? '—'} tone="amber" />
        <StatCard icon={Users} label="Total Users" value={users?.totalElements ?? '—'} tone="brand" />
        <StatCard icon={ScrollText} label="Audit Entries" value={auditLogs?.totalElements ?? '—'} tone="ink" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Pending facility approvals</h3>
            <Link href="/admin/tenants" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Review all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CardContent>
            {tenantsLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!tenantsLoading && (!pendingTenants || pendingTenants.content.length === 0) && (
              <EmptyState icon={Building2} title="No pending facilities" description="All facility registrations are up to date." />
            )}
            <div className="space-y-2.5">
              {pendingTenants?.content.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5">
                  <div>
                    <p className="text-xs font-bold text-ink-800">{t.name}</p>
                    <p className="text-[11px] text-ink-500">{t.city}, {t.province}</p>
                  </div>
                  <Badge tone="warning">{t.type.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Recent audit activity</h3>
            <Link href="/admin/audit" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Full log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CardContent>
            {auditLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!auditLoading && (!auditLogs || auditLogs.content.length === 0) && <EmptyState icon={ScrollText} title="No audit activity yet" />}
            <div className="space-y-2.5">
              {auditLogs?.content.map((log) => (
                <div key={log.id} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-800">{log.action}</span>
                    <span className="text-[10px] text-ink-400">{timeAgo(log.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-500">{log.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
          <h3 className="text-base font-bold text-ink-900">Recently registered users</h3>
          <Link href="/admin/users" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
            Manage all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardContent>
          {usersLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {users?.content.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5">
                <div>
                  <p className="text-xs font-bold text-ink-800">{u.username}</p>
                  <p className="text-[11px] text-ink-500">{u.email}</p>
                </div>
                <Badge tone={u.status === 'ACTIVE' ? 'success' : 'neutral'}>{u.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
