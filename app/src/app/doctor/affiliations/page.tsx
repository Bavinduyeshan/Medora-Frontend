'use client';

import { Building2, Info } from 'lucide-react';
import { useCurrentDoctor, useDoctorAffiliations } from '@/hooks/useDoctorData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { ApiError } from '@/lib/http';

export default function DoctorAffiliationsPage() {
  const { data: doctor } = useCurrentDoctor();
  const { data: affiliations, isLoading, error, refetch } = useDoctorAffiliations(doctor?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hospital Network"
        title="Affiliations"
        description="Facilities where you can support patient care."
      />

      <div className="flex items-start gap-2.5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-xs text-sky-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Affiliations are granted directly by a hospital&apos;s administrator from their portal, and verified on
        every scan and record write. To join a new facility, ask their admin to add you using your medical registration number.
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!affiliations || affiliations.length === 0) && (
        <EmptyState icon={Building2} title="No affiliations yet" description="Once a hospital adds you, it will appear here." />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {affiliations?.map((a) => (
          <Card key={a.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100">
                    <Building2 className="h-4.5 w-4.5 text-ink-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-ink-950">{a.tenantName || a.tenantId}</p>
                    <p className="text-xs text-ink-500">{a.roleAtTenant}</p>
                  </div>
                </div>
                <Badge tone={a.status === 'ACTIVE' ? 'success' : a.status === 'PENDING' ? 'warning' : 'neutral'}>{a.status}</Badge>
              </div>
              <p className="mt-3 text-[11px] text-ink-400">Since {formatDate(a.createdAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
