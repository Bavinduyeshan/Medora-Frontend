"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCurrentDoctor,
  useDoctorSchedules,
  useDoctorAffiliations,
} from "@/hooks/useDoctorData";
import { doctorsApi } from "@/lib/api/doctors";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { PageHeader, ErrorState, Spinner } from "@/components/ui/Feedback";
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export default function SchedulesPage() {
  const { data: doctor } = useCurrentDoctor();
  const affiliations = useDoctorAffiliations(doctor?.id);
  const schedules = useDoctorSchedules(doctor?.id);
  const qc = useQueryClient();
  const [tenantId, setTenantId] = useState("");
  const [day, setDay] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [duration, setDuration] = useState(15);
  const [capacity, setCapacity] = useState(20);
  const [available, setAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!doctor) return;
    setError("");
    setSaved(false);
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }
    setBusy(true);
    try {
      await doctorsApi.upsertSchedule(doctor.id, {
        tenantId,
        dayOfWeek: day,
        startTime: start,
        endTime: end,
        slotDurationMins: duration,
        maxPatients: capacity,
        isAvailable: available,
      });
      await qc.invalidateQueries({ queryKey: ["doctor-schedules"] });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save schedule.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Availability"
        title="Clinic schedules"
        description="Publish your weekly availability at an actively affiliated facility. Saving the same facility and day updates that schedule."
      />
      {schedules.isLoading && <Spinner />}
      {schedules.error && (
        <ErrorState
          message={schedules.error.message}
          onRetry={() => schedules.refetch()}
        />
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {schedules.data?.map((s) => (
          <button
            key={s.id}
            className="rounded-2xl border border-ink-100 bg-white p-5 text-left hover:border-brand-300"
            onClick={() => {
              setTenantId(s.tenantId);
              setDay(s.dayOfWeek);
              setStart(s.startTime.slice(0, 5));
              setEnd(s.endTime.slice(0, 5));
              setDuration(s.slotDurationMins);
              setCapacity(s.maxPatients);
              setAvailable(s.isAvailable);
              setSaved(false);
            }}
          >
            <p className="font-semibold">
              {DAYS[s.dayOfWeek]} · {s.startTime.slice(0, 5)}–
              {s.endTime.slice(0, 5)}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              {affiliations.data?.find((a) => a.tenantId === s.tenantId)
                ?.tenantName || s.tenantId}{" "}
              · {s.slotDurationMins} min ·{" "}
              {s.isAvailable ? "Available" : "Unavailable"}
            </p>
            <p className="mt-2 text-sm text-brand-600">Edit availability</p>
          </button>
        ))}
      </div>
      <form
        onSubmit={save}
        className="max-w-3xl space-y-5 rounded-2xl border border-ink-100 bg-white p-6"
      >
        <h2 className="text-xl font-semibold">Add or update availability</h2>
        <Field label="Facility" required>
          <Select
            required
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          >
            <option value="">Choose facility</option>
            {affiliations.data
              ?.filter((a) => a.status === "ACTIVE")
              .map((a) => (
                <option key={a.id} value={a.tenantId}>
                  {a.tenantName || a.tenantId}
                </option>
              ))}
          </Select>
        </Field>
        {affiliations.error && <p role="alert">{affiliations.error.message}</p>}
        <Field label="Day" required>
          <Select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start" required>
            <Input
              required
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="End" required>
            <Input
              required
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
          <Field label="Slot length (minutes)" required>
            <Input
              required
              type="number"
              min={5}
              max={120}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </Field>
          <Field label="Maximum patients" required>
            <Input
              required
              type="number"
              min={1}
              max={1000}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />{" "}
          Available for appointments
        </label>
        {error && (
          <p role="alert" className="text-rose-700">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-emerald-700">
            Availability saved.
          </p>
        )}
        <Button type="submit" loading={busy}>
          Save schedule
        </Button>
      </form>
    </div>
  );
}
