'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Command, LogOut, Menu, Search, ShieldCheck, X, type LucideIcon } from 'lucide-react';
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
    <nav className="flex flex-1 flex-col gap-2 px-4">
      {navItems.map((item) => {
        const isRoot = item.href === '/patient' || item.href === '/doctor' || item.href === '/hospital' || item.href === '/admin';
        const isActive = pathname === item.href || (!isRoot && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all',
              isActive
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'text-ink-500 hover:bg-brand-50 hover:text-brand-700'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
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
    <div className="min-h-screen bg-[#f4f7fb]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-ink-100 bg-white shadow-sm lg:flex">
        <div className="px-6 py-7">
          <BrandMark />
          <p className="mt-2 pl-12 text-[11px] font-black uppercase tracking-wider text-ink-400">{displaySubtitle}</p>
        </div>

        <div className="mx-4 mb-7 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-ink-800">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Care Network Online
            </div>
            <span className="rounded-xl bg-white px-2.5 py-1 text-xs font-black text-brand-700 shadow-sm">Healthy</span>
          </div>
        </div>

        <NavLinks navItems={navItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />

        <div className="mt-auto border-t border-ink-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3">
            <Avatar name={displayName} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-ink-950">{displayName}</p>
              <p className="truncate text-xs font-semibold text-ink-500">{roleLabel(user?.role)}</p>
            </div>
            <button
              onClick={() => logout()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-400 hover:bg-white hover:text-rose-600"
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
            <div className="mt-auto border-t border-ink-100 p-4">
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[74px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-ink-500 hover:bg-brand-50 hover:text-brand-700 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-[150px] sm:block">
              <p className="text-[11px] font-black uppercase tracking-wider text-brand-600">Workspace</p>
              <p className="truncate text-sm font-semibold text-ink-600">{displaySubtitle} Node</p>
            </div>
            <div className="relative hidden flex-1 lg:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                className="h-11 w-full rounded-2xl border border-ink-200 bg-ink-50/80 pl-11 pr-14 text-sm font-semibold text-ink-700 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                placeholder="Search facilities, patients, people, activity..."
              />
              <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[10px] font-black text-ink-400">
                <Command className="h-3 w-3" /> K
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Care Network Healthy
              </div>
              <NotificationBell />
              <div className="hidden h-10 w-px bg-ink-100 sm:block" />
              <div className="hidden text-right sm:block">
                <p className="max-w-[130px] truncate text-sm font-black text-ink-950">{displayName}</p>
                <p className="text-xs font-semibold text-brand-600">{roleLabel(user?.role)}</p>
              </div>
              <div className="rounded-2xl bg-ink-950 p-1 shadow-lg shadow-ink-950/10">
                <Avatar name={displayName} size={42} className="bg-none shadow-none" />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold text-ink-400 lg:hidden">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Care Network Healthy
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}