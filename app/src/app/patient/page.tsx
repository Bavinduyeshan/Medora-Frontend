"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  FileText,
  HeartPulse,
  Pill,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  useCurrentPatient,
  usePatientAppointments,
  usePatientRecords,
} from "@/hooks/usePatientData";
import { Card, CardContent } from "@/components/ui/Card";
import {
  PageHeader,
  StatCard,
  EmptyState,
  Spinner,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import {
  ageFromDob,
  formatBloodGroup,
  formatDate,
  formatDateTime,
  fullName,
} from "@/lib/utils";

export default function PatientDashboardPage() {
  const { data: patient } = useCurrentPatient();
  const { data: records, isLoading: recordsLoading } = usePatientRecords(
    patient?.id,
  );
  const { data: appointments, isLoading: apptsLoading } =
    usePatientAppointments(patient?.id);

  const upcoming = appointments
    ?.filter((a) => a.status === "SCHEDULED" || a.status === "RESCHEDULED")
    .slice(0, 3);
  const recentRecords = records?.slice(0, 4);
  const allergiesList =
    patient?.allergies
      ?.split(",")
      .map((a) => a.trim())
      .filter(Boolean) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Patient Portal"
        title={`Hello, ${patient?.firstName || "there"}.`}
        description="Here’s your health at a glance. Review your records, follow your visits, and keep your care connected."
        actions={
          <Link href="/patient/qr">
            <span className="inline-flex h-12 items-center gap-2 rounded-2xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700">
              <QrCode className="h-4 w-4" /> Show my QR
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Medical Records"
          value={records?.length ?? "-"}
          hint="verified care summaries"
          tone="brand"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Visits"
          value={upcoming?.length ?? "-"}
          hint="scheduled care"
          tone="sky"
        />
        <StatCard
          icon={AlertCircle}
          label="Allergies"
          value={allergiesList.length}
          hint="safety alerts"
          tone="amber"
        />
        <StatCard
          icon={Pill}
          label="Blood Group"
          value={formatBloodGroup(patient?.bloodGroup)}
          hint="clinical profile"
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-950">
                Recent Medical Records
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Latest clinical notes and diagnoses shared by verified care
                teams.
              </p>
            </div>
            <Link
              href="/patient/records"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardContent>
            {recordsLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!recordsLoading &&
              (!recentRecords || recentRecords.length === 0) && (
                <EmptyState
                  icon={FileText}
                  title="No records yet"
                  description="Your diagnoses and visits will appear here after your first appointment."
                />
              )}
            <div className="space-y-3">
              {recentRecords?.map((r) => (
                <Link
                  key={r.id}
                  href={`/patient/records/${r.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 p-4 transition-colors hover:bg-ink-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-950">
                        {r.diagnosis}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-ink-500">
                        {r.doctorName || "Attending doctor"} -{" "}
                        {r.tenantName || "Facility"} - {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    tone={
                      r.status === "FINAL"
                        ? "success"
                        : r.status === "AMENDED"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {r.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="border-b border-ink-100 px-6 py-5">
            <h3 className="text-lg font-semibold text-ink-950">
              Upcoming Appointments
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Scheduled visits from connected facilities.
            </p>
          </div>
          <CardContent>
            {apptsLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}
            {!apptsLoading && (!upcoming || upcoming.length === 0) && (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled"
                description="Appointments booked by a facility will show up here."
              />
            )}
            <div className="space-y-3">
              {upcoming?.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-ink-100 p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <Building2 className="h-4 w-4 text-brand-600" />
                    {a.tenantName || "Facility"}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink-500">
                    {a.doctorName || "Doctor TBD"}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-brand-600">
                    {formatDateTime(a.appointmentStart)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.85fr]">
        <Card>
          <div className="border-b border-ink-100 px-6 py-5">
            <h3 className="text-lg font-semibold text-ink-950">
              Health Snapshot
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Core identity and medical context for care teams.
            </p>
          </div>
          <CardContent className="space-y-3">
            <Row
              label="Date of birth"
              value={`${formatDate(patient?.dateOfBirth)}${patient ? ` (${ageFromDob(patient.dateOfBirth)} yrs)` : ""}`}
            />
            <Row
              label="Gender"
              value={patient?.gender?.replaceAll("_", " ") || "-"}
            />
            <Row
              label="Blood group"
              value={formatBloodGroup(patient?.bloodGroup)}
            />
            <Row
              label="Chronic conditions"
              value={patient?.chronicConditions || "None reported"}
            />
            <Row
              label="Allergies"
              value={patient?.allergies || "None reported"}
            />
          </CardContent>
        </Card>

        <Card>
          <div className="border-b border-ink-100 px-6 py-5">
            <h3 className="text-lg font-semibold text-ink-950">
              Emergency & Contact
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Trusted contact details for urgent care coordination.
            </p>
          </div>
          <CardContent className="space-y-3">
            <Row
              label="Emergency contact"
              value={patient?.emergencyContactName || "-"}
            />
            <Row
              label="Emergency phone"
              value={patient?.emergencyContactPhone || "-"}
            />
            <Row label="Phone" value={patient?.phone || "-"} />
            <Row
              label="Address"
              value={
                patient
                  ? `${patient.address}, ${patient.city}, ${patient.province}`
                  : "-"
              }
            />
          </CardContent>
        </Card>

        <div className="rounded-2xl bg-ink-950 p-6 text-white shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">
            Your health, ready to share
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Your QR identity helps verified doctors request access without
            exposing more information than the visit needs.
          </p>
          <Link
            href="/patient/qr"
            className="mt-7 flex items-center justify-between rounded-xl bg-white p-4 text-sm font-medium text-brand-700"
          >
            <span className="flex items-center gap-2">
              <QrCode size={18} /> Open my QR health card
            </span>
            <ArrowRight size={17} />
          </Link>
          <p className="mt-4 text-xs leading-6 text-white/60">
            Present your code at your next visit. You can review scan history or
            regenerate it from your QR page.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5 rounded-xl bg-ink-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-ink-500">
        <UserRound className="h-3.5 w-3.5 text-brand-600" /> {label}
      </span>
      <span className="min-w-0 text-left text-xs font-medium text-ink-900 sm:text-right">
        {value}
      </span>
    </div>
  );
}
