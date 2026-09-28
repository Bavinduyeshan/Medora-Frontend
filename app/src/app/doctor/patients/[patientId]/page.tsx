'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FilePlus, FileText, Stethoscope, Building2, AlertCircle } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (error || !patient) {
    return <ErrorState message={error instanceof ApiError ? error.message : 'Patient not found.'} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <Link href="/doctor" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <Card>
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink-900">{fullName(patient.firstName, patient.lastName)}</h1>
            <p className="mt-1 text-xs text-ink-500">
              {ageFromDob(patient.dateOfBirth)} yrs · {patient.gender?.replace('_', ' ')} · Blood group {formatBloodGroup(patient.bloodGroup)}
            </p>
            {patient.allergies && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <AlertCircle className="h-3.5 w-3.5" /> Allergies: {patient.allergies}
              </p>
            )}
          </div>
          <Button icon={<FilePlus className="h-4 w-4" />} onClick={() => setNewRecordOpen(true)} disabled={!activeTenantId}>
            New Diagnosis
          </Button>
        </CardContent>
        {!activeTenantId && (
          <p className="border-t border-ink-100 px-6 py-3 text-xs font-medium text-amber-700">
            Check in to a facility from your dashboard before writing a new record.
          </p>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 p-5 sm:p-6 pb-0">
          <FileText className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-bold text-ink-900">Medical history</h3>
        </div>
        <CardContent>
          {historyLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {!historyLoading && (!history || history.length === 0) && (
            <EmptyState title="No prior records" description="This will be the patient's first record in the network." />
          )}
          <div className="space-y-3">
            {history?.map((r) => (
              <div key={r.id} className="rounded-xl border border-ink-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-ink-800">{r.diagnosis}</p>
                  <Badge tone={r.status === 'FINAL' ? 'success' : 'neutral'}>{r.status}</Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" /> {r.doctorName || r.doctorId}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {r.tenantName || r.tenantId}
                  </span>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
                {r.chiefComplaint && <p className="mt-1.5 text-xs text-ink-400">Complaint: {r.chiefComplaint}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NewDiagnosisModal
        isOpen={newRecordOpen}
        onClose={() => setNewRecordOpen(false)}
        patientId={patientId}
        patientName={fullName(patient.firstName, patient.lastName)}
      />
    </div>
  );
}
