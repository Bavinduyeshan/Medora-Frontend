"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrentPatient } from "@/hooks/usePatientData";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { medicalApi } from "@/lib/api/medical";
import { patientsApi } from "@/lib/api/patients";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  Spinner,
} from "@/components/ui/Feedback";
import { formatDateTime } from "@/lib/utils";
export function LabReportWorkspace({
  patientId: suppliedPatientId,
  recordId,
}: {
  patientId?: string;
  recordId?: string;
}) {
  const { user } = useAuth();
  const { data: patient } = useCurrentPatient();
  const tenantId =
    useActiveWorkspace((s) => s.activeTenantId) || user?.tenantId || "";
  const [identifiedPatientId, setIdentifiedPatientId] = useState("");
  const patientId = suppliedPatientId || patient?.id || identifiedPatientId;
  const readOnly = user?.role === "PATIENT";
  const [qr, setQr] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Blood Test");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const qc = useQueryClient();
  const reports = useQuery({
    queryKey: ["lab-reports", user?.id, patientId],
    enabled: !!patientId,
    queryFn: () => medicalApi.patientLabReports(patientId!),
  });
  async function identify() {
    setError("");
    setBusy(true);
    try {
      const result = await patientsApi.scanQr({
        qrToken: qr.trim(),
        tenantId,
        purpose: "LAB_TEST",
      });
      setIdentifiedPatientId(result.patientId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Patient lookup failed.");
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!patientId || !tenantId) {
      setError("Identify a patient and select your facility first.");
      return;
    }
    if (!/^https:\/\//i.test(url)) {
      setError("Use a secure HTTPS link to the hosted report.");
      return;
    }
    setBusy(true);
    try {
      await medicalApi.uploadLabReport({
        patientId,
        recordId,
        title,
        type,
        fileUrl: url,
        resultsSummary: notes,
        testDate: date,
      });
      await qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey.some(
            (k) => typeof k === "string" && k.includes("lab-reports"),
          ),
      });
      setTitle("");
      setUrl("");
      setNotes("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add report.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Diagnostics"
        title="Lab reports"
        description={
          readOnly
            ? "Your diagnostic results and original report documents."
            : "Add results from your laboratory’s secure document storage."
        }
      />
      {!readOnly && !suppliedPatientId && (
        <div className="max-w-2xl space-y-3 rounded-2xl border border-ink-100 bg-white p-5">
          <Field label="Patient QR token" required>
            <Input
              value={qr}
              onChange={(e) => {
                setQr(e.target.value);
                setIdentifiedPatientId("");
              }}
            />
          </Field>
          <Button
            disabled={!tenantId || !qr.trim()}
            loading={busy}
            onClick={identify}
          >
            Identify patient
          </Button>
          {identifiedPatientId && (
            <p role="status" className="text-sm text-emerald-700">
              Patient identified · {identifiedPatientId.slice(0, 8)}
            </p>
          )}
        </div>
      )}
      {reports.isLoading && <Spinner />}
      {reports.error && (
        <ErrorState
          message={reports.error.message}
          onRetry={() => reports.refetch()}
        />
      )}
      {patientId &&
        !reports.isLoading &&
        !reports.error &&
        !reports.data?.length && (
          <EmptyState icon={FileText} title="No lab reports yet" />
        )}
      <div className="grid gap-4 md:grid-cols-2">
        {reports.data?.map((report) => (
          <article
            key={report.id}
            className="space-y-3 rounded-2xl border border-ink-100 bg-white p-5"
          >
            <h2 className="text-lg font-semibold">{report.title}</h2>
            <p className="text-sm text-ink-500">
              {report.type} · {formatDateTime(report.reportedAt)}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-ink-600">
              {report.resultsSummary}
            </p>
            {report.fileUrl && /^https:\/\//i.test(report.fileUrl) && (
              <a
                className="inline-flex text-sm font-medium text-brand-600"
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original report ↗
              </a>
            )}
          </article>
        ))}
      </div>
      {!readOnly && patientId && (
        <form
          onSubmit={save}
          className="max-w-3xl space-y-5 rounded-2xl border border-ink-100 bg-white p-6"
        >
          <h2 className="text-xl font-semibold">Add lab report</h2>
          <p className="text-sm leading-6 text-ink-500">
            Upload the document to your approved storage, then add its secure
            link here.
          </p>
          <Field label="Report title" required>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Report type" required>
              <Input
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </Field>
            <Field label="Test date" required>
              <Input
                required
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Secure document URL" required>
            <Input
              required
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Field>
          <Field label="Results summary">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={busy} disabled={!tenantId}>
            Save report
          </Button>
        </form>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
    </section>
  );
}
