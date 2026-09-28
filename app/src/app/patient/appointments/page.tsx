'use client';

import { toast } from 'sonner';
import { CalendarDays, Building2, Stethoscope, X } from 'lucide-react';
import { useCancelAppointment, useCurrentPatient, usePatientAppointments } from '@/hooks/usePatientData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { ApiError } from '@/lib/http';
import type { AppointmentStatus } from '@/types/api';

const STATUS_TONE: Record<AppointmentStatus, 'brand' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  SCHEDULED: 'brand',
  RESCHEDULED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function PatientAppointmentsPage() {
  const { data: patient } = useCurrentPatient();
  const { data: appointments, isLoading, error, refetch } = usePatientAppointments(patient?.id);
  const cancelAppointment = useCancelAppointment();

  const onCancel = async (id: string) => {
    try {
      await cancelAppointment.mutateAsync({ id, reason: 'Cancelled by patient' });
      toast.success('Appointment cancelled.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not cancel appointment.');
    }
  };

  const sorted = appointments
    ?.slice()
    .sort((a, b) => new Date(b.appointmentStart).getTime() - new Date(a.appointmentStart).getTime());

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Scheduling" title="Appointments" description="All appointments booked for you across the network." />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!sorted || sorted.length === 0) && (
        <EmptyState icon={CalendarDays} title="No appointments" description="Appointments booked by a hospital or clinic will show up here." />
      )}

      <div className="space-y-3">
        {sorted?.map((a) => (
          <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-ink-900">{formatDateTime(a.appointmentStart)}</p>
                <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" /> {a.doctorName || 'Doctor'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {a.tenantName || 'Facility'}
                </span>
              </div>
              {a.reason && <p className="text-xs text-ink-400">Reason: {a.reason}</p>}
            </div>
            {(a.status === 'SCHEDULED' || a.status === 'RESCHEDULED') && (
              <Button
                variant="outline"
                size="sm"
                icon={<X className="h-3.5 w-3.5" />}
                loading={cancelAppointment.isPending}
                onClick={() => onCancel(a.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
