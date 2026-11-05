import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ClipboardList,
  FileText,
  HeartPulse,
  KeyRound,
  LockKeyhole,
  Network,
  QrCode,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { SiteHeader } from "@/components/marketing/SiteHeader";

const roles = [
  {
    title: "For patients",
    subtitle: "Your health, in your hands.",
    description:
      "Keep your medical history, prescriptions, and upcoming appointments together. Share your health identity with a QR code.",
    icon: HeartPulse,
    href: "/register",
    cta: "Create a patient account",
    tone: "blue",
  },
  {
    title: "For doctors",
    subtitle: "More context. Better continuity.",
    description:
      "Review patient histories, document diagnoses, and manage visits across your approved healthcare facilities.",
    icon: Stethoscope,
    href: "/register?role=doctor",
    cta: "Join as a doctor",
    tone: "teal",
  },
  {
    title: "For facilities",
    subtitle: "A clearer view of daily care.",
    description:
      "Organize departments, manage doctor affiliations, and keep appointments and reports moving in one workspace.",
    icon: Building2,
    href: "/register-hospital",
    cta: "Register your facility",
    tone: "violet",
  },
];
const features = [
  {
    icon: FileText,
    title: "A connected medical history",
    description:
      "Find clinical notes, diagnoses, lab reports, and prescriptions in an organized patient record.",
  },
  {
    icon: CalendarDays,
    title: "Appointments at a glance",
    description:
      "See upcoming visits and appointment updates across connected care facilities.",
  },
  {
    icon: QrCode,
    title: "A portable health identity",
    description:
      "Use your personal QR code to help an approved doctor find the right patient profile.",
  },
  {
    icon: Network,
    title: "One coordinated care team",
    description:
      "Keep doctors, departments, and facility relationships together with dedicated workspaces.",
  },
];

