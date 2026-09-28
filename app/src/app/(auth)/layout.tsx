import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, QrCode, Activity, Building2 } from 'lucide-react';
import { BrandMark } from '@/components/ui/BrandMark';
import { env } from '@/config/env';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const points = [
    { icon: QrCode, text: 'Fast QR patient identity across connected facilities' },
    { icon: Activity, text: 'Portable records, prescriptions, reports, and appointments' },
    { icon: Building2, text: 'Verified doctor and hospital workspaces' },
    { icon: ShieldCheck, text: 'Gateway-secured access with audit visibility' },
  ];

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.08fr_0.92fr]">
      <div className="relative hidden min-h-screen overflow-hidden p-6 lg:block">
        <Image
          src="/images/medora-hero-care.png"
          alt="Medora clinical operations"
          fill
          priority
          className="object-cover object-center"
          sizes="58vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/82 via-ink-950/58 to-ink-950/15" />
        <div className="relative z-10 flex h-full flex-col justify-between rounded-[2rem] border border-white/14 p-8 text-white shadow-2xl">
          <Link href="/" className="w-fit rounded-full bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
            <BrandMark />
          </Link>

          <div className="max-w-xl space-y-8">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-200">Secure care network</p>
              <h1 className="mt-3 text-5xl font-black leading-[1.02] tracking-normal">
                One professional workspace for every care role.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/76">
                Sign in to {env.appName} and continue from the dashboard built for your role.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {points.map((f) => (
                <div key={f.text} className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <f.icon className="h-5 w-5 text-brand-200" />
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/86">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs font-semibold text-white/54">© {new Date().getFullYear()} {env.appName}. All rights reserved.</p>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </Link>
          <div className="rounded-[2rem] border border-white bg-white/86 p-6 shadow-[var(--shadow-card)] backdrop-blur sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}