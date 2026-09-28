'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { tenantsApi } from '@/lib/api/tenants';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { ApiError } from '@/lib/http';
import type { TenantRequestPayload, TenantType } from '@/types/api';

const TENANT_TYPES: TenantType[] = ['HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'PHARMACY'];

const emptyForm: TenantRequestPayload = {
  name: '',
  type: 'HOSPITAL',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Sri Lanka',
  phone: '',
  email: '',
  website: '',
  registrationNumber: '',
  licenseDocumentUrl: '',
};

export default function RegisterHospitalPage() {
  const [form, setForm] = useState<TenantRequestPayload>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof TenantRequestPayload>(key: K, value: TenantRequestPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await tenantsApi.requestRegistration(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50">
          <CheckCircle2 className="h-8 w-8 text-brand-600" />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-normal text-ink-950">Registration submitted</h2>
        <p className="mt-3 text-sm leading-7 text-ink-500">
          Thanks. {form.name} is now in the review queue. Our admin team verifies registration details and will email{' '}
          <span className="font-bold text-ink-800">{form.email}</span> once your facility is approved.
        </p>
        <Link href="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Building2 className="h-5 w-5" />
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-wider text-brand-600">Facility onboarding</p>
      <h2 className="mt-2 text-3xl font-black tracking-normal text-ink-950">Register your hospital or clinic</h2>
      <p className="mt-2 text-sm leading-6 text-ink-500">
        Submit your facility for review. An admin will verify your registration number before activating your workspace.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Facility name" required>
          <Input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Colombo General Hospital" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Facility type" required>
            <Select value={form.type} onChange={(e) => set('type', e.target.value as TenantType)}>
              {TENANT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Registration No." required>
            <Input required value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} placeholder="MOH-12345" />
          </Field>
        </div>

        <Field label="Address" required>
          <Input required value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="123 Hospital Road" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City" required>
            <Input required value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Colombo" />
          </Field>
          <Field label="Province" required>
            <Input required value={form.province} onChange={(e) => set('province', e.target.value)} placeholder="Western" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Postal code" required>
            <Input required value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="00100" />
          </Field>
          <Field label="Country" required>
            <Input required value={form.country} onChange={(e) => set('country', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" required>
            <Input required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+94112223333" />
          </Field>
          <Field label="Contact email" required>
            <Input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="info@hospital.lk" />
          </Field>
        </div>

        <Field label="Website" hint="Optional">
          <Input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://hospital.lk" />
        </Field>

        <Field label="License document URL" hint="Optional link to a hosted copy of your operating license">
          <Input value={form.licenseDocumentUrl} onChange={(e) => set('licenseDocumentUrl', e.target.value)} placeholder="https://storage.example/license.pdf" />
        </Field>

        {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Submit for review
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-500">
        <Link href="/login" className="font-black text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}