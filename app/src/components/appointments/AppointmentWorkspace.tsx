"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { appointmentsApi } from "@/lib/api/appointments";
import { doctorsApi } from "@/lib/api/doctors";
import { patientsApi } from "@/lib/api/patients";
import { useAuth } from "@/context/AuthContext";
import { useCurrentPatient } from "@/hooks/usePatientData";
import { useCurrentDoctor } from "@/hooks/useDoctorData";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  Spinner,
} from "@/components/ui/Feedback";
import { formatDateTime } from "@/lib/utils";
import type { AppointmentDto } from "@/types/api";

export function AppointmentWorkspace() {
  const { user } = useAuth();
  const { data: patient } = useCurrentPatient();
  const { data: doctor } = useCurrentDoctor();
  const qc = useQueryClient();
  const isPatient = user?.role === "PATIENT";
  const isDoctor = user?.role === "DOCTOR";
  const tenantId = user?.tenantId ?? "";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDto | null>(null);
  const [doctorId, setDoctorId] = useState("");
  const [facility, setFacility] = useState("");
  const [resolvedPatient, setResolvedPatient] = useState("");
  const [qr, setQr] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const scope = isPatient ? patient?.id : isDoctor ? doctor?.id : tenantId;
  const {
    data: appointments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["appointments", user?.id, scope],
    enabled: !!scope,
    queryFn: () =>
      isPatient
        ? appointmentsApi.byPatient(scope!)
        : isDoctor
          ? appointmentsApi.byDoctor(scope!)
          : appointmentsApi.byTenant(scope!),
  });
  const doctors = useQuery({
    queryKey: ["booking-doctors", isPatient ? "network" : tenantId],
    enabled: open && !editing,
    queryFn: () =>
      isPatient ? doctorsApi.list() : doctorsApi.atTenant(tenantId),
  });
  const affiliations = useQuery({
    queryKey: ["booking-affiliations", doctorId],
    enabled: !!doctorId && isPatient && open,
    queryFn: () => doctorsApi.listAffiliations(doctorId),
  });
  const schedules = useQuery({
    queryKey: ["booking-schedules", doctorId, facility || tenantId],
    enabled: !!doctorId && !!(facility || tenantId) && open,
    queryFn: () => doctorsApi.scheduleAtTenant(doctorId, facility || tenantId),
  });
  function reset() {
    setEditing(null);
    setDoctorId("");
    setFacility("");
    setResolvedPatient("");
    setQr("");
    setStart("");
    setEnd("");
    setReason("");
    setFormError("");
    setOpen(true);
  }
  function reschedule(a: AppointmentDto) {
    setEditing(a);
    setStart("");
    setEnd("");
    setFormError("");
    setOpen(true);
  }
  async function resolvePatient() {
    setBusy(true);
    setFormError("");
    try {
      const result = await patientsApi.scanQr({
        qrToken: qr.trim(),
        tenantId,
        purpose: "CONSULTATION",
      });
      setResolvedPatient(result.patientId);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Patient lookup failed.");
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    await qc.invalidateQueries({
      predicate: (q) =>
        q.queryKey.some(
          (k) => typeof k === "string" && k.includes("appointments"),
        ),
    });
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    if (
      new Date(start).getTime() <= Date.now() ||
      new Date(end) <= new Date(start)
    ) {
      setFormError("Choose a future start time and an end time after it.");
      return;
    }
    if (!editing && !(patient?.id || resolvedPatient)) {
      setFormError("Identify the patient first.");
      return;
    }
    setBusy(true);
    try {
      if (editing)
        await appointmentsApi.reschedule(
          editing.id,
          new Date(start).toISOString(),
          new Date(end).toISOString(),
        );
      else
        await appointmentsApi.create({
          patientId: patient?.id || resolvedPatient,
          doctorId,
          tenantId: isPatient ? facility : tenantId,
          appointmentStart: new Date(start).toISOString(),
          appointmentEnd: new Date(end).toISOString(),
          reason,
        });
      await refresh();
      setOpen(false);
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Could not save appointment.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function action(a: AppointmentDto, complete: boolean) {
    setBusy(true);
    setFormError("");
    try {
      if (complete) await appointmentsApi.complete(a.id);
      else await appointmentsApi.cancel(a.id);
      await refresh();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Could not update appointment.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scheduling"
        title="Appointments"
        description="Book visits, manage changes, and keep care on schedule."
        actions={
          !isDoctor ? (
            <Button onClick={reset}>Book appointment</Button>
          ) : undefined
        }
      />
      {!open && formError && (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">
          {formError}
        </p>
      )}
      {isLoading && <Spinner />}
      {error && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}
      {!isLoading && !error && !appointments?.length && (
        <EmptyState
          icon={CalendarDays}
          title="No appointments yet"
          description="Your booked visits will appear here."
        />
      )}
      <div className="space-y-3">
        {appointments?.map((a) => (
          <article
            key={a.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-5 sm:flex-row sm:items-center"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold">
                  {formatDateTime(a.appointmentStart)}
                </h2>
                <Badge
                  tone={
                    a.status === "COMPLETED"
                      ? "success"
                      : a.status === "CANCELLED"
                        ? "neutral"
                        : "brand"
                  }
                >
                  {a.status}
                </Badge>
              </div>
              <p className="text-sm text-ink-500">
                {a.doctorName || "Doctor"} · {a.tenantName || "Facility"}
              </p>
              <p className="text-sm text-ink-500">{a.reason}</p>
            </div>
            {["SCHEDULED", "RESCHEDULED"].includes(a.status) && (
              <div className="flex flex-wrap gap-2">
                {!isDoctor && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reschedule(a)}
                  >
                    Reschedule
                  </Button>
                )}
                {isDoctor && (
                  <Button
                    size="sm"
                    loading={busy}
                    onClick={() => action(a, true)}
                  >
                    Mark complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  loading={busy}
                  onClick={() => action(a, false)}
                >
                  Cancel visit
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
      <Modal
        isOpen={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        title={editing ? "Reschedule appointment" : "Book an appointment"}
        description="Times use your device’s local time zone and are saved with their UTC offset."
      >
        <form onSubmit={submit} className="space-y-5">
          {!editing && (
            <>
              {!isPatient && (
                <>
                  <Field
                    label="Patient QR token"
                    hint="Use the token supplied by the patient to identify their profile."
                  >
                    <Input
                      value={qr}
                      onChange={(e) => {
                        setQr(e.target.value);
                        setResolvedPatient("");
                      }}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!qr.trim()}
                    loading={busy}
                    onClick={resolvePatient}
                  >
                    Identify patient
                  </Button>
                  {resolvedPatient && (
                    <p role="status" className="text-sm text-emerald-700">
                      Patient identified · {resolvedPatient.slice(0, 8)}
                    </p>
                  )}
                </>
              )}
              <Field label="Doctor" required>
                <Select
                  required
                  value={doctorId}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    setFacility("");
                  }}
                >
                  <option value="">Choose a doctor</option>
                  {doctors.data?.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} · {d.specialization}
                    </option>
                  ))}
                </Select>
              </Field>
              {doctors.error && <p role="alert">{doctors.error.message}</p>}
              {isPatient && (
                <Field label="Facility" required>
                  <Select
                    required
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    disabled={!doctorId}
                  >
                    <option value="">Choose an active facility</option>
                    {affiliations.data
                      ?.filter((a) => a.status === "ACTIVE")
                      .map((a) => (
                        <option key={a.id} value={a.tenantId}>
                          {a.tenantName || a.tenantId}
                        </option>
                      ))}
                  </Select>
                  {affiliations.error && (
                    <p role="alert">{affiliations.error.message}</p>
                  )}
                </Field>
              )}
              {schedules.data && (
                <div className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                  <p className="font-medium">Published availability</p>
                  {schedules.data.filter((s) => s.isAvailable).length ? (
                    schedules.data
                      .filter((s) => s.isAvailable)
                      .map((s) => (
                        <p key={s.id}>
                          {
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                              s.dayOfWeek
                            ]
                          }{" "}
                          · {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)} ·{" "}
                          {s.slotDurationMins} min slots
                        </p>
                      ))
                  ) : (
                    <p>
                      No schedule published. Confirm a time with the facility.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time" required>
              <Input
                required
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>
            <Field label="End time" required>
              <Input
                required
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>
          </div>
          {!editing && (
            <Field label="Reason for visit">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={1000}
              />
            </Field>
          )}
          {formError && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              {formError}
            </p>
          )}
          <Button type="submit" loading={busy} className="w-full">
            {editing ? "Save new time" : "Confirm booking"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
