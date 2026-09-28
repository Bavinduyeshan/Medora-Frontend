'use client';

import { useState } from 'react';
import { ScrollText, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAdminData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { ApiError } from '@/lib/http';

export default function AdminAuditPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState('');
  const { data: logs, isLoading, error, refetch } = useAuditLogs({ page, size: 25, action: action || undefined });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Compliance" title="Audit Log" description="Every clinical action and data access event, platform-wide." />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          placeholder="Filter by action e.g. RECORD_CREATED…"
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
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!logs || logs.content.length === 0) && <EmptyState icon={ScrollText} title="No audit entries found" />}

      <div className="space-y-2.5">
        {logs?.content.map((log) => (
          <div key={log.id} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone="info">{log.action}</Badge>
                <span className="text-[11px] font-semibold text-ink-400">{roleTag(log.actorRole)}</span>
              </div>
              <span className="text-[11px] text-ink-400">{formatDateTime(log.createdAt)}</span>
            </div>
            <p className="mt-2 text-xs text-ink-600">{log.description}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-400">
              {log.targetType && <span>Target: {log.targetType} {log.targetId?.slice(0, 8)}</span>}
              {log.ipAddress && <span>IP: {log.ipAddress}</span>}
            </div>
          </div>
        ))}
      </div>

      {logs && logs.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-400">
            Page {logs.number + 1} of {logs.totalPages} · {logs.totalElements} entries
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={logs.first} onClick={() => setPage((p) => Math.max(0, p - 1))} icon={<ChevronLeft className="h-3.5 w-3.5" />}>
              Prev
            </Button>
            <Button size="sm" variant="outline" disabled={logs.last} onClick={() => setPage((p) => p + 1)} icon={<ChevronRight className="h-3.5 w-3.5" />} className="flex-row-reverse">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function roleTag(role: string) {
  return role.replace('_', ' ');
}
