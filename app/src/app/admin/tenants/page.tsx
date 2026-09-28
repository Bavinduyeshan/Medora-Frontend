'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, CheckCircle2, XCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useApproveTenant, usePendingTenants, useRejectTenant } from '@/hooks/useAdminData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Textarea } from '@/components/ui/Field';
import { Card, CardContent } from '@/components/ui/Card';
import { ApiError } from '@/lib/http';
import type { TenantDto } from '@/types/api';

function RejectModal({ tenant, onClose }: { tenant: TenantDto | null; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const rejectTenant = useRejectTenant();

  if (!tenant) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rejectTenant.mutateAsync({ id: tenant.id, reason });
      toast.success(`${tenant.name} was rejected.`);
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not reject facility.');
    }
  };

  return (
    <Modal isOpen title={`Reject ${tenant.name}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Reason for rejection" required>
          <Textarea required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain what needs correcting…" />
        </Field>
        <Button type="submit" variant="danger" className="w-full" loading={rejectTenant.isPending}>
          Confirm rejection
        </Button>
      </form>
    </Modal>
  );
}

export default function AdminTenantsPage() {
  const { data: pendingTenants, isLoading, error, refetch } = usePendingTenants(0, 50);
  const approveTenant = useApproveTenant();
  const [rejecting, setRejecting] = useState<TenantDto | null>(null);

  const onApprove = async (tenant: TenantDto) => {
    try {
      await approveTenant.mutateAsync(tenant.id);
      toast.success(`${tenant.name} approved and activated.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not approve facility.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Onboarding" title="Facility Approvals" description="Review and verify registration details before activating a facility." />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!pendingTenants || pendingTenants.content.length === 0) && (
        <EmptyState icon={Building2} title="Nothing to review" description="All facility registrations have been processed." />
      )}

      <div className="space-y-4">
        {pendingTenants?.content.map((t) => (
          <Card key={t.id}>
            <CardContent>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-ink-900">{t.name}</h3>
                    <Badge tone="neutral">{t.type.replace('_', ' ')}</Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-ink-500">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {t.address}, {t.city}, {t.province} {t.postalCode}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {t.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {t.email}
                    </p>
                    <p>Registration No. {t.registrationNumber}</p>
                    {t.licenseDocumentUrl && (
                      <a href={t.licenseDocumentUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 hover:underline">
                        View license document
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" icon={<CheckCircle2 className="h-3.5 w-3.5" />} loading={approveTenant.isPending} onClick={() => onApprove(t)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => setRejecting(t)}>
                    Reject
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
