'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { HeartPulse, Phone, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { useCreatePatientProfile } from '@/hooks/usePatientData';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Card, CardContent } from '@/components/ui/Card';
import { ApiError } from '@/lib/http';
import type { BloodGroup, GenderType, PatientCreatePayload } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

const BLOOD_GROUPS: BloodGroup[] = [
  'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN',
];

type FormState = Omit<PatientCreatePayload, 'userId'>;

export function PatientOnboarding() {
  const { user } = useAuth();
  const createProfile = useCreatePatientProfile();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'PREFER_NOT_TO_SAY' as GenderType,
    bloodGroup: 'UNKNOWN',
    nationalId: '',
    email: user?.email || '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    city: '',
    province: '',
    allergies: '',
    chronicConditions: '',
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createProfile.mutateAsync(form);
      toast.success('Profile created. Welcome to Medora!');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#0b5fff_0%,#0ea5e9_52%,#0f172a_100%)] p-7 text-white shadow-2xl shadow-brand-950/15">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/16 backdrop-blur">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h1 className="mt-8 text-3xl font-black leading-tight tracking-normal">Complete your health profile</h1>
          <p className="mt-4 text-sm leading-7 text-white/80">
            Add the details care teams need to identify you, contact you, and understand important health context.
          </p>
          <div className="mt-8 space-y-3">
            {[
              ['Identity', 'Name, birthday, national ID'],
              ['Contacts', 'Phone and emergency contact'],
              ['Health notes', 'Allergies and conditions'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/12 bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-bold text-white/60">{label}</p>
                <p className="mt-1 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-brand-100/80">
          <CardContent className="p-5 sm:p-7">
          <form onSubmit={onSubmit} className="space-y-6">
            <SectionTitle icon={UserRound} title="Personal details" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" required>
                <Input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
              </Field>
              <Field label="Last name" required>
                <Input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
              </Field>
              <Field label="Date of birth" required>
                <Input type="date" required value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              </Field>
              <Field label="Gender" required>
                <Select value={form.gender} onChange={(e) => set('gender', e.target.value as GenderType)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </Select>
              </Field>
              <Field label="Blood group" required>
                <Select value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value as BloodGroup)}>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>{b.replace('_', ' ')}</option>
                  ))}
                </Select>
              </Field>
              <Field label="National ID" required>
                <Input required value={form.nationalId} onChange={(e) => set('nationalId', e.target.value)} placeholder="951234567V" />
              </Field>
            </div>

            <SectionTitle icon={Phone} title="Contact details" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" required>
                <Input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Phone" required>
                <Input required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+94771234567" />
              </Field>
              <Field label="Emergency contact name" required>
                <Input required value={form.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} />
              </Field>
              <Field label="Emergency contact phone" required>
                <Input required value={form.emergencyContactPhone} onChange={(e) => set('emergencyContactPhone', e.target.value)} />
              </Field>
            </div>

            <SectionTitle icon={ShieldCheck} title="Address and health notes" />
            <Field label="Address" required>
              <Input required value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" required>
                <Input required value={form.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label="Province" required>
                <Input required value={form.province} onChange={(e) => set('province', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Known allergies" hint="Optional">
                <Textarea value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Penicillin, Peanuts" />
              </Field>
              <Field label="Chronic conditions" hint="Optional">
                <Textarea value={form.chronicConditions} onChange={(e) => set('chronicConditions', e.target.value)} placeholder="Asthma, Type 2 Diabetes" />
              </Field>
            </div>

            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>}

            <Button type="submit" size="lg" className="w-full" loading={createProfile.isPending}>
              Save and continue
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-100 pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-black uppercase tracking-wide text-ink-900">{title}</h2>
    </div>
  );
}