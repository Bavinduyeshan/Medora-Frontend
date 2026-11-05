"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { Avatar } from "@/components/ui/Feedback";
import { BrandMark } from "@/components/ui/BrandMark";
import { Modal } from "@/components/ui/Modal";
import { roleLabel } from "@/lib/utils";

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
    <nav
      aria-label="Workspace navigation"
      className="flex flex-1 flex-col gap-1 px-4"
    >
      {navItems.map((item) => {
        const isRoot = ["/patient", "/doctor", "/hospital", "/admin"].includes(
          item.href,
        );
        const active =
          pathname === item.href ||
          (!isRoot && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="portal-sidebar-link"
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {active && <ChevronRight className="h-3.5 w-3.5" />}
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const activeItem =
    navItems.find((item) => pathname === item.href) ||
    [...navItems]
      .reverse()
      .find((item) => pathname.startsWith(`${item.href}/`));
  const results = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase().trim()),
  );

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  const account = (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={displayName} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">
          {displayName}
        </p>
        <p className="truncate text-xs text-ink-500">{roleLabel(user?.role)}</p>
      </div>
      <button
        onClick={() => logout()}
        aria-label="Sign out"
        title="Sign out"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
      >
        <LogOut size={17} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <a className="skip-link" href="#portal-main-content">
        Skip to content
      </a>
      <aside className="portal-sidebar fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-ink-200/60 bg-white lg:flex">
        <div className="px-7 pb-7 pt-8">
          <Link href="/" aria-label="Medora home">
            <BrandMark />
          </Link>
        </div>
        <div className="mx-5 mb-8 flex items-center gap-3 rounded-xl border border-ink-200/70 bg-ink-50/60 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-600">
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink-800">
              {displaySubtitle}
            </p>
            <p className="mt-0.5 text-[12px] text-ink-500">
              Your care workspace
            </p>
          </div>
        </div>
        <p className="mb-3 px-8 text-[12px] font-semibold uppercase tracking-[.12em] text-ink-400">
          Workspace
        </p>
        <NavLinks
          navItems={navItems}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
        <div className="mx-5 mb-5 mt-8 rounded-xl bg-[#f3f7fd] p-4">
          <HeartNote />
          <p className="mt-3 text-xs font-semibold text-ink-800">
            Connected by better care.
          </p>
          <p className="mt-1.5 text-xs leading-5 text-ink-500">
            A clearer view of what matters in your day.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-600"
          >
            About Medora <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="border-t border-ink-100 px-5 py-5">{account}</div>
      </aside>

      <div className="portal-main">
        <header className="sticky top-0 z-10 border-b border-ink-200/60 bg-white/95 backdrop-blur-xl">
          <div className="flex h-[78px] min-w-0 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              ref={menuButton}
              onClick={() => setMobileOpen(true)}
              aria-label="Open workspace navigation"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-600 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-ink-400">
              <span className="hidden sm:inline">{displaySubtitle}</span>
              <ChevronRight size={14} className="hidden shrink-0 sm:block" />
              <span className="truncate text-sm font-medium text-ink-800">
                {activeItem?.label || "Details"}
              </span>
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-3 rounded-lg border border-ink-200/70 bg-ink-50/60 px-3 text-xs text-ink-500 md:flex"
            >
              <Search size={16} />
              <span className="hidden xl:inline">Go to a page…</span>
              <kbd className="ml-5 rounded border border-ink-200 bg-white px-1.5 py-0.5 text-[12px]">
                ⌘ K
              </kbd>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Find a workspace page"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 md:hidden"
            >
              <Search size={19} />
            </button>
            <NotificationBell />
            <div className="ml-1 border-l border-ink-200 pl-4">
              <Avatar name={displayName} size={35} />
            </div>
          </div>
        </header>
        <main id="portal-main-content" className="portal-content">
          {children}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200/60 pt-5 text-[12px] text-ink-400">
            <span>© {new Date().getFullYear()} Medora</span>
            <span>{displaySubtitle} · Connected care</span>
          </footer>
        </main>
      </div>
      <Modal
        isOpen={mobileOpen}
        onClose={() => {
          setMobileOpen(false);
          menuButton.current?.focus();
        }}
        title="Your workspace"
        description={displaySubtitle}
        size="sm"
        footer={<div className="w-full">{account}</div>}
      >
        <NavLinks
          navItems={navItems}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
        <Link
          href="/"
          className="mt-7 flex items-center gap-2 border-t border-ink-100 pt-4 text-sm text-ink-500"
        >
          <ArrowLeft size={16} /> Medora home
        </Link>
      </Modal>
      <Modal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Go to a page"
        description="Find a page in your workspace."
        size="md"
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-ink-400" />
          <input
            data-autofocus
            ref={searchInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search workspace pages"
            placeholder="Search pages…"
            className="h-12 w-full rounded-xl border border-ink-200 pl-11 pr-4 text-base"
          />
        </div>
        <div className="mt-4 space-y-1">
          {results.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-600"
            >
              <item.icon size={18} />
              {item.label}
              <ArrowUpRight size={15} className="ml-auto" />
            </Link>
          ))}
          {!results.length && (
            <p className="py-8 text-center text-sm text-ink-500">
              No pages match “{query}”. Try another name.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
function HeartNote() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-600">
      <ShieldCheck size={17} />
    </span>
  );
}
