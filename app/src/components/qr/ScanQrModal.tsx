"use client";

import { useState } from "react";
import { QrCode, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useScanPatientQr } from "@/hooks/useDoctorData";
import { ApiError } from "@/lib/http";

const PURPOSES = [
  "DIAGNOSIS",
  "CONSULTATION",
  "ADMISSION",
  "LAB_TEST",
  "PHARMACY",
];

export function ScanQrModal({
  isOpen,
  onClose,
  tenantId,
  onScanned,
}: {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null;
  onScanned: (patientId: string) => void;
}) {
  const [token, setToken] = useState("");
  const [purpose, setPurpose] = useState("DIAGNOSIS");
  const scanQr = useScanPatientQr();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      toast.error("Check in to a facility before scanning a patient.");
      return;
    }
    try {
      const result = await scanQr.mutateAsync({
        qrToken: token.trim(),
        tenantId,
        purpose,
      });
      toast.success("Patient identified.");
      setToken("");
      onScanned(result.patientId);
      onClose();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not resolve this QR code.",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Patient QR"
      description="Enter the token from the patient's QR code."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 py-8">
          <div className="text-center">
            <ScanLine className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-2 text-xs font-semibold text-ink-400">
              Paste the QR token shared by your patient, or use a connected QR
              scanner.
            </p>
          </div>
        </div>
        <Field label="QR token" required>
          <Input
            required
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. 6f6f3b2e-..."
          />
        </Field>
        <Field label="Purpose of scan" required>
          <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        {!tenantId && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            You need to check in to a facility first — scans are recorded
            against your active workspace.
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          loading={scanQr.isPending}
          icon={<QrCode className="h-4 w-4" />}
          disabled={!tenantId}
        >
          Resolve patient
        </Button>
      </form>
    </Modal>
  );
}
