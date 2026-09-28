'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui/Feedback';
import { roleHomePath } from '@/lib/utils';
import type { UserRoleApi } from '@/types/api';

export function RequireRole({ role, children }: { role: UserRoleApi | UserRoleApi[]; children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const allowed = Array.isArray(role) ? role : [role];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated' && user && !allowed.includes(user.role)) {
      router.replace(roleHomePath(user.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  if (status === 'loading' || !user || !allowed.includes(user.role)) {
    return <FullPageSpinner label="Preparing your workspace…" />;
  }

  return <>{children}</>;
}
