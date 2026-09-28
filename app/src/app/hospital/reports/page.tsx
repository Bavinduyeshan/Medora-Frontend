'use client';

import { toast } from 'sonner';
import { FileBarChart, Download, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGenerateReport, useTenantReports } from '@/hooks/useHospitalData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils';
import { ApiError } from '@/lib/http';
import type { ReportStatus } from '@/types/api';

const STATUS_TONE: Record<ReportStatus, 'brand' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  PENDING: 'neutral',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
};

export default function HospitalReportsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? undefined;
  const { data: reports, isLoading, error, refetch } = useTenantReports(tenantId);
  const generateReport = useGenerateReport();

  const onGenerate = async () => {
    if (!tenantId) return;
    try {
      await generateReport.mutateAsync({ reportType: 'TENANT_ACTIVITY', tenantId });
      toast.success('Report generation started.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not generate report.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Activity Reports"
        description="Generate and download activity reports for your facility."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} loading={generateReport.isPending} onClick={onGenerate}>
            Generate report
          </Button>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!reports || reports.length === 0) && (
        <EmptyState icon={FileBarChart} title="No reports generated yet" description="Generate your first facility activity report." />
      )}

      <div className="space-y-3">
        {reports?.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink-900">{r.reportType.replace('_', ' ')}</p>
                <p className="text-xs text-ink-500">Requested {formatDateTime(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                {r.status === 'COMPLETED' && r.fileUrl && (
                  <a href={r.fileUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />}>
                      Download
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
