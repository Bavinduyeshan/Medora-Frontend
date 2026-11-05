"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  useTenantSchedule,
  useUpdateTenantSchedule,
} from "@/hooks/useHospitalData";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PageHeader, ErrorState, Spinner } from "@/components/ui/Feedback";
import type { ScheduleDayDto } from "@/types/api";
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function HoursEditor({ schedule }: { schedule: ScheduleDayDto[] }) {
  const { user } = useAuth();
  const [days, setDays] = useState(
    DAYS.map(
      (_, dayOfWeek) =>
        schedule.find((s) => s.dayOfWeek === dayOfWeek) || {
          dayOfWeek,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
        },
    ),
  );
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const update = useUpdateTenantSchedule(user?.tenantId || undefined);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(false);
    if (days.some((d) => !d.isClosed && d.closeTime <= d.openTime)) {
      setError("Closing time must be after opening time for every open day.");
      return;
    }
    try {
      await update.mutateAsync(days);
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save facility hours.",
      );
    }
  }
  function change(index: number, patch: Partial<ScheduleDayDto>) {
    setDays((current) =>
      current.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  }
  return (
    <form
      onSubmit={save}
      className="max-w-4xl space-y-4 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6"
    >
      {days.map((d, i) => (
        <div
          key={i}
          className="grid items-end gap-4 border-b border-ink-100 pb-5 sm:grid-cols-[1fr_1fr_1fr]"
        >
          <div>
            <h2 className="mb-3 font-semibold">{DAYS[i]}</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={d.isClosed}
                onChange={(e) => change(i, { isClosed: e.target.checked })}
              />
              Closed
            </label>
          </div>
          <Field label={`${DAYS[i]} opens`}>
            <Input
              required
              type="time"
              disabled={d.isClosed}
              value={d.openTime.slice(0, 5)}
              onChange={(e) => change(i, { openTime: e.target.value })}
            />
          </Field>
          <Field label={`${DAYS[i]} closes`}>
            <Input
              required
              type="time"
              disabled={d.isClosed}
              value={d.closeTime.slice(0, 5)}
              onChange={(e) => change(i, { closeTime: e.target.value })}
            />
          </Field>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-rose-700">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="text-emerald-700">
          Facility hours saved.
        </p>
      )}
      <Button loading={update.isPending} type="submit">
        Save opening hours
      </Button>
    </form>
  );
}
export default function FacilityHoursPage() {
  const { user } = useAuth();
  const schedule = useTenantSchedule(user?.tenantId || undefined);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Facility settings"
        title="Opening hours"
        description="Keep your weekly opening and closing times up to date."
      />
      {schedule.isLoading && <Spinner />}
      {schedule.error && (
        <ErrorState
          message={schedule.error.message}
          onRetry={() => schedule.refetch()}
        />
      )}
      {schedule.data && <HoursEditor schedule={schedule.data} />}
    </div>
  );
}
