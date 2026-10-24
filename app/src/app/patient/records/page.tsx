'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Search, ChevronRight, Stethoscope, Building2 } from 'lucide-react';
import { useCurrentPatient, usePatientRecords } from '@/hooks/usePatientData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { formatDate } from '@/lib/utils';
import { ApiError } from '@/lib/http';

export default function PatientRecordsPage() {
  const { data: patient } = useCurrentPatient();
  const { data: records, isLoading, error, refetch } = usePatientRecords(patient?.id);
  const [query, setQuery] = useState('');

  const filtered = records?.filter(
    (r) =>
      r.diagnosis.toLowerCase().includes(query.toLowerCase()) ||
      r.doctorName?.toLowerCase().includes(query.toLowerCase()) ||
      r.tenantName?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Health Records"
        title="Medical Records"
        description="Every diagnosis recorded across the Medora network, in one timeline."
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input placeholder="Search by diagnosis, doctor, facility…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!filtered || filtered.length === 0) && (
        <EmptyState icon={FileText} title="No records found" description="Your diagnoses and clinical notes will appear here after a visit." />
      )}

      <div className="space-y-3">
        {filtered?.map((r) => (
          <Link
            key={r.id}
            href={`/patient/records/${r.id}`}
            className="flex flex-col gap-3 rounded-2xl border border-brand-100/70 bg-white p-5 shadow-[var(--shadow-card)] transition-colors hover:bg-ink-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-black text-ink-950">{r.diagnosis}</h3>
                <Badge tone={r.status === 'FINAL' ? 'success' : r.status === 'AMENDED' ? 'warning' : 'neutral'}>{r.status}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" /> {r.doctorName || 'Attending doctor'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {r.tenantName || 'Facility'}
                </span>
                <span>{formatDate(r.createdAt)}</span>
              </div>
              {r.chiefComplaint && <p className="line-clamp-1 text-xs text-ink-400">Chief complaint: {r.chiefComplaint}</p>}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
