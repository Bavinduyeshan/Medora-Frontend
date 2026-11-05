"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import {
  useApproveTenant,
  usePendingTenants,
  useRejectTenant,
} from "@/hooks/useAdminData";
import {
  PageHeader,
  EmptyState,
  Spinner,
  ErrorState,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Textarea } from "@/components/ui/Field";
import { Card, CardContent } from "@/components/ui/Card";
import { ApiError } from "@/lib/http";
import type { TenantDto } from "@/types/api";

function RejectModal({
  tenant,
  onClose,
}: {
  tenant: TenantDto | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const rejectTenant = useRejectTenant();

  if (!tenant) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rejectTenant.mutateAsync({ id: tenant.id, reason });
      toast.success(`${tenant.name} was sent back for updates.`);
      onClose();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not update facility review.",
      );
    }
  };

  return (
    <Modal
      isOpen
      title={`Request updates for ${tenant.name}`}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="What needs to be corrected?" required>
          <Textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what the facility should update before approval."
          />
        </Field>
        <Button
          type="submit"
          variant="danger"
          className="w-full"
          loading={rejectTenant.isPending}
        >
          Send update request
        </Button>
      </form>
    </Modal>
  );
}

export default function AdminTenantsPage() {
  const {
    data: pendingTenants,
    isLoading,
    error,
    refetch,
  } = usePendingTenants(0, 50);
  const approveTenant = useApproveTenant();
  const [rejecting, setRejecting] = useState<TenantDto | null>(null);

  const onApprove = async (tenant: TenantDto) => {
    try {
      await approveTenant.mutateAsync(tenant.id);
      toast.success(`${tenant.name} approved and activated.`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not approve facility.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Facility Reviews"
        title="Facility Reviews"
        description="Review new hospitals, clinics, pharmacies, and care centers before they join Medora."
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
      {!isLoading &&
        !error &&
        (!pendingTenants || pendingTenants.content.length === 0) && (
          <EmptyState
            icon={Building2}
            title="Nothing to review"
            description="All facility registrations have been processed."
          />
        )}

      <div className="grid gap-5 xl:grid-cols-2">
        {pendingTenants?.content.map((t) => (
          <Card
            key={t.id}
            className="border-brand-100/70 transition-all hover:shadow-sm hover:border-brand-200"
          >
            <CardContent>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-ink-950">
                        {t.name}
                      </h3>
                      <Badge tone="neutral" className="mt-1">
                        {t.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs font-semibold text-ink-500">
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 text-brand-600" />{" "}
                      {t.address}, {t.city}, {t.province} {t.postalCode}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-brand-600" /> {t.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-brand-600" /> {t.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-brand-600" />{" "}
                      Registration No. {t.registrationNumber}
                    </p>
                    {t.licenseDocumentUrl && (
                      <a
                        href={t.licenseDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex font-semibold text-brand-600 hover:underline"
                      >
                        View license document
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <Button
                    size="sm"
                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    loading={approveTenant.isPending}
                    onClick={() => onApprove(t)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<XCircle className="h-3.5 w-3.5" />}
                    onClick={() => setRejecting(t)}
                  >
                    Request updates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RejectModal tenant={rejecting} onClose={() => setRejecting(null)} />
    </div>
  );
}
