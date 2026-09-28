'use client';

import { LayoutDashboard, Users2, LayoutGrid, FileBarChart } from 'lucide-react';
import { RequireRole } from '@/components/layout/RequireRole';
import { PortalShell } from '@/components/layout/PortalShell';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/hooks/useHospitalData';
import { EmptyState, FullPageSpinner } from '@/components/ui/Feedback';
import { Building2 } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/hospital', icon: LayoutDashboard },
  { label: 'Doctor Affiliations', href: '/hospital/affiliations', icon: Users2 },
  { label: 'Departments', href: '/hospital/departments', icon: LayoutGrid },
  { label: 'Reports', href: '/hospital/reports', icon: FileBarChart },
];

function HospitalGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: tenant, isLoading } = useTenant(user?.tenantId ?? undefined);

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

  return (
    <PortalShell
      navItems={NAV_ITEMS}
      brandAccent="bg-sky-600"
      displayName={tenant?.name || 'Facility Admin'}
      displaySubtitle="Hospital Portal"
    >
      {children}
    </PortalShell>
  );
}

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role={['HOSPITAL_ADMIN', 'RECEPTIONIST', 'LAB_TECHNICIAN']}>
      <HospitalGate>{children}</HospitalGate>
    </RequireRole>
  );
}
