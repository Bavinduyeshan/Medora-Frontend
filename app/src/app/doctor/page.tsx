"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  useCurrentDoctor,
  useDoctorAffiliations,
  useDoctorAppointments,
} from "@/hooks/useDoctorData";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import {
  CheckInPanel,
  AffiliationStatusNote,
} from "@/components/doctor/CheckInPanel";
import { ScanQrModal } from "@/components/qr/ScanQrModal";
import { Card, CardContent } from "@/components/ui/Card";
import {
  PageHeader,
  StatCard,
  EmptyState,
  Spinner,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fullName, formatDateTime } from "@/lib/utils";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { data: doctor } = useCurrentDoctor();
  const { data: affiliations, isLoading: affLoading } = useDoctorAffiliations(
    doctor?.id,
  );
  const { data: appointments, isLoading: apptLoading } = useDoctorAppointments(
    doctor?.id,
  );
  const { activeTenantId } = useActiveWorkspace();
  const [scanOpen, setScanOpen] = useState(false);

  const activeCount =
    affiliations?.filter((a) => a.status === "ACTIVE").length ?? 0;
  const pendingCount =
    affiliations?.filter((a) => a.status === "PENDING").length ?? 0;
  const upcoming = appointments
    ?.filter((a) => a.status === "SCHEDULED" || a.status === "RESCHEDULED")
    .sort(
      (a, b) =>
        new Date(a.appointmentStart).getTime() -
        new Date(b.appointmentStart).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Doctor Portal"
        title={`Dr. ${doctor ? fullName(doctor.firstName, doctor.lastName) : "Clinical Workspace"}`}
        description={
          doctor
            ? `${doctor.specialization} - ${doctor.experienceYears} years of experience - Reg. ${doctor.slmcNumber}`
            : "Review patients, access shared profiles, and work inside approved facility teams."
        }
        actions={
          <Button
            icon={<QrCode className="h-4 w-4" />}
            onClick={() => setScanOpen(true)}
          >
            Scan Patient QR
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Active Affiliations"
          value={activeCount}
          hint="approved facilities"
          tone="brand"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Visits"
          value={upcoming?.length ?? "-"}
          hint="scheduled or rescheduled"
          tone="sky"
        />
        <StatCard
          icon={Users}
          label="Total Affiliations"
          value={affiliations?.length ?? "-"}
          hint="all facility links"
          tone="ink"
        />
        <StatCard
          icon={Clock3}
          label="Pending Reviews"
          value={pendingCount}
          hint="credential checks"
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          {affLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <CheckInPanel affiliations={affiliations ?? []} />
          )}
          <AffiliationStatusNote />
        </div>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Upcoming Appointments
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Your next patient visits across active facilities.
              </p>
            </div>
            <Link
              href="/doctor/appointments"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardContent>
            {apptLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!apptLoading && (!upcoming || upcoming.length === 0) && (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming appointments"
                description="Appointments booked with you will appear here."
              />
            )}
            <div className="space-y-3">
              {upcoming?.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-2xl border border-ink-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-950">
                        {a.tenantName || "Facility"}
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Your Affiliations
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Facility relationships define where you can review and write
                clinical data.
              </p>
            </div>
            <Link
              href="/doctor/affiliations"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {affiliations?.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-ink-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-950">
                        {a.tenantName || a.tenantId}
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
            Before you review a patient
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Patient records unlock only through a valid QR scan, active facility
            context, and an approved doctor affiliation.
          </p>
          <div className="mt-7 space-y-3">
            {[
              "Confirm the patient’s QR identity",
              "Select your current facility",
              "Review the patient’s care history",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-sm font-bold text-white/82"
              >
                <BadgeCheck className="h-4 w-4 text-cyan-200" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScanQrModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        tenantId={activeTenantId}
        onScanned={(patientId) => router.push(`/doctor/patients/${patientId}`)}
      />
    </div>
  );
}