export default function LandingPage() {
  return (
    <div id="top" className="marketing-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">
        <section className="landing-hero">
          <div className="site-container hero-grid">
            <div className="hero-copy">
              <span className="section-kicker">
                <span className="kicker-line" /> Connected care, made simple
              </span>
              <h1>
                Better care starts
                <br />
                with a <span>clearer picture.</span>
              </h1>
              <p>
                Your health story belongs together. Medora connects patients,
                doctors, and healthcare facilities in one thoughtfully organized
                platform.
              </p>
              <div className="hero-actions">
                <Link href="/register" className="site-button">
                  Get started with Medora <ArrowUpRight size={18} />
                </Link>
                <Link href="#platform" className="text-link">
                  Explore the platform <ArrowRight size={17} />
                </Link>
              </div>
              <div className="hero-reassurance">
                <ShieldCheck size={18} />
                <span>Personal health records. Connected care teams.</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-photo">
                <Image
                  src="/images/medora-hero-doctors.png"
                  alt="Two healthcare professionals reviewing information on a tablet"
                  fill
                  preload
                  sizes="(max-width: 760px) 100vw, 48vw"
                  className="hero-image"
                />
                <div className="hero-photo-caption">
                  <span className="caption-icon">
                    <HeartPulse size={20} />
                  </span>
                  <div>
                    <strong>Care that stays connected</strong>
                    <span>From one visit to the next.</span>
                  </div>
                </div>
              </div>
              <div className="hero-float">
                <span className="float-check">
                  <CheckCheck size={20} />
                </span>
                <div>
                  <strong>Your care, together.</strong>
                  <span>Records · appointments · prescriptions</span>
                </div>
              </div>
              <span className="hero-dot-grid" aria-hidden="true" />
            </div>
          </div>
          <div className="site-container hero-capabilities">
            <span>Built around the way care works</span>
            <div>
              <FileText size={18} /> Medical records
            </div>
            <div>
              <CalendarDays size={18} /> Appointments
            </div>
            <div>
              <QrCode size={18} /> QR health identity
            </div>
            <div>
              <Building2 size={18} /> Facility workspaces
            </div>
          </div>
        </section>

        <section id="roles" className="site-section">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">A place for everyone</p>
                <h2>
                  One platform.
                  <br />
                  Every part of your care.
                </h2>
              </div>
              <p>
                Different needs, connected by one purpose: making everyday
                healthcare easier to manage.
              </p>
            </div>
            <div className="role-grid">
              {roles.map(({ icon: Icon, ...role }) => (
                <article
                  key={role.title}
                  className={`role-card role-${role.tone}`}
                >
                  <div className="role-top">
                    <span className="role-icon">
                      <Icon size={23} />
                    </span>
                    <span>{role.title}</span>
                  </div>
                  <h3>{role.subtitle}</h3>
                  <p>{role.description}</p>
                  <Link href={role.href}>
                    {role.cta} <ArrowUpRight size={18} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="site-section platform-section">
          <div className="site-container platform-grid">
            <div className="platform-photo">
              <Image
                src="/images/medora-hero-care.png"
                alt="A healthcare team working together in a clinical setting"
                fill
                sizes="(max-width: 760px) 100vw, 45vw"
                className="object-cover object-[64%_center]"
              />
              <div className="platform-photo-label">
                <span className="caption-icon">
                  <ClipboardList size={22} />
                </span>
                <div>
                  <strong>Less searching. More clarity.</strong>
                  <span>The right context for your next step.</span>
                </div>
              </div>
            </div>
            <div className="platform-copy">
              <p className="section-kicker">The Medora platform</p>
              <h2>
                A little less admin.
                <br />A lot more connection.
              </h2>
              <p className="section-intro">
                Bring the details that matter into one place, so each visit
                starts with a better understanding.
              </p>
              <div className="feature-list">
                {features.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="feature-row">
                    <span>
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="site-section">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Getting started</p>
                <h2>A simpler path to connected care.</h2>
              </div>
              <Link href="/register" className="text-link">
                Create your account <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="steps-grid">
              {[
                [
                  "01",
                  "Create your account",
                  "Choose patient or doctor registration, then complete your personal or professional profile.",
                ],
                [
                  "02",
                  "Set up your workspace",
                  "Patients receive a QR health identity. Doctors connect with facilities through approved affiliations.",
                ],
                [
                  "03",
                  "Keep care moving",
                  "Review records, follow appointments, and manage the next steps from your dedicated dashboard.",
                ],
              ].map(([number, title, description]) => (
                <div key={number} className="step">
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="site-container access-section">
          <div>
            <span className="access-icon">
              <LockKeyhole size={26} />
            </span>
            <p className="section-kicker">Thoughtful access</p>
            <h2>
              The right information.
              <br />
              For the right people.
            </h2>
            <p>
              Healthcare is personal. Medora organizes access around patient
              identity, professional roles, and approved facility relationships.
            </p>
          </div>
          <div className="access-list">
            {[
              [
                KeyRound,
                "A workspace for your role",
                "Patients, doctors, facility teams, and administrators each have a dedicated view.",
              ],
              [
                ShieldCheck,
                "Approved doctor affiliations",
                "Facility relationships determine where clinicians can work with patient records.",
              ],
              [
                ClipboardList,
                "A clear activity history",
                "Administrators can review recorded actions across the platform.",
              ],
            ].map(([Icon, title, description]) => {
              const AccessIcon = Icon as typeof ShieldCheck;
              return (
                <div key={String(title)}>
                  <AccessIcon size={22} />
                  <div>
                    <h3>{String(title)}</h3>
                    <p>{String(description)}</p>
                  </div>
                  <Check size={18} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="site-section">
          <div className="site-container cta-section">
            <div>
              <p className="section-kicker">Your next step</p>
              <h2>Make room for better care.</h2>
              <p>
                Start with your own account, or bring your facility onto Medora.
              </p>
            </div>
            <div>
              <Link href="/register" className="site-button">
                Create an account <ArrowUpRight size={18} />
              </Link>
              <Link href="/register-hospital" className="text-link">
                Register a facility <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="site-container">
          <div className="footer-main">
            <div>
              <Link href="/" aria-label="Medora home">
                <BrandMark />
              </Link>
              <p>
                Connected care.
                <br />A clearer picture of health.
              </p>
              <span>Built for patients and care teams in Sri Lanka.</span>
            </div>
            <div>
              <h3>Explore</h3>
              <a href="#platform">The platform</a>
              <a href="#how-it-works">How it works</a>
              <a href="#security">Access & privacy</a>
            </div>
            <div>
              <h3>Get started</h3>
              <Link href="/register">For patients</Link>
              <Link href="/register?role=doctor">For doctors</Link>
              <Link href="/register-hospital">For facilities</Link>
              <Link href="/login">Sign in to Medora</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Medora. All rights reserved.
            </span>
            <span>Bringing your care together.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
