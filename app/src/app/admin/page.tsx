"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Download,
  FileText,
  LockKeyhole,
  Plus,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useAuditLogs,
  usePendingTenants,
  useUsers,
} from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/Card";
import {
  PageHeader,
  StatCard,
  EmptyState,
  Spinner,
  Avatar,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: pendingTenants, isLoading: tenantsLoading } = usePendingTenants(
    0,
    5,
  );
  const { data: users, isLoading: usersLoading } = useUsers(0, 5);
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs({
    page: 0,
    size: 6,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform Admin"
        title="Network Overview"
        description="Facility reviews, provider credentials, and activity visibility across connected Medora workspaces."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/audit">
              <Button variant="outline" icon={<FileText className="h-4 w-4" />}>
                View activity log
              </Button>
            </Link>
            <Link href="/register-hospital">
              <Button icon={<Plus className="h-4 w-4" />}>
                Enroll Facility
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Pending Facilities"
          value={pendingTenants?.totalElements ?? "-"}
          hint="awaiting license checks"
          tone="amber"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={users?.totalElements ?? "-"}
          hint="patients, doctors, admins"
          tone="brand"
        />
        <StatCard
          icon={FileText}
          label="Activity Entries"
          value={auditLogs?.totalElements ?? "-"}
          hint="latest platform activity"
          tone="sky"
        />
        <StatCard
          icon={Building2}
          label="Facilities to Review"
          value={pendingTenants?.content.length ?? "-"}
          hint="shown in this overview"
          tone="ink"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Pending Facility Approvals
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                New healthcare organizations waiting for admin verification.
              </p>
            </div>
            <Link
              href="/admin/tenants"
              className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex"
            >
              Review all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardContent>
            {tenantsLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!tenantsLoading &&
              (!pendingTenants || pendingTenants.content.length === 0) && (
                <EmptyState
                  icon={Building2}
                  title="No pending facilities"
                  description="All facility registrations are up to date."
                />
              )}
            <div className="space-y-3">
              {pendingTenants?.content.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-950">
                        {t.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink-500">
                        {t.city}, {t.province} - {t.type.replace("_", " ")}
                      </p>
                      <Badge tone="warning" className="mt-2">
                        Credential verification
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/admin/tenants">
                      <Button variant="outline" size="sm">
                        Review facility <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Recent Activity
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Latest facility, account, and care activity.
              </p>
            </div>
            <Link
              href="/admin/audit"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Full log <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardContent>
            {auditLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!auditLoading &&
              (!auditLogs || auditLogs.content.length === 0) && (
                <EmptyState icon={FileText} title="No activity yet" />
              )}
            <div className="space-y-4">
              {auditLogs?.content.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <LockKeyhole className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {log.action}
                      </p>
                      <span className="shrink-0 text-xs font-semibold text-ink-400">
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink-500">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Recently Registered Users
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Latest provider, patient, and admin account activations.
              </p>
            </div>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Manage all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardContent>
            {usersLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            <div className="space-y-3">
              {users?.content.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-2xl border border-ink-100 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={u.username} size={42} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-950">
                        {u.username}
                      </p>
                      <p className="truncate text-xs text-ink-500">{u.email}</p>
                    </div>
                  </div>
                  <Badge tone={u.status === "ACTIVE" ? "success" : "neutral"}>
                    {u.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-2xl bg-ink-950 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <Badge tone="info">Administration</Badge>
          </div>
          <h3 className="mt-6 text-xl font-semibold">
            Privacy & Safety Center
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Manage account permissions, review facility requests, and follow
            recorded platform activity.
          </p>
          <div className="mt-7 space-y-3">
            <Link
              href="/admin/tenants"
              className="flex items-center justify-between rounded-xl bg-white/8 p-4 text-sm text-white/85"
            >
              Review facility registrations <ArrowRight size={16} />
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-xl bg-white/8 p-4 text-sm text-white/85"
            >
              Manage account access <ArrowRight size={16} />
            </Link>
            <Link
              href="/admin/audit"
              className="flex items-center justify-between rounded-xl bg-white/8 p-4 text-sm text-white/85"
            >
              Review activity history <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
