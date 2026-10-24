import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileClock,
  HeartPulse,
  LockKeyhole,
  Mail,
  MapPin,
  Network,
  Plus,
  QrCode,
  Server,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';

const ROLE_CARDS = [
  {
    role: 'Patients',
    icon: HeartPulse,
    description: 'A portable health identity with QR access, records, prescriptions, and appointments in one secure workspace.',
    href: '/register',
    cta: 'Create account',
    tone: 'text-brand-600 bg-brand-50',
  },
  {
    role: 'Doctors',
    icon: Stethoscope,
    description: 'Scan once, review verified history, and write clinical records only inside approved facility affiliations.',
    href: '/register',
    cta: 'Join as doctor',
    tone: 'text-emerald-600 bg-emerald-50',
  },
  {
    role: 'Facilities',
    icon: Building2,
    description: 'Manage departments, doctor teams, appointments, reports, and activity reviews.',
    href: '/register-hospital',
    cta: 'Register facility',
    tone: 'text-violet-600 bg-violet-50',
  },
];

const FEATURES = [
  {
    icon: QrCode,
    title: 'Simple patient identity',
    description: 'Quick patient lookup with secure sharing when care teams need it.',
  },
  {
    icon: Network,
    title: 'Connected care network',
    description: 'Records, appointments, prescriptions, and reports stay organized across the Medora care experience.',
  },
  {
    icon: BadgeCheck,
    title: 'Approved care teams',
    description: 'Doctors and facilities work through approved relationships so patient care stays coordinated.',
  },
  {
    icon: FileClock,
    title: 'Clear activity history',
    description: 'Important actions, messages, and care updates are easy for the right teams to review.',
  },
];

const METRICS = [
  { value: '10+', label: 'Connected Services', icon: Server },
  { value: 'Safe', label: 'Private Access', icon: ShieldCheck },
  { value: '24/7', label: 'Care Access', icon: Activity },
];

const FOOTER_LINKS = [
  ['Home', '#top'],
  ['Platform', '#platform'],
  ['Roles', '#roles'],
  ['Security', '#security'],
  ['Company', '#contact'],
];

function MiniLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm">
        <Plus className="h-4 w-4" />
      </div>
      <span className={inverse ? 'text-lg font-black text-white' : 'text-lg font-black text-ink-950'}>Medora</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label={`${env.appName} home`}>
            <MiniLogo />
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] font-bold text-ink-700 md:flex">
            <a href="#top" className="text-brand-700 underline underline-offset-[12px]">Home</a>
            <a href="#platform" className="hover:text-brand-700">Platform</a>
            <a href="#roles" className="hover:text-brand-700">Roles</a>
            <a href="#security" className="hover:text-brand-700">Security</a>
            <a href="#contact" className="hover:text-brand-700">Company</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-3 py-2 text-[11px] font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-700 sm:block">
              Sign in
            </Link>
            <Link href="/register-hospital">
              <Button size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />} className="h-9 flex-row-reverse px-4 text-[11px]">Talk to sales</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-ink-100 bg-[#f7fbff]">
        <div className="absolute inset-y-0 right-0 hidden w-[72%] lg:block">
          <Image
            src="/images/medora-hero-doctors.png"
            alt="Medora clinical team reviewing digital records"
            fill
            priority
            sizes="72vw"
            className="object-cover object-center opacity-72 saturate-125 contrast-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#f7fbff_0%,rgba(247,251,255,0.90)_22%,rgba(247,251,255,0.34)_58%,rgba(247,251,255,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(14,165,233,0.16),transparent_34%)]" />
        </div>

        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center px-4 py-12 sm:px-6 lg:grid-cols-[0.58fr_0.42fr] lg:px-8 lg:py-14">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/82 px-3 py-1.5 text-[11px] font-black text-brand-700 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" /> Digital health operations, unified
            </span>
            <h1 className="mt-5 text-[44px] font-black leading-[0.92] tracking-normal text-ink-950 sm:text-[60px]">
              <span className="text-brand-600">Medora</span> keeps care moving.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-ink-600 sm:text-base sm:leading-7">
              A blue-and-white clinical platform for patients, doctors, hospitals, and admins to work from one secure healthcare network.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="md" icon={<ArrowRight className="h-4 w-4" />} className="flex-row-reverse px-5">
                  Start with Medora
                </Button>
              </Link>
              <Link href="/login">
                <Button size="md" variant="outline" icon={<QrCode className="h-4 w-4" />} className="px-5">Open Workspace</Button>
              </Link>
            </div>
            <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
              {METRICS.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-ink-100 bg-white/90 p-3.5 shadow-[var(--shadow-card)] backdrop-blur">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <metric.icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="mt-3 text-base font-black text-ink-950">{metric.value}</p>
                  <p className="mt-0.5 text-[9px] font-semibold leading-3 text-ink-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 hidden min-h-[360px] lg:block">
            <div className="absolute right-10 top-16 h-56 w-56 rounded-full bg-brand-300/20 blur-2xl" />
            <div className="absolute bottom-20 right-24 h-28 w-28 rounded-full bg-cyan-300/25 blur-xl" />
          </div>
        </div>
      </section>

      <section id="roles" className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {ROLE_CARDS.map((card) => (
            <Link
              key={card.role}
              href={card.href}
              className="group rounded-2xl border border-ink-100 bg-white p-7 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
                  <card.icon className="h-4.5 w-4.5" />
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <h3 className="mt-7 text-lg font-black text-ink-950">{card.role}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-500">{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-black text-brand-600">
                {card.cta} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="platform" className="bg-[#f6f8fb] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:px-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-brand-600">Platform</p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-normal text-ink-950 sm:text-4xl">
              A calm operating layer for <span className="text-brand-600">healthcare teams.</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-ink-500">
              Medora brings patient access, doctor workflows, facility operations, and admin oversight into one calm product experience.
            </p>
            <div className="mt-7 space-y-3">
              {['Role-specific dashboards', 'Secure workspace access', 'Messages, reviews, and QR workflows'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-bold text-ink-700">
                  <CheckCircle2 className="h-4.5 w-4.5 text-brand-600" /> {item}
                </div>
              ))}
            </div>
            <Link href="/register" className="mt-8 inline-flex">
              <Button variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />} className="flex-row-reverse">Explore the platform</Button>
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-5 text-sm font-black text-ink-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#f6f8fb] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-2xl border border-brand-100 bg-[linear-gradient(120deg,#eff7ff_0%,#ffffff_62%,#f8fbff_100%)] p-8 shadow-[var(--shadow-card)] lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-brand-600">Trust & Security</p>
            <h2 className="mt-5 max-w-md text-3xl font-black leading-tight tracking-normal text-ink-950">
              Designed for <span className="text-brand-600">clinical trust</span>, not just good-looking screens.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-ink-500">
              Medora keeps every screen clean, friendly, and consistent for patients, doctors, hospital teams, and admins.
            </p>
            <Link href="/register" className="mt-8 inline-flex">
              <Button size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />} className="flex-row-reverse">Get started</Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-[0.82fr_1.18fr] sm:items-center">
            <div className="space-y-3">
              {['Private sign-in', 'Connected care services', 'Helpful activity visibility', 'Responsive from mobile to desktop'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/78 p-3 text-xs font-bold text-ink-700">
                  <LockKeyhole className="h-4 w-4 text-brand-600" /> {item}
                </div>
              ))}
            </div>
            <div className="relative min-h-[210px] rounded-2xl bg-white p-6 shadow-2xl shadow-brand-950/10">
              <div className="h-3 w-24 rounded-full bg-ink-100" />
              <div className="mt-8 flex h-24 items-end gap-4">
                {[38, 66, 92, 52].map((h, idx) => (
                  <div key={idx} className="w-8 rounded-t-xl bg-brand-600/80" style={{ height: h }} />
                ))}
              </div>
              <div className="absolute -right-4 bottom-7 w-32 rounded-2xl border border-ink-100 bg-white p-4 shadow-xl">
                <div className="mx-auto h-10 w-10 rounded-full bg-brand-600" />
                <div className="mx-auto mt-4 h-2 w-16 rounded-full bg-ink-100" />
                <div className="mx-auto mt-2 h-2 w-10 rounded-full bg-ink-100" />
              </div>
              <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-ink-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.4fr_0.65fr_0.65fr_1.1fr]">
            <div>
              <MiniLogo inverse />
              <p className="mt-5 max-w-sm text-sm font-bold text-white">Smarter operations. Healthier communities.</p>
              <p className="mt-3 max-w-sm text-xs leading-6 text-ink-300">
                Medora is a secure, scalable clinical platform that connects patients, doctors, hospitals and facilities in one network.
              </p>
              <div className="mt-6 flex gap-3 text-ink-300">
                <ShieldCheck className="h-4 w-4" />
                <Network className="h-4 w-4" />
                <Mail className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Quick Links</h3>
              <div className="mt-4 space-y-3 text-xs text-ink-300">
                {FOOTER_LINKS.map(([label, href]) => <a key={label} href={href} className="block hover:text-white">{label}</a>)}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">For Users</h3>
              <div className="mt-4 space-y-3 text-xs text-ink-300">
                {['Patients', 'Doctors', 'Facilities', 'Support'].map((label) => <span key={label} className="block">{label}</span>)}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Contact</h3>
              <div className="mt-4 space-y-3 text-xs text-ink-300">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> hello@medora.health</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Colombo, Sri Lanka</p>
                <p>Mon - Fri, 8:00 AM - 6:00 PM</p>
              </div>
              <div className="mt-5 rounded-2xl border border-brand-400/30 bg-brand-600/20 p-4">
                <p className="text-xs font-black">Ready to build a healthier future?</p>
                <p className="mt-1 text-xs text-ink-300">Let&apos;s talk about how Medora can work for your organization.</p>
                <Link href="/register-hospital" className="mt-3 block rounded-full bg-white px-4 py-2 text-center text-xs font-black text-ink-950">
                  Talk to sales
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-8 text-xs font-semibold text-ink-400 sm:flex-row">
            <span>(c) {new Date().getFullYear()} {env.appName}. All rights reserved.</span>
            <span>Built for better care</span>
          </div>
        </div>
      </footer>
    </div>
  );
}