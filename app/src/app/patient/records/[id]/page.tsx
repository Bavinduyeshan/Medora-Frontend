'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Stethoscope, Building2, HeartPulse, Thermometer, Wind, Weight, Ruler, Activity, Pill, FlaskConical } from 'lucide-react';
import { medicalApi } from '@/lib/api/medical';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner, ErrorState, EmptyState } from '@/components/ui/Feedback';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ApiError } from '@/lib/http';

export default function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: record, isLoading, error, refetch } = useQuery({ queryKey: ['record', id], queryFn: () => medicalApi.getRecord(id) });
  const { data: prescriptions } = useQuery({ queryKey: ['record-prescriptions', id], queryFn: () => medicalApi.recordPrescriptions(id) });
  const { data: labReports } = useQuery({ queryKey: ['record-lab-reports', id], queryFn: () => medicalApi.recordLabReports(id) });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error || !record) return <ErrorState message={error instanceof ApiError ? error.message : 'Record not found.'} onRetry={() => refetch()} />;

  const vitals = [
    { icon: HeartPulse, label: 'Blood Pressure', value: record.bloodPressure },
    { icon: Activity, label: 'Pulse Rate', value: record.pulseRate ? `${record.pulseRate} bpm` : undefined },
    { icon: Thermometer, label: 'Temperature', value: record.temperature ? `${record.temperature} C` : undefined },
    { icon: Wind, label: 'Oxygen Saturation', value: record.oxygenSaturation ? `${record.oxygenSaturation}%` : undefined },
    { icon: Weight, label: 'Weight', value: record.weightKg ? `${record.weightKg} kg` : undefined },
    { icon: Ruler, label: 'Height', value: record.heightCm ? `${record.heightCm} cm` : undefined },
  ].filter((v) => v.value);

  return (
    <div className="space-y-6">
      <Link href="/patient/records" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to records
      </Link>

      <div className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0b5fff_0%,#0ea5e9_58%,#ffffff_160%)] p-6 text-white shadow-2xl shadow-brand-950/15">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-white/70">Care record</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-normal">{record.diagnosis}</h1>
              <Badge tone={record.status === 'FINAL' ? 'success' : record.status === 'AMENDED' ? 'warning' : 'neutral'}>{record.status}</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-white/75">Recorded {formatDateTime(record.createdAt)}</p>
          </div>
        </div>
      </div>

      <Card className="border-brand-100/70">
        <CardContent className="space-y-6">
          <div className="grid gap-3 rounded-2xl bg-brand-50/70 p-4 sm:grid-cols-2">
            <InfoRow icon={Stethoscope} label="Attending Doctor" value={record.doctorName || record.doctorId} />
            <InfoRow icon={Building2} label="Facility" value={record.tenantName || record.tenantId} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Main Concern" content={record.chiefComplaint} />
            <Section title="Findings" content={record.diagnosticData} />
            <Section title="Care Plan" content={record.treatments} />
            <Section title="Follow-up Notes" content={record.followUpNotes} />
          </div>
          {record.followUpDate && <p className="text-sm font-semibold text-ink-600"><span className="font-black text-ink-900">Follow-up date:</span> {formatDate(record.followUpDate)}</p>}

          {vitals.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-brand-600">Vital Signs</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {vitals.map((v) => (
                  <div key={v.label} className="rounded-2xl border border-brand-100/70 bg-white p-4 text-center shadow-sm">
                    <v.icon className="mx-auto h-4 w-4 text-brand-600" />
                    <p className="mt-2 text-sm font-black text-ink-950">{v.value}</p>
                    <p className="text-[10px] font-semibold text-ink-400">{v.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-brand-100/70">
        <div className="flex items-center gap-2 border-b border-ink-100 px-6 py-5">
          <Pill className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-black text-ink-950">Prescriptions</h3>
        </div>
        <CardContent>
          {(!prescriptions || prescriptions.length === 0) && <EmptyState title="No prescriptions on this record" />}
          <div className="space-y-4">
            {prescriptions?.map((p) => (
              <div key={p.id} className="rounded-2xl border border-brand-100/70 p-4">
                {p.notes && <p className="mb-3 text-sm italic text-ink-500">{p.notes}</p>}
                <div className="space-y-2">
                  {p.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-black text-ink-950">{item.medicineName}</p>
                        <p className="text-xs text-ink-500">{item.dosage} - {item.frequency} - {item.duration}</p>
                      </div>
                      {item.dispensed && <Badge tone="success">Dispensed</Badge>}
                    </div>
                  ))}
                </div>
                {p.validUntil && <p className="mt-3 text-xs font-semibold text-ink-400">Valid until {formatDate(p.validUntil)}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-100/70">
        <div className="flex items-center gap-2 border-b border-ink-100 px-6 py-5">
          <FlaskConical className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-black text-ink-950">Lab Reports</h3>
        </div>
        <CardContent>
          {(!labReports || labReports.length === 0) && <EmptyState title="No lab reports linked to this record" />}
          <div className="space-y-2.5">
            {labReports?.map((lr) => (
              <div key={lr.id} className="flex items-center justify-between rounded-2xl border border-brand-100/70 p-4">
                <div>
                  <p className="text-sm font-black text-ink-950">{lr.title}</p>
                  <p className="text-xs text-ink-500">{lr.resultsSummary}</p>
                </div>
                {lr.flagged && <Badge tone="danger">Needs review</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Stethoscope; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-700">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wide text-ink-400">{label}</p>
        <p className="text-sm font-black text-ink-950">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="rounded-2xl border border-brand-100/70 bg-white p-4">
      <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-brand-600">{title}</h3>
      <p className="text-sm leading-6 text-ink-700">{content}</p>
    </div>
  );
}