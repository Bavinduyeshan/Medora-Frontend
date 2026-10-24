'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, BadgeCheck, Eye, KeyRound, LogIn, QrCode, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { ApiError } from '@/lib/http';
import { roleHomePath } from '@/lib/utils';
import { env } from '@/config/env';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionExpired = params.get('reason') === 'session-expired';
  const nextPath = params.get('next');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.username}`);
      router.push(nextPath || roleHomePath(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
        <ShieldCheck className="h-3.5 w-3.5" /> Secure Medora sign in
      </div>

      <h2 className="text-3xl font-black tracking-normal text-ink-950">Welcome back</h2>
      <p className="mt-3 text-base leading-7 text-ink-600">Sign in to access your {env.appName} care workspace.</p>

      <button type="button" className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-ink-200 bg-white text-sm font-black text-ink-900 shadow-sm hover:bg-ink-50">
        <ShieldCheck className="h-4 w-4 text-brand-600" /> Continue with hospital sign-in
      </button>

      <div className="my-6 flex items-center gap-4 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100" /> or use your email <span className="h-px flex-1 bg-ink-100" />
      </div>

      {sessionExpired && (
        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Your session expired. Please sign in again.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email address" required>
          <div className="relative">
            <BadgeCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input className="pl-11" type="email" required autoFocus placeholder="you@medora.health" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </Field>
        <Field label="Password" required>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input className="pl-11 pr-11" type="password" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Eye className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>
        </Field>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 font-semibold text-ink-600"><input type="checkbox" className="h-4 w-4 accent-brand-600" defaultChecked /> Remember me</label>
          <Link href="/login" className="font-bold text-brand-700">Forgot password?</Link>
        </div>

        {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}

        <Button type="submit" size="md" className="h-12 w-full" loading={loading} icon={<LogIn className="h-4 w-4" />}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-ink-200 bg-brand-50/60 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700"><QrCode className="h-4 w-4" /></div>
          <div>
            <p className="text-xs font-black text-ink-950">QR sign in</p>
            <p className="text-[11px] text-ink-500">Fast access for shared care devices</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm">Scan</Button>
      </div>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p className="text-ink-500">
          New patient or doctor?{' '}
          <Link href="/register" className="font-black text-brand-600 hover:text-brand-700">Create an account</Link>
        </p>
        <p className="text-ink-500">
          Registering a hospital or clinic?{' '}
          <Link href="/register-hospital" className="font-black text-brand-600 hover:text-brand-700">Apply here</Link>
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