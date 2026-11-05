"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { ApiError } from "@/lib/http";
import type { TenantRequestPayload, TenantType } from "@/types/api";

const TENANT_TYPES: TenantType[] = [
  "HOSPITAL",
  "CLINIC",
  "DIAGNOSTIC_CENTER",
  "PHARMACY",
];

const emptyForm: TenantRequestPayload = {
  name: "",
  type: "HOSPITAL",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Sri Lanka",
  phone: "",
  email: "",
  website: "",
  registrationNumber: "",
  licenseDocumentUrl: "",
};

export default function RegisterHospitalPage() {
  const [form, setForm] = useState<TenantRequestPayload>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof TenantRequestPayload>(
    key: K,
    value: TenantRequestPayload[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await tenantsApi.requestRegistration(form);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not submit your registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 ring-8 ring-brand-500/10">
          <CheckCircle2 className="h-10 w-10 text-brand-600" />
        </div>
        <h2 className="mt-7 text-3xl font-semibold tracking-tight text-ink-950">
          Registration submitted
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-8 text-ink-600">
          {form.name} is now in the review queue. Our admin team will verify the
          registration details and email{" "}
          <span className="font-semibold text-ink-900">{form.email}</span> once
          your facility is approved.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-700">
          <Building2 className="h-4 w-4 text-brand-600" /> Facility registration
        </span>
        <span className="hidden items-center gap-2 text-sm font-semibold text-emerald-700 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />{" "}
          Registration review
        </span>
      </div>

      <h1>Register your facility.</h1>
      <p className="mt-4 text-base leading-7 text-ink-600">
        Submit a hospital, clinic, pharmacy, or diagnostic center for Medora
        approval.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Facility name" required>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              className="pl-11"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Colombo General Hospital"
            />
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facility type" required>
            <Select
              value={form.type}
              onChange={(e) => set("type", e.target.value as TenantType)}
            >
              {TENANT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Registration No." required>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                className="pl-11"
                required
                value={form.registrationNumber}
                onChange={(e) => set("registrationNumber", e.target.value)}
                placeholder="MOH-12345"
              />
            </div>
          </Field>
        </div>

        <Field label="Address" required>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              className="pl-11"
              required
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Hospital Road"
            />
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" required>
            <Input
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Colombo"
            />
          </Field>
          <Field label="Province" required>
            <Input
              required
              value={form.province}
              onChange={(e) => set("province", e.target.value)}
              placeholder="Western"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Postal code" required>
            <Input
              required
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              placeholder="00100"
            />
          </Field>
          <Field label="Country" required>
            <Input
              required
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" required>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                className="pl-11"
                type="tel"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+94112223333"
              />
            </div>
          </Field>
          <Field label="Contact email" required>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                className="pl-11"
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="info@hospital.lk"
              />
            </div>
          </Field>
        </div>

        <Field label="Website" hint="Optional">
          <div className="relative">
            <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              className="pl-11"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://hospital.lk"
            />
          </div>
        </Field>

        <Field
          label="License document URL"
          hint="Optional link to a hosted copy of your operating license"
        >
          <Input
            value={form.licenseDocumentUrl}
            onChange={(e) => set("licenseDocumentUrl", e.target.value)}
            placeholder="https://storage.example/license.pdf"
          />
        </Field>

        <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm leading-6 text-ink-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          Our team reviews license details, registration numbers, and contact
          ownership before activating facility access.
        </div>

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
          Submit for Review
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
