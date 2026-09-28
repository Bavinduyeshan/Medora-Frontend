'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Avatar } from '@/components/ui/Feedback';
import { BrandMark } from '@/components/ui/BrandMark';
import { roleLabel, cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

function NavLinks({
  navItems,
  pathname,
  onNavigate,
}: {
  navItems: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1.5 px-3">
      {navItems.map((item) => {
        const isRoot = item.href === '/patient' || item.href === '/doctor' || item.href === '/hospital' || item.href === '/admin';
        const isActive = pathname === item.href || (!isRoot && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold transition-all',
              isActive
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-950/20'
                : 'text-ink-500 hover:bg-brand-50 hover:text-brand-700'
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PortalShell({
  navItems,
  displayName,
  displaySubtitle,
  children,
}: {
  navItems: NavItem[];
  brandAccent?: string;
  displayName: string;
  displaySubtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-white/70 bg-white/78 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:flex">
        <div className="px-5 py-5">
          <BrandMark />
          <p className="mt-2 pl-12 text-[11px] font-bold uppercase tracking-wider text-ink-400">{displaySubtitle}</p>
        </div>
        <NavLinks navItems={navItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        <div className="border-t border-ink-100/80 p-3">
          <div className="flex items-center gap-2.5 rounded-[1.25rem] bg-ink-50/90 p-2.5 ring-1 ring-white">
            <Avatar name={displayName} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-ink-900">{displayName}</p>
              <p className="truncate text-[11px] font-semibold text-ink-400">{roleLabel(user?.role)}</p>
            </div>
            <button
              onClick={() => logout()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-white hover:text-rose-600"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[86vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-5">
              <BrandMark />
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-ink-400 hover:bg-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks navItems={navItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-ink-100 p-3">
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-full px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 px-4 pt-3 sm:px-6 lg:px-8">
          <div className="medora-glass flex h-16 items-center justify-between rounded-full px-3 pl-4 sm:px-5">
            <button onClick={() => setMobileOpen(true)} className="rounded-full p-2 text-ink-500 hover:bg-brand-50 hover:text-brand-700 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-[11px] font-black uppercase tracking-wider text-brand-600">{displaySubtitle}</p>
              <p className="text-sm font-bold text-ink-700">{displayName}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}