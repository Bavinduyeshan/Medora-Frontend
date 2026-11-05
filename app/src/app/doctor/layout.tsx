"use client";

import { LayoutDashboard, CalendarDays, Building2 } from "lucide-react";
import { RequireRole } from "@/components/layout/RequireRole";
import { PortalShell } from "@/components/layout/PortalShell";
import { useCurrentDoctor } from "@/hooks/useDoctorData";
import { DoctorOnboarding } from "@/components/doctor/DoctorOnboarding";
import { ErrorState, FullPageSpinner } from "@/components/ui/Feedback";
import { fullName } from "@/lib/utils";
import { ApiError } from "@/lib/http";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
  { label: "Affiliations", href: "/doctor/affiliations", icon: Building2 },
  { label: "Appointments", href: "/doctor/appointments", icon: CalendarDays },
];

function DoctorGate({ children }: { children: React.ReactNode }) {
  const { data: doctor, isLoading, error, refetch } = useCurrentDoctor();

  if (isLoading)
    return <FullPageSpinner label="Loading your clinical profile…" />;

  const notFound =
    error instanceof ApiError && (error.status === 404 || error.status === 400);
  if (error && !notFound)
    return (
      <div className="mx-auto max-w-xl p-6 sm:py-20">
        <ErrorState
          message="Your profile could not be loaded. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  if (!doctor || notFound) return <DoctorOnboarding />;

  return (
    <PortalShell
      navItems={NAV_ITEMS}
      brandAccent="bg-ink-900"
      displayName={fullName(doctor.firstName, doctor.lastName)}
      displaySubtitle="Doctor Portal"
    >
      {children}
    </PortalShell>
  );
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="DOCTOR">
      <DoctorGate>{children}</DoctorGate>
    </RequireRole>
  );
}
