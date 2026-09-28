'use client';

import Link from 'next/link';
import { Users2, LayoutGrid, CalendarDays, ArrowRight, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant, useTenantAffiliations, useTenantAppointments, useTenantDepartments } from '@/hooks/useHospitalData';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader, StatCard, Spinner, EmptyState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';

export default function HospitalDashboardPage() {
  const { user } = useAuth();
  const { data: tenant } = useTenant(user?.tenantId ?? undefined);
  const { data: affiliations, isLoading: affLoading } = useTenantAffiliations(user?.tenantId ?? undefined);
  const { data: departments } = useTenantDepartments(user?.tenantId ?? undefined);
  const { data: appointments, isLoading: apptLoading } = useTenantAppointments(user?.tenantId ?? undefined);

  const activeDoctors = affiliations?.filter((a) => a.status === 'ACTIVE').length ?? 0;
  const pendingRequests = affiliations?.filter((a) => a.status === 'PENDING').length ?? 0;
  const upcoming = appointments
    ?.filter((a) => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED')
    .sort((a, b) => new Date(a.appointmentStart).getTime() - new Date(b.appointmentStart).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={tenant?.type?.replace('_', ' ')}
        title={tenant?.name || 'Facility Dashboard'}
        description={tenant ? `${tenant.address}, ${tenant.city}, ${tenant.province}` : ''}
        actions={<Badge tone={tenant?.status === 'APPROVED' ? 'success' : 'warning'}>{tenant?.status}</Badge>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users2} label="Active Doctors" value={activeDoctors} tone="brand" />
        <StatCard icon={Users2} label="Pending Requests" value={pendingRequests} tone="amber" />
        <StatCard icon={LayoutGrid} label="Departments" value={departments?.length ?? '—'} tone="sky" />
        <StatCard icon={CalendarDays} label="Upcoming Visits" value={upcoming?.length ?? '—'} tone="ink" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Upcoming appointments</h3>
          </div>
          <CardContent>
            {apptLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!apptLoading && (!upcoming || upcoming.length === 0) && <EmptyState icon={CalendarDays} title="Nothing scheduled" />}
            <div className="space-y-2.5">
              {upcoming?.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5">
                  <div>
                    <p className="text-xs font-bold text-ink-800">{a.doctorName || 'Doctor'}</p>
                    <p className="text-[11px] text-ink-500">{formatDateTime(a.appointmentStart)}</p>
                  </div>
                  <Badge tone="brand">{a.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-5 sm:p-6 pb-0">
            <h3 className="text-base font-bold text-ink-900">Facility details</h3>
          </div>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-ink-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
              {tenant ? `${tenant.address}, ${tenant.city}, ${tenant.province} ${tenant.postalCode}` : '—'}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-ink-600">
              <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" />
              {tenant?.phone}
            </div>
            <div className="text-xs text-ink-500">Registration No. {tenant?.registrationNumber}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
          <h3 className="text-base font-bold text-ink-900">Doctor affiliations</h3>
          <Link href="/hospital/affiliations" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
            Manage all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardContent>
          {affLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {affiliations?.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3.5">
                <div>
                  <p className="text-xs font-bold text-ink-800">{a.doctorName || a.doctorId}</p>
                  <p className="text-[11px] text-ink-500">{a.roleAtTenant}</p>
                </div>
                <Badge tone={a.status === 'ACTIVE' ? 'success' : a.status === 'PENDING' ? 'warning' : 'neutral'}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
