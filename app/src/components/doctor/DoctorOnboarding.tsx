"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  GraduationCap,
  Phone,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useCreateDoctorProfile } from "@/hooks/useDoctorData";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Card, CardContent } from "@/components/ui/Card";
import { ApiError } from "@/lib/http";
import type { DoctorCreatePayload } from "@/types/api";
import { useAuth } from "@/context/AuthContext";

type FormState = Omit<DoctorCreatePayload, "userId">;

export function DoctorOnboarding() {
  const { user } = useAuth();
  const createProfile = useCreateDoctorProfile();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    slmcNumber: "",
    specialization: "",
    subSpecialization: "",
    experienceYears: 0,
    education: "",
    bio: "",
    profileImageUrl: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createProfile.mutateAsync(form);
      toast.success("Doctor profile submitted.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save your profile.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="overflow-hidden rounded-3xl bg-[#142f50] p-7 text-white shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/16 backdrop-blur">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="mt-8 text-3xl font-semibold leading-tight tracking-tight">
            Complete your clinical profile
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/80">
            Add your professional details so facilities can recognize your
            credentials and invite you to their care teams.
          </p>
          <div className="mt-8 space-y-3">
            {[
              ["Identity", "Name and contact details"],
              ["Credentials", "Registration and specialty"],
              ["Experience", "Education and professional bio"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/12 bg-white/12 p-4 backdrop-blur"
              >
                <p className="text-xs font-bold text-white/60">{label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-brand-100/80">
          <CardContent className="p-5 sm:p-7">
            <form onSubmit={onSubmit} className="space-y-6">
              <SectionTitle icon={Phone} title="Contact details" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required>
                  <Input
                    required
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                </Field>
                <Field label="Last name" required>
                  <Input
                    required
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                </Field>
                <Field label="Email" required>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
                <Field label="Phone" required>
                  <Input
                    required
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+94771112222"
                  />
                </Field>
              </div>

              <SectionTitle icon={BadgeCheck} title="Clinical credentials" />
              <Field
                label="Medical registration number"
                required
                hint="Your professional registration number"
              >
                <Input
                  required
                  value={form.slmcNumber}
                  onChange={(e) => set("slmcNumber", e.target.value)}
                  placeholder="REG12345"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Specialization" required>
                  <Input
                    required
                    value={form.specialization}
                    onChange={(e) => set("specialization", e.target.value)}
                    placeholder="Cardiology"
                  />
                </Field>
                <Field label="Sub-specialization" hint="Optional">
                  <Input
                    value={form.subSpecialization}
                    onChange={(e) => set("subSpecialization", e.target.value)}
                    placeholder="Interventional Cardiology"
                  />
                </Field>
              </div>

              <SectionTitle icon={GraduationCap} title="Experience" />
              <div className="grid gap-4 sm:grid-cols-[0.45fr_1fr]">
                <Field label="Years of experience" required>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={form.experienceYears}
                    onChange={(e) =>
                      set("experienceYears", Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Education" hint="Optional">
                  <Input
                    value={form.education}
                    onChange={(e) => set("education", e.target.value)}
                    placeholder="MBBS, MD"
                  />
                </Field>
              </div>
              <Field label="Short bio" hint="Optional">
                <Textarea
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Consultant cardiologist with a focus on..."
                />
              </Field>

              {error && (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={createProfile.isPending}
              >
                Save and continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-100 pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-900">
        {title}
      </h2>
    </div>
  );
}
