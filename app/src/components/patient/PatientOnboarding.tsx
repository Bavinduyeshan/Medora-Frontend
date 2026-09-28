'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { HeartPulse } from 'lucide-react';
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
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
          <HeartPulse className="h-6 w-6 text-brand-600" />
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">Complete your health profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          This creates your patient record and issues your identity QR code.
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Blood group" required>
                <Select value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value as BloodGroup)}>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="National ID" required>
                <Input required value={form.nationalId} onChange={(e) => set('nationalId', e.target.value)} placeholder="951234567V" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" required>
                <Input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Phone" required>
                <Input required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+94771234567" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Emergency contact name" required>
                <Input required value={form.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} />
              </Field>
              <Field label="Emergency contact phone" required>
                <Input required value={form.emergencyContactPhone} onChange={(e) => set('emergencyContactPhone', e.target.value)} />
              </Field>
            </div>

            <Field label="Address" required>
              <Input required value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City" required>
                <Input required value={form.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label="Province" required>
                <Input required value={form.province} onChange={(e) => set('province', e.target.value)} />
              </Field>
            </div>

            <Field label="Known allergies" hint="Comma-separated, optional">
              <Textarea value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Penicillin, Peanuts" />
            </Field>

            <Field label="Chronic conditions" hint="Comma-separated, optional">
              <Textarea value={form.chronicConditions} onChange={(e) => set('chronicConditions', e.target.value)} placeholder="Asthma, Type 2 Diabetes" />
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
