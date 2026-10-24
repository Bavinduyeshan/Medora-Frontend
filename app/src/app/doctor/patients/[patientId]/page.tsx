'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FilePlus, FileText, Stethoscope, Building2, AlertCircle, HeartPulse } from 'lucide-react';
import { patientsApi } from '@/lib/api/patients';
import { useFullPatientHistory } from '@/hooks/useDoctorData';
import { useActiveWorkspace } from '@/hooks/useActiveWorkspace';
import { NewDiagnosisModal } from '@/components/doctor/NewDiagnosisModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner, ErrorState, EmptyState } from '@/components/ui/Feedback';
import { ageFromDob, formatBloodGroup, formatDate, fullName } from '@/lib/utils';
import { ApiError } from '@/lib/http';

export default function DoctorPatientPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  const { activeTenantId } = useActiveWorkspace();
  const [newRecordOpen, setNewRecordOpen] = useState(false);

  const { data: patient, isLoading, error, refetch } = useQuery({
    queryKey: ['patient-lookup', patientId],
    queryFn: () => patientsApi.getById(patientId),
  });
  const { data: history, isLoading: historyLoading } = useFullPatientHistory(patientId);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error || !patient) return <ErrorState message={error instanceof ApiError ? error.message : 'Patient not found.'} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <Link href="/doctor" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0b5fff_0%,#0ea5e9_58%,#ffffff_160%)] p-6 text-white shadow-2xl shadow-brand-950/15">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/16 backdrop-blur">
              <HeartPulse className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/70">Patient overview</p>
              <h1 className="mt-1 text-3xl font-black tracking-normal">{fullName(patient.firstName, patient.lastName)}</h1>
              <p className="mt-2 text-sm font-semibold text-white/78">
                {ageFromDob(patient.dateOfBirth)} yrs - {patient.gender?.replace('_', ' ')} - Blood group {formatBloodGroup(patient.bloodGroup)}
              </p>
              {patient.allergies && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-300/20 px-3 py-1 text-xs font-black text-amber-50">
                  <AlertCircle className="h-3.5 w-3.5" /> Allergies: {patient.allergies}
                </p>
              )}
            </div>
          </div>
          <Button icon={<FilePlus className="h-4 w-4" />} onClick={() => setNewRecordOpen(true)} disabled={!activeTenantId} className="bg-white text-brand-700 hover:bg-brand-50">
            Add Care Note
          </Button>
        </div>
      </div>

      {!activeTenantId && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Choose a facility from your dashboard before adding a new care note.
        </div>
      )}

      <Card className="border-brand-100/70">
        <div className="flex items-center gap-2 border-b border-ink-100 px-6 py-5">
          <FileText className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-black text-ink-950">Care history</h3>
        </div>
        <CardContent>
          {historyLoading && <div className="flex justify-center py-10"><Spinner /></div>}
          {!historyLoading && (!history || history.length === 0) && <EmptyState title="No prior records" description="This will be the patient's first record in Medora." />}
          <div className="space-y-3">
            {history?.map((r) => (
              <div key={r.id} className="rounded-2xl border border-brand-100/70 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/25">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-ink-950">{r.diagnosis}</p>
                  <Badge tone={r.status === 'FINAL' ? 'success' : 'neutral'}>{r.status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink-500">
                  <span className="flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5 text-brand-600" /> {r.doctorName || r.doctorId}</span>
                  <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-brand-600" /> {r.tenantName || r.tenantId}</span>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
                {r.chiefComplaint && <p className="mt-2 text-xs text-ink-500">Concern: {r.chiefComplaint}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NewDiagnosisModal isOpen={newRecordOpen} onClose={() => setNewRecordOpen(false)} patientId={patientId} patientName={fullName(patient.firstName, patient.lastName)} />
    </div>
  );
}