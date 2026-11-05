"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError } from "@/lib/http";
import { roleHomePath } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionExpired = params.get("reason") === "session-expired";
  const nextPath = params.get("next");
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.username}`);
      const home = roleHomePath(user.role);
      router.push(
        nextPath && (nextPath === home || nextPath.startsWith(`${home}/`))
          ? nextPath
          : home,
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.12em] text-brand-600">
        Welcome to Medora
      </p>
      <h1>Good to see you again.</h1>
      <p className="mb-8 mt-3 text-sm leading-7 text-ink-500">
        Sign in to your account to pick up where you left off.
      </p>
      {sessionExpired && (
        <div
          role="status"
          className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          Your session expired. Please sign in again.
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Email address" required>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              className="pl-11"
              type="email"
              autoComplete="email"
              name="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </Field>
        <Field label="Password" required>
          <PasswordInput
            required
            autoComplete="current-password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in <ArrowRight size={17} />
        </Button>
      </form>
      <div className="mt-7 flex items-center justify-center gap-2 text-xs text-ink-400">
        <ShieldCheck size={15} />
        <span>One account. Your dedicated care workspace.</span>
      </div>
      <div className="mt-8 border-t border-ink-100 pt-6 text-center text-sm text-ink-500">
        <p>
          New to Medora?{" "}
          <Link href="/register" className="font-semibold text-brand-600">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-xs">
          Registering a hospital or clinic?{" "}
          <Link
            href="/register-hospital"
            className="font-medium text-brand-600"
          >
            Register a facility
          </Link>
        </p>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
