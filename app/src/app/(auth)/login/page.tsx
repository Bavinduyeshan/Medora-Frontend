'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertTriangle, ShieldCheck } from 'lucide-react';
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
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <h2 className="mt-5 text-3xl font-black tracking-normal text-ink-950">Welcome back</h2>
      <p className="mt-2 text-sm leading-6 text-ink-500">Access your {env.appName} workspace with your secure account.</p>

      {sessionExpired && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Your session expired. Please sign in again.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Email address" required>
          <Input
            type="email"
            required
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" required>
          <Input
            type="password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" loading={loading} icon={<LogIn className="h-4 w-4" />}>
          Sign in
        </Button>
      </form>

      <div className="mt-7 space-y-2 text-center text-sm">
        <p className="text-ink-500">
          New patient or doctor?{' '}
          <Link href="/register" className="font-black text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
        <p className="text-ink-500">
          Registering a hospital or clinic?{' '}
          <Link href="/register-hospital" className="font-black text-brand-600 hover:text-brand-700">
            Apply here
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