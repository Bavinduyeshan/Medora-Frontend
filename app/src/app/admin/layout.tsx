'use client';

import { LayoutDashboard, Building2, Users, ScrollText } from 'lucide-react';
import { RequireRole } from '@/components/layout/RequireRole';
import { PortalShell } from '@/components/layout/PortalShell';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Facility Reviews', href: '/admin/tenants', icon: Building2 },
  { label: 'People', href: '/admin/users', icon: Users },
  { label: 'Activity History', href: '/admin/audit', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <RequireRole role="ADMIN">
      <PortalShell navItems={NAV_ITEMS} brandAccent="bg-ink-950" displayName={user?.username || 'Super Admin'} displaySubtitle="Platform Admin">
        {children}
      </PortalShell>
    </RequireRole>
  );
}