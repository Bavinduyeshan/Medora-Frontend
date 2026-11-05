"use client";

import { AppointmentWorkspace } from "@/components/appointments/AppointmentWorkspace";
import { LabReportWorkspace } from "@/components/medical/LabReportWorkspace";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileBarChart,
  LayoutGrid,
  MapPin,
  Phone,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useTenant,
  useTenantAffiliations,
  useTenantAppointments,
  useTenantDepartments,
} from "@/hooks/useHospitalData";
import { Card, CardContent } from "@/components/ui/Card";
import {
  PageHeader,
  StatCard,
  Spinner,
  EmptyState,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";

function HospitalAdminDashboard() {
  const { user } = useAuth();
  const { data: tenant } = useTenant(user?.tenantId ?? undefined);
  const { data: affiliations, isLoading: affLoading } = useTenantAffiliations(
    user?.tenantId ?? undefined,
  );
  const { data: departments } = useTenantDepartments(
    user?.tenantId ?? undefined,
  );
  const { data: appointments, isLoading: apptLoading } = useTenantAppointments(
    user?.tenantId ?? undefined,
  );

  const activeDoctors =
    affiliations?.filter((a) => a.status === "ACTIVE").length ?? 0;
  const pendingRequests =
    affiliations?.filter((a) => a.status === "PENDING").length ?? 0;
  const upcoming = appointments
    ?.filter((a) => a.status === "SCHEDULED" || a.status === "RESCHEDULED")
    .sort(
      (a, b) =>
        new Date(a.appointmentStart).getTime() -
        new Date(b.appointmentStart).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={tenant?.type?.replace("_", " ") || "Facility Portal"}
        title={tenant?.name || "Facility Dashboard"}
        description={
          tenant
            ? `${tenant.address}, ${tenant.city}, ${tenant.province}`
            : "Manage doctors, departments, appointments, and facility reports from one operating workspace."
        }
        actions={
          <div className="flex items-center gap-3">
            <Badge tone={tenant?.status === "APPROVED" ? "success" : "warning"}>
              {tenant?.status || "PENDING"}
            </Badge>
            <Link href="/hospital/reports">
              <Button icon={<FileBarChart className="h-4 w-4" />}>
                Reports
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users2}
          label="Active Doctors"
          value={activeDoctors}
          hint="approved clinicians"
          tone="brand"
        />
        <StatCard
          icon={Users2}
          label="Pending Requests"
          value={pendingRequests}
          hint="credential reviews"
          tone="amber"
        />
        <StatCard
          icon={LayoutGrid}
          label="Departments"
          value={departments?.length ?? "-"}
          hint="care units"
          tone="sky"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Visits"
          value={upcoming?.length ?? "-"}
          hint="next scheduled visits"
          tone="ink"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Upcoming Appointments
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Facility schedule across departments and affiliated doctors.
              </p>
            </div>
          </div>
          <CardContent>
            {apptLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!apptLoading && (!upcoming || upcoming.length === 0) && (
              <EmptyState icon={CalendarDays} title="Nothing scheduled" />
            )}
            <div className="space-y-3">
              {upcoming?.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-2xl border border-ink-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-950">
                        {a.doctorName || "Doctor"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink-500">
                        {formatDateTime(a.appointmentStart)}
                      </p>
                    </div>
                  </div>
                  <Badge tone="brand">{a.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="border-b border-ink-100 px-6 py-5">
            <h3 className="text-lg font-semibold text-ink-950">
              Facility Details
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Verified registration profile for this workspace.
            </p>
          </div>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-ink-50 p-4 text-sm font-semibold text-ink-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              {tenant
                ? `${tenant.address}, ${tenant.city}, ${tenant.province} ${tenant.postalCode}`
                : "-"}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-4 text-sm font-semibold text-ink-700">
              <Phone className="h-4 w-4 shrink-0 text-brand-600" />
              {tenant?.phone || "-"}
            </div>
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-bold text-brand-700">
              Registration No. {tenant?.registrationNumber || "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Doctor Affiliations
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Credentialed clinicians connected to this facility.
              </p>
            </div>
            <Link
              href="/hospital/affiliations"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Manage all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardContent>
            {affLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {affiliations?.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-ink-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-950">
                        {a.doctorName || a.doctorId}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink-500">
                        {a.roleAtTenant}
                      </p>
                    </div>
                    <Badge
                      tone={
                        a.status === "ACTIVE"
                          ? "success"
                          : a.status === "PENDING"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {a.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-2xl bg-ink-950 p-6 text-white shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">
            Keep your facility connected
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Facility admins coordinate doctor access, department capacity, and
            scheduled visits through clear Medora workflows.
          </p>
          <div className="mt-7 space-y-3">
            {[
              "Approved doctor scope",
              "Department routing",
              "Clear activity reviews",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-sm font-bold text-white/82"
              >
                <CheckCircle2 className="h-4 w-4 text-cyan-200" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HospitalDashboardPage() {
  const { user } = useAuth();
  if (user?.role === "RECEPTIONIST") return <AppointmentWorkspace />;
  if (user?.role === "LAB_TECHNICIAN") return <LabReportWorkspace />;
  return <HospitalAdminDashboard />;
}
