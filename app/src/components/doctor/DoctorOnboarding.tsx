'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Stethoscope } from 'lucide-react';
import { useCreateDoctorProfile } from '@/hooks/useDoctorData';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Card, CardContent } from '@/components/ui/Card';
import { ApiError } from '@/lib/http';
import type { DoctorCreatePayload } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

type FormState = Omit<DoctorCreatePayload, 'userId'>;

export function DoctorOnboarding() {
  const { user } = useAuth();
  const createProfile = useCreateDoctorProfile();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    slmcNumber: '',
    specialization: '',
    subSpecialization: '',
    experienceYears: 0,
    education: '',
    bio: '',
    profileImageUrl: '',
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createProfile.mutateAsync(form);
      toast.success('Doctor profile submitted.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
          <Stethoscope className="h-6 w-6 text-brand-600" />
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">Complete your clinical profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          Verified against your SLMC registration. You&apos;ll request hospital affiliations next.
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" required>
                <Input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
              </Field>
              <Field label="Last name" required>
                <Input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" required>
                <Input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Phone" required>
                <Input required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+94771112222" />
              </Field>
            </div>

            <Field label="SLMC registration number" required hint="Sri Lanka Medical Council number">
              <Input required value={form.slmcNumber} onChange={(e) => set('slmcNumber', e.target.value)} placeholder="SLMC12345" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Specialization" required>
                <Input required value={form.specialization} onChange={(e) => set('specialization', e.target.value)} placeholder="Cardiology" />
              </Field>
              <Field label="Sub-specialization" hint="Optional">
                <Input value={form.subSpecialization} onChange={(e) => set('subSpecialization', e.target.value)} placeholder="Interventional Cardiology" />
              </Field>
            </div>

            <Field label="Years of experience" required>
              <Input
                type="number"
                min={0}
                required
                value={form.experienceYears}
                onChange={(e) => set('experienceYears', Number(e.target.value))}
              />
            </Field>

            <Field label="Education" hint="Optional">
              <Input value={form.education} onChange={(e) => set('education', e.target.value)} placeholder="MBBS, MD" />
            </Field>

            <Field label="Short bio" hint="Optional">
              <Textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Consultant cardiologist with a focus on..." />
            </Field>

            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>}

            <Button type="submit" className="w-full" loading={createProfile.isPending}>
              Save and continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
