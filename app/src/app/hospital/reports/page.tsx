"use client";

import { toast } from "sonner";
import { FileBarChart, Download, Plus, Clock3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGenerateReport, useTenantReports } from "@/hooks/useHospitalData";
import {
  PageHeader,
  EmptyState,
  Spinner,
  ErrorState,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/http";
import type { ReportStatus } from "@/types/api";

const STATUS_TONE: Record<
  ReportStatus,
  "brand" | "success" | "warning" | "danger" | "neutral"
> = {
  PENDING: "neutral",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
};

export default function HospitalReportsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? undefined;
  const {
    data: reports,
    isLoading,
    error,
    refetch,
  } = useTenantReports(tenantId);
  const generateReport = useGenerateReport();

  const onGenerate = async () => {
    if (!tenantId) return;
    try {
      await generateReport.mutateAsync({
        reportType: "TENANT_ACTIVITY",
        tenantId,
      });
      toast.success("Report is being prepared.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not prepare report.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Facility Reports"
        description="Prepare simple summaries for facility activity, team reviews, and operational planning."
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            loading={generateReport.isPending}
            onClick={onGenerate}
          >
            Prepare report
          </Button>
        }
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
      {!isLoading && !error && (!reports || reports.length === 0) && (
        <EmptyState
          icon={FileBarChart}
          title="No reports yet"
          description="Prepare your first facility report when you are ready."
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {reports?.map((r) => (
          <Card
            key={r.id}
            className="border-brand-100/70 transition-all hover:shadow-sm hover:border-brand-200"
          >
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <FileBarChart className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-950">
                      {r.reportType.replace("_", " ")}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                      <Clock3 className="h-3.5 w-3.5" /> Requested{" "}
                      {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
              </div>
              {r.status === "COMPLETED" && r.fileUrl && (
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
