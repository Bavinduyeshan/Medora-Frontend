import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, HeartPulse, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <div className="absolute inset-0">
          <Image
            src="/images/medora-hero-doctors.png"
            alt="Healthcare professionals reviewing care information together"
            fill
            preload
            sizes="50vw"
            className="auth-story-image"
          />
        </div>
        <div className="auth-story-shade" />
        <div className="auth-story-content">
          <Link href="/" aria-label="Medora home">
            <BrandMark inverse />
          </Link>
          <div>
            <span className="mb-6 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-blue-200">
              <HeartPulse size={18} /> YOUR CARE, CONNECTED
            </span>
            <h2>
              A clearer picture.
              <br />A more connected
              <br />
              care experience.
            </h2>
            <p>
              One place for your health story, your care team, and the details
              that matter along the way.
            </p>
            <div className="auth-story-bottom">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} /> Role-based access
              </span>
              <span>Built around you</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="auth-main">
        <header>
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-brand-600"
          >
            <ArrowLeft size={15} /> Back to Medora
          </Link>
          <span className="hidden items-center gap-1.5 text-xs sm:flex">
            <ShieldCheck size={14} className="text-brand-600" /> Care workspace
          </span>
        </header>
        <main>
          <div>{children}</div>
        </main>
        <footer>
          <span>© {new Date().getFullYear()} Medora</span>
          <span>Connected care, made simple.</span>
        </footer>
      </div>
    </div>
  );
}
