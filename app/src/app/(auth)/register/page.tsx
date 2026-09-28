'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Stethoscope, HeartPulse } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { ApiError } from '@/lib/http';
import { cn, roleHomePath } from '@/lib/utils';
import type { UserRoleApi } from '@/types/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [role, setRole] = useState<Extract<UserRoleApi, 'PATIENT' | 'DOCTOR'>>('PATIENT');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ username, email, password, role });
      const user = await login({ email, password });
      toast.success('Account created. Let us finish setting up your profile.');
      router.push(roleHomePath(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-black tracking-normal text-ink-950">Create your account</h2>
      <p className="mt-2 text-sm leading-6 text-ink-500">Join Medora as a patient or a licensed doctor.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('PATIENT')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-[1.25rem] border p-4 text-center transition-all',
            role === 'PATIENT' ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10' : 'border-ink-200 hover:bg-brand-50/70'
          )}
        >
          <HeartPulse className={cn('h-5 w-5', role === 'PATIENT' ? 'text-brand-600' : 'text-ink-400')} />
          <span className="text-xs font-black text-ink-800">Patient</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('DOCTOR')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-[1.25rem] border p-4 text-center transition-all',
            role === 'DOCTOR' ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10' : 'border-ink-200 hover:bg-brand-50/70'
          )}
        >
          <Stethoscope className={cn('h-5 w-5', role === 'DOCTOR' ? 'text-brand-600' : 'text-ink-400')} />
          <span className="text-xs font-black text-ink-800">Doctor</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Username" required>
          <Input required minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. kasun.perera" />
        </Field>
        <Field label="Email address" required>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" required hint="At least 8 characters.">
          <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
        </Field>
        <Field label="Confirm password" required>
          <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" />
        </Field>

        {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" loading={loading} icon={<UserPlus className="h-4 w-4" />}>
          Create account
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-500">
        Already registered?{' '}
        <Link href="/login" className="font-black text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}