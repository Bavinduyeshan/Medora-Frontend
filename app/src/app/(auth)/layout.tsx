import Image from 'next/image';
import Link from 'next/link';
import { HeartPulse, ShieldCheck, UsersRound } from 'lucide-react';
import { BrandMark } from '@/components/ui/BrandMark';
import { env } from '@/config/env';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen overflow-hidden bg-white lg:grid-cols-[0.98fr_1.02fr]">
      <div className="relative hidden h-screen overflow-hidden bg-brand-950 p-10 text-white lg:block">
        <Image
          src="/images/medora-hero-doctors.png"
          alt="Medora doctors reviewing care information"
          fill
          priority
          className="object-cover object-center opacity-78 saturate-125"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(4,15,46,0.78)_0%,rgba(0,96,220,0.42)_44%,rgba(255,255,255,0.02)_100%)]" />
        <div className="absolute left-10 top-24 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-28 right-16 h-56 w-56 rounded-full bg-brand-300/25 blur-3xl" />
        <div className="relative z-10 flex min-h-full flex-col justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-black shadow-lg shadow-brand-950/30">M</div>
            <div>
              <p className="text-xl font-black">{env.appName}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/75">Care workspace</p>
            </div>
          </Link>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/14 px-4 py-2 text-xs font-bold backdrop-blur">
              <HeartPulse className="h-4 w-4 text-cyan-100" /> Simple, connected healthcare
            </span>
            <h1 className="mt-7 text-4xl font-black leading-tight tracking-normal">
              Manage care with confidence from one calm workspace.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/82">
              Medora helps patients, doctors, and hospitals keep care details organized, accessible, and easy to follow.
            </p>

            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {[
                ['Patients', 'Health profile'],
                ['Doctors', 'Care reviews'],
                ['Hospitals', 'Team access'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/14 bg-white/12 p-4 backdrop-blur">
                  <p className="text-xs text-white/65">{label}</p>
                  <p className="mt-1 text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 border-t border-white/14 pt-6 text-xs font-bold text-white/80">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-100" /> Private by design</span>
            <span className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-cyan-100" /> Built for care teams</span>
          </div>
        </div>
      </div>

      <div className="h-screen overflow-y-auto bg-white px-5 py-6 sm:px-8 lg:px-14">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:hidden">
            <BrandMark />
          </Link>
          <div className="ml-auto rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
            Secure access
          </div>
        </div>

        <main className="flex min-h-[calc(100vh-128px)] items-center justify-center py-8">
          <div className="w-full max-w-lg">{children}</div>
        </main>

        <footer className="border-t border-ink-100 pt-5 text-xs font-semibold text-ink-400">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-2 text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Privacy focused</span>
            <span>Support</span>
            <span>Terms</span>
            <span>(c) {new Date().getFullYear()} {env.appName}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}