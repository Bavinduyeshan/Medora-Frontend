"use client";

import { AccountProvisioning } from "@/components/admin/AccountProvisioning";
import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle2,
  Mail,
  CalendarDays,
} from "lucide-react";
import { useUpdateUserStatus, useUsers } from "@/hooks/useAdminData";
import {
  PageHeader,
  EmptyState,
  Spinner,
  ErrorState,
  Avatar,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, roleLabel } from "@/lib/utils";
import { ApiError } from "@/lib/http";
import type { AccountStatus } from "@/types/api";

const STATUS_TONE: Record<
  AccountStatus,
  "success" | "neutral" | "danger" | "warning"
> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  SUSPENDED: "danger",
  PENDING_VERIFICATION: "warning",
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const { data: users, isLoading, error, refetch } = useUsers(page, 20);
  const updateStatus = useUpdateUserStatus();

  const onToggle = async (id: string, current: AccountStatus) => {
    const next: AccountStatus =
      current === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await updateStatus.mutateAsync({ id, status: next });
      toast.success(
        `Account ${next === "SUSPENDED" ? "paused" : "reactivated"}.`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not update account status.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="People Directory"
        actions={<AccountProvisioning />}
        description="Review patients, doctors, facility staff, and admins using Medora."
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && (
        <ErrorState
          message={(error as ApiError).message}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !error && (!users || users.content.length === 0) && (
        <EmptyState icon={Users} title="No people found" />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {users?.content.map((u) => (
          <Card
            key={u.id}
            className="border-brand-100/70 transition-all hover:shadow-sm hover:border-brand-200"
          >
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={u.username} size={46} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-950">
                      {u.username}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-semibold text-ink-500">
                      <Mail className="h-3.5 w-3.5" /> {u.email}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                      <CalendarDays className="h-3.5 w-3.5" /> Joined{" "}
                      {formatDate(u.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[u.status]}>
                  {u.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                <Badge tone="brand">{roleLabel(u.role)}</Badge>
                {["HOSPITAL_ADMIN", "RECEPTIONIST", "LAB_TECHNICIAN"].includes(
                  u.role,
                ) && <AccountProvisioning account={u} />}
                <Button
                  size="sm"
                  variant={u.status === "SUSPENDED" ? "outline" : "ghost"}
                  icon={
                    u.status === "SUSPENDED" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Ban className="h-3.5 w-3.5" />
                    )
                  }
                  onClick={() => onToggle(u.id, u.status)}
                >
                  {u.status === "SUSPENDED" ? "Reactivate" : "Pause access"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users && users.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-3 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-ink-500">
            Page {users.number + 1} of {users.totalPages} -{" "}
            {users.totalElements} people
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={users.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              icon={<ChevronLeft className="h-3.5 w-3.5" />}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={users.last}
              onClick={() => setPage((p) => p + 1)}
              icon={<ChevronRight className="h-3.5 w-3.5" />}
              className="flex-row-reverse"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
