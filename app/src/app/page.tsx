import Image from 'next/image';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  Building2,
  Stethoscope,
  HeartPulse,
  Activity,
  ArrowRight,
  FileClock,
  Network,
  BadgeCheck,
  LockKeyhole,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandMark } from '@/components/ui/BrandMark';
import { env } from '@/config/env';

const ROLE_CARDS = [
  {
    role: 'Patients',
    icon: HeartPulse,
    description: 'A portable health identity with QR access, records, prescriptions, and appointments in one secure workspace.',
    href: '/register',
    cta: 'Create account',
  },
  {
    role: 'Doctors',
    icon: Stethoscope,
    description: 'Scan once, review verified history, and write clinical records only inside approved facility affiliations.',
    href: '/register',
    cta: 'Join as doctor',
  },
  {
    role: 'Facilities',
    icon: Building2,
    description: 'Manage departments, doctor affiliations, appointment operations, reporting, and audit visibility.',
    href: '/register-hospital',
    cta: 'Register facility',
  },
];

const FEATURES = [
  {
    icon: QrCode,
    title: 'Secure QR identity',
    description: 'Fast patient lookup with revocable QR tokens and controlled access at the point of care.',
  },
  {
    icon: Network,
    title: 'Connected care network',
    description: 'Patient records, appointments, prescriptions, and reports flow across the Medora microservice platform.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified affiliations',
    description: 'Doctors work through approved hospital relationships, keeping clinical write access scoped and auditable.',
  },
  {
    icon: FileClock,
    title: 'Operational audit trail',
    description: 'Audit logs, notifications, and gateway controls help teams inspect the activity behind each workflow.',
  },
];

const METRICS = [
  ['10', 'connected services'],
  ['JWT', 'secured gateway'],
  ['24/7', 'clinical access'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed left-0 right-0 top-0 z-40 px-4 pt-3 sm:px-6 lg:px-8">
        <div className="medora-glass mx-auto flex h-[74px] max-w-7xl items-center justify-between rounded-full px-4 sm:px-7">
          <Link href="/" aria-label={`${env.appName} home`}>
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-bold text-ink-700 md:flex">
            <a href="#platform" className="hover:text-brand-700">Platform</a>
            <a href="#roles" className="hover:text-brand-700">Roles</a>
            <a href="#security" className="hover:text-brand-700">Security</a>
            <a href="#contact" className="hover:text-brand-700">Company</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-700 sm:block">
              Sign in
            </Link>
            <Link href="/register-hospital">
              <Button size="lg" className="h-13 px-7">Talk to sales</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[760px] overflow-hidden pt-28 sm:pt-32">
        <Image
          src="/images/medora-hero-care.png"
          alt="Modern connected hospital command center"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-white/22" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[630px] max-w-7xl items-center px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl pt-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/85 px-3.5 py-1.5 text-xs font-black text-brand-700 shadow-sm backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Digital health operations, unified
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-normal text-ink-950 sm:text-6xl lg:text-7xl">
              Medora keeps care moving.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-600 sm:text-lg">
              A blue-and-white clinical platform for patients, doctors, hospitals, and admins to work from one secure healthcare network.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} className="flex-row-reverse">
                  Start with Medora
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Open workspace</Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {METRICS.map(([value, label]) => (
                <div key={label} className="rounded-[1.25rem] border border-white/80 bg-white/75 p-4 shadow-[var(--shadow-card)] backdrop-blur">
                  <p className="text-2xl font-black text-ink-950">{value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {ROLE_CARDS.map((card) => (
            <Link
              key={card.role}
              href={card.href}
              className="group rounded-[1.5rem] border border-white bg-white p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-black text-ink-950">{card.role}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500">{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-black text-brand-600">
                {card.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="platform" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Platform</p>
              <h2 className="mt-3 text-3xl font-black tracking-normal text-ink-950 sm:text-4xl">A calm operating layer for healthcare teams.</h2>
              <p className="mt-4 text-sm leading-7 text-ink-500">
                Medora brings the project’s gateway, discovery, service-to-service communication, role dashboards, and audit surfaces into a single product experience.
              </p>
              <div className="mt-7 space-y-3">
                {['Role-specific dashboards', 'Gateway-based API access', 'Notifications, audits, QR workflows'].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-ink-700">
                    <CheckCircle2 className="h-5 w-5 text-brand-600" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-[1.5rem] border border-ink-100 bg-ink-50/60 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-ink-950">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="bg-ink-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <LockKeyhole className="h-9 w-9 text-brand-300" />
            <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-normal sm:text-4xl">Designed for clinical trust, not just good-looking screens.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-300">
              The interface now follows the same blue-and-white system across landing, auth, admin, doctor, hospital, and patient experiences.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-6">
            {['JWT secured access', 'Eureka-backed service discovery', 'Audit and notification visibility', 'Responsive from mobile to desktop'].map((item) => (
              <div key={item} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-0">
                <Activity className="h-4 w-4 text-brand-300" />
                <span className="text-sm font-bold text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 border-b border-ink-100 pb-8 md:flex-row md:items-center">
            <BrandMark />
            <div className="flex flex-wrap gap-3">
              <Link href="/register"><Button variant="outline">Create account</Button></Link>
              <Link href="/register-hospital"><Button>Register facility</Button></Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 text-xs font-semibold text-ink-400 sm:flex-row">
            <span>© {new Date().getFullYear()} {env.appName}. All rights reserved.</span>
            <span>API Gateway · Eureka · Microservices · PostgreSQL · Redis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}