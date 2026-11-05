"use client";

// The Medora API models doctor <-> tenant relationships as durable
// "affiliations" (ACTIVE / INACTIVE / PENDING), not ephemeral check-in
// sessions. There is no POST /checkin endpoint in the documented API.
//
// To keep the familiar "which facility am I working from right now" UX
// without inventing a backend contract, we track the doctor's *currently
// selected* tenant (must already have an ACTIVE affiliation) client-side,
// scoped to this browser. It is used purely to pre-select the tenant context
// for QR scans and new medical records - every write still goes through the
// real, authorized API calls.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sessionCookies } from "@/lib/sessionCookies";

interface WorkspaceState {
  ownerUserId: string | null;
  activeTenantId: string | null;
  checkedInAt: string | null;
  checkIn: (tenantId: string) => void;
  checkOut: () => void;
}

export const useActiveWorkspace = create<WorkspaceState>()(
  persist(
    (set) => ({
      ownerUserId: null,
      activeTenantId: null,
      checkedInAt: null,
      checkIn: (tenantId) =>
        set({
          ownerUserId: sessionCookies.userId,
          activeTenantId: tenantId,
          checkedInAt: new Date().toISOString(),
        }),
      checkOut: () =>
        set({ ownerUserId: null, activeTenantId: null, checkedInAt: null }),
    }),
    { name: "healthpasslk.active-workspace" },
  ),
);
