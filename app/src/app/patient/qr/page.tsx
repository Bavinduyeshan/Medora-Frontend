"use client";

import { QRCodeSVG } from "qrcode.react";
import { RefreshCcw, ShieldCheck, History } from "lucide-react";
import { toast } from "sonner";
import {
  useCurrentPatient,
  usePatientQr,
  usePatientScanHistory,
  useRegenerateQr,
} from "@/hooks/usePatientData";
import { Card, CardContent } from "@/components/ui/Card";
import {
  PageHeader,
  EmptyState,
  Spinner,
  ErrorState,
} from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/http";

export default function PatientQrPage() {
  const { data: patient } = useCurrentPatient();
  const { data: qr, isLoading, error, refetch } = usePatientQr(patient?.id);
  const { data: history, isLoading: historyLoading } = usePatientScanHistory(
    patient?.id,
  );
  const regenerate = useRegenerateQr(patient?.id);

  const onRegenerate = async () => {
    try {
      await regenerate.mutateAsync();
      toast.success("QR code regenerated. Your old code is now invalid.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not regenerate QR code.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Identity"
        title="My QR Code"
        description="Present this at any Medora-affiliated facility for instant, secure identification."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            {isLoading && (
              <div className="flex h-64 items-center justify-center">
                <Spinner />
              </div>
            )}
            {error && (
              <ErrorState
                message={(error as ApiError).message}
                onRetry={() => refetch()}
              />
            )}
            {qr && (
              <>
                <div className="rounded-2xl border border-brand-100/70 bg-white p-5 shadow-[var(--shadow-card)]">
                  <QRCodeSVG
                    value={qr.qrToken}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                    Token
                  </p>
                  <p className="break-all font-mono text-[12px] text-ink-600">
                    {qr.qrToken}
                  </p>
                </div>
                <p className="text-[12px] text-ink-400">
                  Issued {formatDateTime(qr.issuedAt)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  loading={regenerate.isPending}
                  onClick={onRegenerate}
                  icon={<RefreshCcw className="h-3.5 w-3.5" />}
                >
                  Regenerate code
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 p-5 sm:p-6 pb-0">
            <History className="h-4 w-4 text-brand-600" />
            <h3 className="text-base font-bold text-ink-900">Scan history</h3>
          </div>
          <CardContent>
            {historyLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!historyLoading && (!history || history.content.length === 0) && (
              <EmptyState
                icon={ShieldCheck}
                title="No scans yet"
                description="Every time a doctor or facility scans your QR code, it will be logged here for full transparency."
              />
            )}
            <div className="space-y-2.5">
              {history?.content.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5"
                >
                  <div>
                    <p className="text-xs font-bold text-ink-800">
                      {h.tenantName || h.tenantId}
                    </p>
                    <p className="text-[12px] text-ink-400">
                      Purpose: {h.purpose}
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-ink-400">
                    {formatDateTime(h.scannedAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
