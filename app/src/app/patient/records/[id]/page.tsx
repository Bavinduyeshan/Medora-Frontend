'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Stethoscope,
  Building2,
  HeartPulse,
  Thermometer,
  Wind,
  Weight,
  Ruler,
  Activity,
  Pill,
  FlaskConical,
} from 'lucide-react';
import { medicalApi } from '@/lib/api/medical';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner, ErrorState, EmptyState } from '@/components/ui/Feedback';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ApiError } from '@/lib/http';

export default function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: record, isLoading, error, refetch } = useQuery({
    queryKey: ['record', id],
    queryFn: () => medicalApi.getRecord(id),
  });
  const { data: prescriptions } = useQuery({
    queryKey: ['record-prescriptions', id],
    queryFn: () => medicalApi.recordPrescriptions(id),
  });
  const { data: labReports } = useQuery({
    queryKey: ['record-lab-reports', id],
    queryFn: () => medicalApi.recordLabReports(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (error || !record) {
    return <ErrorState message={error instanceof ApiError ? error.message : 'Record not found.'} onRetry={() => refetch()} />;
  }

  const vitals = [
    { icon: HeartPulse, label: 'Blood Pressure', value: record.bloodPressure },
    { icon: Activity, label: 'Pulse Rate', value: record.pulseRate ? `${record.pulseRate} bpm` : undefined },
    { icon: Thermometer, label: 'Temperature', value: record.temperature ? `${record.temperature} °C` : undefined },
    { icon: Wind, label: 'Oxygen Saturation', value: record.oxygenSaturation ? `${record.oxygenSaturation}%` : undefined },
    { icon: Weight, label: 'Weight', value: record.weightKg ? `${record.weightKg} kg` : undefined },
    { icon: Ruler, label: 'Height', value: record.heightCm ? `${record.heightCm} cm` : undefined },
  ].filter((v) => v.value);

  return (
    <div className="space-y-6">
      <Link href="/patient/records" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to records
      </Link>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-ink-900">{record.diagnosis}</h1>
                <Badge tone={record.status === 'FINAL' ? 'success' : record.status === 'AMENDED' ? 'warning' : 'neutral'}>
                  {record.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-400">Recorded {formatDateTime(record.createdAt)}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl bg-ink-50 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <Stethoscope className="h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="text-[10px] font-bold uppercase text-ink-400">Attending Doctor</p>
                <p className="text-xs font-bold text-ink-800">{record.doctorName || record.doctorId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 shrink-0 text-ink-500" />
              <div>
                <p className="text-[10px] font-bold uppercase text-ink-400">Facility</p>
                <p className="text-xs font-bold text-ink-800">{record.tenantName || record.tenantId}</p>
              </div>
            </div>
          </div>

          <Section title="Chief Complaint" content={record.chiefComplaint} />
          <Section title="Diagnostic Findings" content={record.diagnosticData} />
          <Section title="Treatment Plan" content={record.treatments} />
          <Section title="Follow-up Notes" content={record.followUpNotes} />
          {record.followUpDate && (
            <p className="text-xs text-ink-500">
              <span className="font-bold text-ink-700">Follow-up date:</span> {formatDate(record.followUpDate)}
            </p>
          )}

          {vitals.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">Vital Signs</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {vitals.map((v) => (
                  <div key={v.label} className="rounded-xl border border-ink-100 p-3 text-center">
                    <v.icon className="mx-auto h-4 w-4 text-brand-600" />
                    <p className="mt-1.5 text-sm font-bold text-ink-900">{v.value}</p>
                    <p className="text-[10px] font-semibold text-ink-400">{v.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="flex items-center gap-2 p-5 sm:p-6 pb-0">
          <Pill className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-bold text-ink-900">Prescriptions</h3>
        </div>
        <CardContent>
          {(!prescriptions || prescriptions.length === 0) && (
            <EmptyState title="No prescriptions on this record" />
          )}
          <div className="space-y-4">
            {prescriptions?.map((p) => (
              <div key={p.id} className="rounded-xl border border-ink-100 p-4">
                {p.notes && <p className="mb-2 text-xs italic text-ink-500">{p.notes}</p>}
                <div className="space-y-2">
                  {p.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2">
                      <div>
                        <p className="text-xs font-bold text-ink-800">{item.medicineName}</p>
                        <p className="text-[11px] text-ink-500">
                          {item.dosage} · {item.frequency} · {item.duration}
                        </p>
                      </div>
                      {item.dispensed && <Badge tone="success">Dispensed</Badge>}
                    </div>
                  ))}
                </div>
                {p.validUntil && <p className="mt-2 text-[11px] text-ink-400">Valid until {formatDate(p.validUntil)}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="flex items-center gap-2 p-5 sm:p-6 pb-0">
          <FlaskConical className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-bold text-ink-900">Lab Reports</h3>
        </div>
        <CardContent>
          {(!labReports || labReports.length === 0) && <EmptyState title="No lab reports linked to this record" />}
          <div className="space-y-2.5">
            {labReports?.map((lr) => (
              <div key={lr.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5">
                <div>
                  <p className="text-xs font-bold text-ink-800">{lr.title}</p>
                  <p className="text-[11px] text-ink-500">{lr.resultsSummary}</p>
                </div>
                {lr.flagged && <Badge tone="danger">Flagged</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-400">{title}</h3>
      <p className="text-sm text-ink-700">{content}</p>
    </div>
  );
}
