"use client";

import { toast } from "sonner";
import { CalendarDays, Building2, CheckCircle2 } from "lucide-react";
import { appointmentsApi } from "@/lib/api/appointments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentDoctor, useDoctorAppointments } from "@/hooks/useDoctorData";
import {
  PageHeader,
  EmptyState,
  Spinner,
  ErrorState,
} from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/http";
import type { AppointmentStatus } from "@/types/api";

const STATUS_TONE: Record<
  AppointmentStatus,
  "brand" | "success" | "warning" | "danger" | "neutral"
> = {
  SCHEDULED: "brand",
  RESCHEDULED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export default function DoctorAppointmentsPage() {
  const { data: doctor } = useCurrentDoctor();
  const {
    data: appointments,
    isLoading,
    error,
    refetch,
  } = useDoctorAppointments(doctor?.id);
  const qc = useQueryClient();
  const complete = useMutation({
    mutationFn: (id: string) => appointmentsApi.complete(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["doctor-appointments"] }),
  });

  const onComplete = async (id: string) => {
    try {
      await complete.mutateAsync(id);
      toast.success("Appointment marked complete.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update appointment.",
      );
    }
  };

  const sorted = appointments
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.appointmentStart).getTime() -
        new Date(a.appointmentStart).getTime(),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scheduling"
        title="Appointments"
        description="Appointments booked with you across all affiliated facilities."
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && (
        <ErrorState
          message={(error as ApiError).message}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !error && (!sorted || sorted.length === 0) && (
        <EmptyState icon={CalendarDays} title="No appointments" />
      )}

      <div className="space-y-3">
        {sorted?.map((a) => (
          <div
            key={a.id}
            className="flex flex-col gap-3 rounded-2xl border border-brand-100/70 bg-white p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink-950">
                  {formatDateTime(a.appointmentStart)}
                </p>
                <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-ink-500">
                <Building2 className="h-3.5 w-3.5" />{" "}
                {a.tenantName || "Facility"}
              </p>
              {a.reason && (
                <p className="text-xs text-ink-400">Reason: {a.reason}</p>
              )}
            </div>
            {(a.status === "SCHEDULED" || a.status === "RESCHEDULED") && (
              <Button
                variant="outline"
                size="sm"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={complete.isPending}
                onClick={() => onComplete(a.id)}
              >
                Mark complete
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
