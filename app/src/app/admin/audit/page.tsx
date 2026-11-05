"use client";

import { useState } from "react";
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock3,
} from "lucide-react";
import { useAuditLogs } from "@/hooks/useAdminData";
import {
  PageHeader,
  EmptyState,
  Spinner,
  ErrorState,
} from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/http";

export default function AdminAuditPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState("");
  const {
    data: logs,
    isLoading,
    error,
    refetch,
  } = useAuditLogs({ page, size: 25, action: action || undefined });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="Activity History"
        description="A clear timeline of important account, care, and facility actions."
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          placeholder="Search activity by name or action"
          className="pl-9"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(0);
          }}
        />
      </div>

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
      {!isLoading && !error && (!logs || logs.content.length === 0) && (
        <EmptyState icon={ScrollText} title="No activity found" />
      )}

      <div className="space-y-3">
        {logs?.content.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-brand-100/70 bg-white p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <ScrollText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-950">
                    {prettyAction(log.action)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-ink-500">
                    {log.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="info">{roleTag(log.actorRole)}</Badge>
                <span className="flex items-center gap-1 text-[12px] font-semibold text-ink-400">
                  <Clock3 className="h-3.5 w-3.5" />{" "}
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {logs && logs.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-3 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-ink-500">
            Page {logs.number + 1} of {logs.totalPages} - {logs.totalElements}{" "}
            entries
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={logs.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              icon={<ChevronLeft className="h-3.5 w-3.5" />}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={logs.last}
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

function roleTag(role: string) {
  return role.replace("_", " ");
}

function prettyAction(action: string) {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
