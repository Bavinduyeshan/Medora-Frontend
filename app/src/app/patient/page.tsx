'use client';

import Link from 'next/link';
import { FileText, Pill, CalendarDays, QrCode, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { useCurrentPatient, usePatientAppointments, usePatientRecords } from '@/hooks/usePatientData';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader, StatCard, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { ageFromDob, formatBloodGroup, formatDate, formatDateTime, fullName } from '@/lib/utils';

export default function PatientDashboardPage() {
  const { data: patient } = useCurrentPatient();
  const { data: records, isLoading: recordsLoading } = usePatientRecords(patient?.id);
  const { data: appointments, isLoading: apptsLoading } = usePatientAppointments(patient?.id);

  const upcoming = appointments?.filter((a) => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED').slice(0, 3);
  const recentRecords = records?.slice(0, 4);
  const allergiesList = patient?.allergies?.split(',').map((a) => a.trim()).filter(Boolean) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Patient Portal"
        title={`Welcome back, ${patient ? fullName(patient.firstName, patient.lastName) : ''}`}
        description="Your complete medical history, wherever you receive care."
        actions={
          <Link href="/patient/qr">
            <span className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              <QrCode className="h-4 w-4" /> Show my QR
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={FileText} label="Medical Records" value={records?.length ?? '—'} tone="brand" />
        <StatCard icon={CalendarDays} label="Upcoming Visits" value={upcoming?.length ?? '—'} tone="sky" />
        <StatCard icon={AlertCircle} label="Allergies" value={allergiesList.length} tone="amber" />
        <StatCard icon={Pill} label="Blood Group" value={formatBloodGroup(patient?.bloodGroup)} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Recent medical records</h3>
            <Link href="/patient/records" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CardContent>
            {recordsLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!recordsLoading && (!recentRecords || recentRecords.length === 0) && (
              <EmptyState icon={FileText} title="No records yet" description="Your diagnoses and visits will appear here after your first appointment." />
            )}
            <div className="space-y-3">
              {recentRecords?.map((r) => (
                <Link
                  key={r.id}
                  href={`/patient/records/${r.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-4 transition-colors hover:bg-ink-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-800">{r.diagnosis}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-400">
                      {r.doctorName || 'Attending doctor'} · {r.tenantName || 'Facility'} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <Badge tone={r.status === 'FINAL' ? 'success' : r.status === 'AMENDED' ? 'warning' : 'neutral'}>
                    {r.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Upcoming appointments</h3>
          </div>
          <CardContent>
            {apptsLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!apptsLoading && (!upcoming || upcoming.length === 0) && (
              <EmptyState icon={CalendarDays} title="Nothing scheduled" description="Appointments booked by a facility will show up here." />
            )}
            <div className="space-y-3">
              {upcoming?.map((a) => (
                <div key={a.id} className="rounded-xl border border-ink-100 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-800">
                    <Building2 className="h-3.5 w-3.5 text-brand-600" />
                    {a.tenantName || 'Facility'}
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{a.doctorName || 'Doctor TBD'}</p>
                  <p className="mt-1 text-[11px] font-semibold text-ink-400">{formatDateTime(a.appointmentStart)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <div className="p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Health snapshot</h3>
          </div>
          <CardContent className="space-y-3">
            <Row label="Date of birth" value={`${formatDate(patient?.dateOfBirth)}${patient ? ` (${ageFromDob(patient.dateOfBirth)} yrs)` : ''}`} />
            <Row label="Gender" value={patient?.gender?.replace('_', ' ') || '—'} />
            <Row label="Blood group" value={formatBloodGroup(patient?.bloodGroup)} />
            <Row label="Chronic conditions" value={patient?.chronicConditions || 'None reported'} />
            <Row label="Allergies" value={patient?.allergies || 'None reported'} />
          </CardContent>
        </Card>

        <Card>
          <div className="p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Emergency & contact</h3>
          </div>
          <CardContent className="space-y-3">
            <Row label="Emergency contact" value={patient?.emergencyContactName || '—'} />
            <Row label="Emergency phone" value={patient?.emergencyContactPhone || '—'} />
            <Row label="Phone" value={patient?.phone || '—'} />
            <Row label="Address" value={patient ? `${patient.address}, ${patient.city}, ${patient.province}` : '—'} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-50 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs font-semibold text-ink-400">{label}</span>
      <span className="text-right text-xs font-bold text-ink-800">{value}</span>
    </div>
  );
}
