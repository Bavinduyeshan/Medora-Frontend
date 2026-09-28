'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Building2, CalendarDays, Users, ArrowRight } from 'lucide-react';
import { useCurrentDoctor, useDoctorAffiliations, useDoctorAppointments } from '@/hooks/useDoctorData';
import { useActiveWorkspace } from '@/hooks/useActiveWorkspace';
import { CheckInPanel, AffiliationStatusNote } from '@/components/doctor/CheckInPanel';
import { ScanQrModal } from '@/components/qr/ScanQrModal';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader, StatCard, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fullName, formatDateTime } from '@/lib/utils';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { data: doctor } = useCurrentDoctor();
  const { data: affiliations, isLoading: affLoading } = useDoctorAffiliations(doctor?.id);
  const { data: appointments, isLoading: apptLoading } = useDoctorAppointments(doctor?.id);
  const { activeTenantId } = useActiveWorkspace();
  const [scanOpen, setScanOpen] = useState(false);

  const activeCount = affiliations?.filter((a) => a.status === 'ACTIVE').length ?? 0;
  const upcoming = appointments
    ?.filter((a) => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED')
    .sort((a, b) => new Date(a.appointmentStart).getTime() - new Date(b.appointmentStart).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Doctor Portal"
        title={`Dr. ${doctor ? fullName(doctor.firstName, doctor.lastName) : ''}`}
        description={doctor ? `${doctor.specialization} · ${doctor.experienceYears} years of experience · SLMC ${doctor.slmcNumber}` : ''}
        actions={
          <Button icon={<QrCode className="h-4 w-4" />} onClick={() => setScanOpen(true)}>
            Scan Patient QR
          </Button>
        }
      />

      {affLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <CheckInPanel affiliations={affiliations ?? []} />
      )}
      <AffiliationStatusNote />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Active Affiliations" value={activeCount} tone="brand" />
        <StatCard icon={CalendarDays} label="Upcoming Appointments" value={upcoming?.length ?? '—'} tone="sky" />
        <StatCard icon={Users} label="Total Affiliations" value={affiliations?.length ?? '—'} tone="ink" />
      </div>

      <Card>
        <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
          <h3 className="text-base font-bold text-ink-900">Upcoming appointments</h3>
        </div>
        <CardContent>
          {apptLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {!apptLoading && (!upcoming || upcoming.length === 0) && (
            <EmptyState icon={CalendarDays} title="No upcoming appointments" description="Appointments booked with you will appear here." />
          )}
          <div className="space-y-2.5">
            {upcoming?.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5">
                <div>
                  <p className="text-xs font-bold text-ink-800">{a.tenantName || 'Facility'}</p>
                  <p className="text-[11px] text-ink-500">{formatDateTime(a.appointmentStart)}</p>
                </div>
                <Badge tone="brand">{a.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
          <h3 className="text-base font-bold text-ink-900">Your affiliations</h3>
          <a href="/doctor/affiliations" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {affiliations?.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5">
                <div>
                  <p className="text-xs font-bold text-ink-800">{a.tenantName || a.tenantId}</p>
                  <p className="text-[11px] text-ink-500">{a.roleAtTenant}</p>
                </div>
                <Badge tone={a.status === 'ACTIVE' ? 'success' : a.status === 'PENDING' ? 'warning' : 'neutral'}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScanQrModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        tenantId={activeTenantId}
        onScanned={(patientId) => router.push(`/doctor/patients/${patientId}`)}
      />
    </div>
  );
}
