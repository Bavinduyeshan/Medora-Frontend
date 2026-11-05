"use client";

import {
  LayoutDashboard,
  FileText,
  Pill,
  CalendarDays,
  QrCode,
} from "lucide-react";
import { RequireRole } from "@/components/layout/RequireRole";
import { PortalShell } from "@/components/layout/PortalShell";
import { useCurrentPatient } from "@/hooks/usePatientData";
import { PatientOnboarding } from "@/components/patient/PatientOnboarding";
import { ErrorState, FullPageSpinner } from "@/components/ui/Feedback";
import { useAuth } from "@/context/AuthContext";
import { fullName } from "@/lib/utils";
import { ApiError } from "@/lib/http";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Medical Records", href: "/patient/records", icon: FileText },
  { label: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
  { label: "Appointments", href: "/patient/appointments", icon: CalendarDays },
  { label: "My QR Code", href: "/patient/qr", icon: QrCode },
];

function PatientGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: patient, isLoading, error, refetch } = useCurrentPatient();

  if (isLoading)
    return <FullPageSpinner label="Loading your health profile…" />;

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
  if (!patient || notFound) return <PatientOnboarding />;

  return (
    <PortalShell
      navItems={NAV_ITEMS}
      displayName={
        fullName(patient.firstName, patient.lastName) ||
        user?.username ||
        "Patient"
      }
      displaySubtitle="Patient Portal"
    >
      {children}
    </PortalShell>
  );
}

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="PATIENT">
      <PatientGate>{children}</PatientGate>
    </RequireRole>
  );
}
