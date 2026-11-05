"use client";

import { Building2, LogOut, ShieldCheck } from "lucide-react";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { Button } from "@/components/ui/Button";
import type { AffiliationDto } from "@/types/api";
import { formatDateTime } from "@/lib/utils";

export function CheckInPanel({
  affiliations,
}: {
  affiliations: AffiliationDto[];
}) {
  const { activeTenantId, checkedInAt, checkIn, checkOut } =
    useActiveWorkspace();
  const activeAffiliations = affiliations.filter((a) => a.status === "ACTIVE");
  const currentAffiliation = activeAffiliations.find(
    (a) => a.tenantId === activeTenantId,
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-ink-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`h-2.5 w-2.5 rounded-full ${activeTenantId ? "animate-pulse bg-emerald-400" : "bg-amber-400"}`}
        />
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
            Active Workspace
          </p>
          <p className="text-sm font-bold">
            {currentAffiliation
              ? currentAffiliation.tenantName || currentAffiliation.tenantId
              : "Not checked in"}
          </p>
          {checkedInAt && (
            <p className="text-[12px] text-emerald-400">
              Since {formatDateTime(checkedInAt)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {activeAffiliations.length === 0 && (
          <p className="text-xs text-ink-400">
            No active hospital affiliations yet.
          </p>
        )}
        {activeAffiliations.map((a) => (
          <button
            key={a.tenantId}
            onClick={() => checkIn(a.tenantId)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              a.tenantId === activeTenantId
                ? "bg-brand-600 text-white"
                : "bg-white/10 text-ink-200 hover:bg-white/20"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {a.tenantName || a.tenantId}
          </button>
        ))}
        {activeTenantId && (
          <Button
            variant="danger"
            size="sm"
            icon={<LogOut className="h-3.5 w-3.5" />}
            onClick={checkOut}
          >
            Check out
          </Button>
        )}
      </div>
    </div>
  );
}

export function AffiliationStatusNote() {
  return (
    <p className="flex items-center gap-2 text-[12px] text-ink-400">
      <ShieldCheck className="h-3.5 w-3.5" /> Affiliations are granted by
      hospital administrators and verified server-side before clinical record
      writes.
    </p>
  );
}
