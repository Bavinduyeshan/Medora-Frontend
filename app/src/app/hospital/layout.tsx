"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users2,
  LayoutGrid,
  FileBarChart,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { RequireRole } from "@/components/layout/RequireRole";
import { PortalShell } from "@/components/layout/PortalShell";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/hooks/useHospitalData";
import {
  EmptyState,
  FullPageSpinner,
  ErrorState,
} from "@/components/ui/Feedback";
import { Building2 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/hospital", icon: LayoutDashboard },
  {
    label: "Doctor Affiliations",
    href: "/hospital/affiliations",
    icon: Users2,
  },
  { label: "Departments", href: "/hospital/departments", icon: LayoutGrid },
  { label: "Reports", href: "/hospital/reports", icon: FileBarChart },
];

const STAFF_ROUTES = {
  RECEPTIONIST: ["/hospital", "/hospital/appointments"],
  LAB_TECHNICIAN: ["/hospital", "/hospital/lab-reports"],
};

function HospitalGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === "HOSPITAL_ADMIN";
  const permitted =
    isAdmin ||
    (user?.role === "RECEPTIONIST"
      ? STAFF_ROUTES.RECEPTIONIST
      : STAFF_ROUTES.LAB_TECHNICIAN
    ).includes(pathname);
  const nav = isAdmin
    ? [
        ...NAV_ITEMS,
        {
          label: "Appointments",
          href: "/hospital/appointments",
          icon: CalendarDays,
        },
        {
          label: "Opening Hours",
          href: "/hospital/hours",
          icon: Clock3,
        },
      ]
    : [
        NAV_ITEMS[0],
        user?.role === "RECEPTIONIST"
          ? {
              label: "Appointments",
              href: "/hospital/appointments",
              icon: CalendarDays,
            }
          : {
              label: "Lab Reports",
              href: "/hospital/lab-reports",
              icon: FileBarChart,
            },
      ];
  const {
    data: tenant,
    isLoading,
    error,
    refetch,
  } = useTenant(user?.tenantId ?? undefined);

  if (!user?.tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState
          icon={Building2}
          title="Your account isn't linked to a facility yet"
          description="A Medora super admin needs to assign your account to an approved facility before you can access the hospital portal."
        />
      </div>
    );
  }

  if (isLoading) return <FullPageSpinner label="Loading facility…" />;

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (tenant?.status !== "APPROVED")
    return (
      <div className="p-6">
        <EmptyState
          icon={Building2}
          title="Facility access is unavailable"
          description="Your facility must be approved and active before you can use this workspace."
        />
      </div>
    );

  return (
    <PortalShell
      navItems={nav}
      brandAccent="bg-sky-600"
      displayName={tenant?.name || "Facility Admin"}
      displaySubtitle="Hospital Portal"
    >
      {permitted ? (
        children
      ) : (
        <div className="space-y-4">
          <p>This page requires a facility administrator account.</p>
          <Link href="/hospital" className="text-brand-600">
            Return to your workspace
          </Link>
        </div>
      )}
    </PortalShell>
  );
}

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role={["HOSPITAL_ADMIN", "RECEPTIONIST", "LAB_TECHNICIAN"]}>
      <HospitalGate>{children}</HospitalGate>
    </RequireRole>
  );
}
