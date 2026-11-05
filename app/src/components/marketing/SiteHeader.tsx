"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

const links = [
  ["Platform", "#platform"],
  ["Who it’s for", "#roles"],
  ["How it works", "#how-it-works"],
  ["Access & privacy", "#security"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <header className="site-header" ref={panel}>
      <div className="site-container site-header-inner">
        <Link href="/" aria-label="Medora home">
          <BrandMark />
        </Link>
        <nav className="site-desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="site-header-actions">
          <Link href="/login" className="site-sign-in">
            Sign in
          </Link>
          <Link href="/register" className="site-button site-button-small">
            Get started <ArrowUpRight size={16} />
          </Link>
          <button
            ref={toggle}
            className="site-menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="site-mobile-nav"
          className="site-mobile-nav site-container"
          aria-label="Mobile navigation"
        >
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <Link href="/register-hospital">
            Register a facility <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
