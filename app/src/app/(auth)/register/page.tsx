"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  AtSign,
  Building2,
  HeartPulse,
  Info,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError } from "@/lib/http";
import { cn, roleHomePath } from "@/lib/utils";
import type { UserRoleApi } from "@/types/api";

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<Extract<UserRoleApi, "PATIENT" | "DOCTOR">>(
    params.get("role") === "doctor" ? "DOCTOR" : "PATIENT",
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setError(
        "Password must be at least 8 characters with uppercase, lowercase, and a number.",
      );
      return;
    }
    if (!accepted) {
      setError("Please accept the Medora terms before creating your account.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({ username, email, password, role });
      toast.success("Account created. Let us finish setting up your profile.");
      router.push(roleHomePath(user.role));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-700">
          <ShieldCheck className="h-4 w-4 text-brand-600" /> Medora registration
        </span>
        <span className="hidden items-center gap-2 text-sm font-semibold text-emerald-700 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Secure
          access
        </span>
      </div>

      <h1>Create your account.</h1>
      <p className="mt-4 text-base leading-7 text-ink-600">
        Start your health journey or connect with your care team.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-ink-200 bg-ink-100/70 p-1.5">
        <button
          type="button"
          onClick={() => setRole("PATIENT")}
          aria-pressed={role === "PATIENT"}
          className={cn(
            "flex h-12 items-center justify-center gap-3 rounded-xl text-sm font-semibold transition-all",
            role === "PATIENT"
              ? "bg-white text-brand-700 shadow-sm ring-1 ring-ink-100"
              : "text-ink-500 hover:text-ink-900",
          )}
        >
          <HeartPulse className="h-5 w-5" /> Patient
        </button>
        <button
          type="button"
          onClick={() => setRole("DOCTOR")}
          aria-pressed={role === "DOCTOR"}
          className={cn(
            "flex h-12 items-center justify-center gap-3 rounded-xl text-sm font-semibold transition-all",
            role === "DOCTOR"
              ? "bg-white text-brand-700 shadow-sm ring-1 ring-ink-100"
              : "text-ink-500 hover:text-ink-900",
          )}
        >
          <Stethoscope className="h-5 w-5" /> Doctor
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Username" required>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              className="pl-11"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              name="username"
              placeholder="Choose a username"
            />
          </div>
        </Field>
        <Field label="Email address" required>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              className="pl-11"
              type="email"
              autoComplete="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" required>
            <PasswordInput
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters, uppercase, lowercase, and a number"
            />
          </Field>
          <Field label="Confirm password" required>
            <PasswordInput
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
            />
          </Field>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm leading-6 text-ink-600">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          Register as{" "}
          {role === "PATIENT"
            ? "a patient to receive your personal QR health card and access connected care summaries."
            : "a doctor to complete your professional profile. A facility administrator can then add your affiliation."}
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-ink-600">
          <input
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded accent-brand-600"
          />
          <span>
            I agree to the Medora{" "}
            <span className="font-semibold text-brand-700">
              Terms of Service
            </span>{" "}
            and acknowledge the{" "}
            <span className="font-semibold text-brand-700">
              Privacy Practices
            </span>
            .
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full"
          loading={loading}
          icon={<ArrowRight className="h-5 w-5" />}
        >
          Create Account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4 text-sm text-ink-400">
        <span className="h-px flex-1 bg-ink-100" /> Registering a healthcare
        facility? <span className="h-px flex-1 bg-ink-100" />
      </div>
      <Link
        href="/register-hospital"
        className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-ink-200 bg-white text-sm font-semibold text-ink-900 shadow-sm hover:bg-ink-50"
      >
        <Building2 className="h-5 w-5 text-brand-700" /> Register a hospital or
        clinic
      </Link>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
