'use client';

import { useState } from 'react';
import { Pill, Search } from 'lucide-react';
import { useCurrentPatient, usePatientPrescriptions } from '@/hooks/usePatientData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { ApiError } from '@/lib/http';

export default function PatientPrescriptionsPage() {
  const { data: patient } = useCurrentPatient();
  const { data: prescriptions, isLoading, error, refetch } = usePatientPrescriptions(patient?.id);
  const [query, setQuery] = useState('');

  const filtered = prescriptions?.filter((p) =>
    p.items.some((i) => i.medicineName.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pharmacy"
        title="Prescriptions"
        description="Medication prescribed to you across every facility in the network."
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input placeholder="Search medicine name…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!filtered || filtered.length === 0) && (
        <EmptyState icon={Pill} title="No prescriptions yet" description="Prescriptions issued during a diagnosis will appear here." />
      )}

      <div className="space-y-4">
        {filtered?.map((p) => (
          <Card key={p.id}>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-400">Issued {formatDate(p.createdAt)}</p>
                {p.validUntil && <Badge tone="info">Valid until {formatDate(p.validUntil)}</Badge>}
              </div>
              {p.notes && <p className="mb-3 text-xs italic text-ink-500">{p.notes}</p>}
              <div className="space-y-2">
                {p.items.map((item) => (
                  <div key={item.id} className="flex flex-col justify-between gap-1 rounded-xl bg-ink-50 p-3.5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-bold text-ink-800">
                        {item.medicineName} {item.dosage && <span className="text-ink-500 font-semibold">· {item.dosage}</span>}
                      </p>
                      <p className="text-xs text-ink-500">
                        {item.frequency} · {item.duration} · {item.route}
                      </p>
                      {item.instructions && <p className="mt-0.5 text-xs text-ink-400">{item.instructions}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isControlled && <Badge tone="warning">Controlled</Badge>}
                      <Badge tone={item.dispensed ? 'success' : 'neutral'}>{item.dispensed ? 'Dispensed' : 'Pending'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
