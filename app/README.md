# Medora — Web Portal

A production-grade Next.js (App Router) frontend for the Medora microservice backend
described in `Medora_API_Documentation.md`. Every screen is wired to the real,
documented API — there is no mock data anywhere in this codebase.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** with a custom design system (`src/app/globals.css`)
- **TanStack React Query** for all server state (fetching, caching, mutations)
- **Axios** with a request/response interceptor pipeline (JWT attach, single-flight
  refresh-token handling, correlation IDs)
- **Zustand** for the one piece of genuinely local UI state (see "Doctor check-in" below)
- **sonner** for toasts, **lucide-react** for icons, **qrcode.react** for QR rendering

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your gateway
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

> **Note:** `next/font/google` fetches Inter and JetBrains Mono at build time, so the
> build machine needs outbound internet access to `fonts.googleapis.com` (true of any
> standard CI/CD runner or local dev machine). If you build in a fully offline/sandboxed
> environment, switch `src/app/layout.tsx` to `next/font/local` with self-hosted font files.

## Environment variables

See `.env.example`. The only one you must set correctly is `NEXT_PUBLIC_API_BASE_URL`,
which should point at your API Gateway (not an individual microservice port).

## Architecture

### API layer (`src/lib/api/*`, `src/types/api.ts`)

One typed module per backend microservice — `auth`, `users`, `tenants`, `patients`,
`doctors`, `medical`, `appointments`, `reports`, `audit`, `notifications` — each a thin,
fully-typed wrapper around the endpoints in the API documentation. `src/lib/http.ts` is
the shared axios instance: it attaches the JWT, retries once through a single-flight
refresh queue on 401s, tags every request with a correlation ID, and normalizes errors
into a typed `ApiError`.

### Auth & session (`src/context/AuthContext.tsx`, `src/lib/sessionCookies.ts`, `src/middleware.ts`)

Sessions are stored in cookies (not `localStorage`) specifically so that Next.js
**middleware** can guard `/patient`, `/doctor`, `/hospital`, and `/admin` routes at the
edge — redirecting unauthenticated users to `/login` and redirecting users to their own
portal if they land on someone else's. `AuthContext` hydrates the session client-side on
load and exposes `login`, `register`, `logout`.

**Security tradeoff, stated plainly:** because this SPA calls the API Gateway directly
from the browser (no Next.js backend-for-frontend), the access/refresh tokens live in
cookies that are readable by client JS (`httpOnly: false`) — otherwise axios couldn't
attach the `Authorization` header. This has the same XSS exposure profile as
`localStorage`-based JWT storage, which is an extremely common pattern for SPAs talking
to an external API, but it is **not** the hardened option. To harden this for a real
production deployment, add Next.js Route Handlers that proxy `/api/*` calls to the
gateway server-side and switch to `httpOnly` cookies — the API modules in `src/lib/api/*`
would not need to change, only `src/lib/http.ts`'s base URL and cookie handling.

### Profile onboarding gate

Registering a user (`POST /api/auth/register`) only creates an account — it does not
create a `Patient` or `Doctor` domain profile. `PatientLayout` / `DoctorLayout` check for
that profile on first login and render a one-time onboarding form
(`PatientOnboarding.tsx` / `DoctorOnboarding.tsx`) that calls `POST /api/patients` or
`POST /api/doctors` before showing the real dashboard.

### Doctor "check-in" (`src/hooks/useActiveWorkspace.ts`)

The documented API models doctor↔hospital relationships as durable **affiliations**
(`ACTIVE` / `INACTIVE` / `PENDING`) — there is no session/check-in endpoint. To keep a
familiar "which facility am I working from right now" UX without inventing a backend
contract, the doctor's currently-selected tenant is tracked **client-side only**
(Zustand + localStorage), and can only be set to a tenant where the doctor already holds
a real, server-verified `ACTIVE` affiliation. It's used purely to pre-select the tenant
context for QR scans and new records — every actual write still goes through the real
API and is subject to the backend's own authorization checks.

### Doctor-side affiliation requests

`POST /api/doctors/{id}/affiliations` is restricted to `ADMIN` / `HOSPITAL_ADMIN` per the
documented RBAC — a doctor cannot self-request an affiliation through that endpoint. The
doctor's **Affiliations** page is therefore intentionally read-only, with a note directing
them to ask a hospital administrator to add them (via the Hospital portal's **Add
doctor** flow, which searches `GET /api/doctors/search` and calls the same endpoint with
the appropriate role).

### Admin dashboard stats

There is no aggregate `/stats` endpoint in the documented API. The admin dashboard
derives its numbers from the `totalElements` field of the paginated list endpoints
(`/api/tenants/pending`, `/api/users`, `/api/audit/logs`) rather than fabricating a stats
service.

## Route map

| Path | Role | Notes |
|---|---|---|
| `/` | public | Marketing landing page |
| `/login`, `/register`, `/register-hospital`, `/forgot-password`, `/reset-password?token=…` | public | Authentication, recovery + facility registration |
| `/patient`, `/patient/records`, `/patient/records/[id]`, `/patient/prescriptions`, `/patient/appointments`, `/patient/qr` | PATIENT | |
| `/doctor`, `/doctor/patients/[patientId]`, `/doctor/affiliations`, `/doctor/appointments` | DOCTOR | |
| `/hospital`, `/hospital/affiliations`, `/hospital/departments`, `/hospital/reports` | HOSPITAL_ADMIN (+ RECEPTIONIST/LAB_TECHNICIAN read access) | |
| `/admin`, `/admin/tenants`, `/admin/users`, `/admin/audit` | ADMIN | |

## What's not wired up yet

- Camera-based QR scanning (the scan modal currently accepts a manually entered token —
  swap in a library like `@zxing/browser` behind the same `ScanQrModal` component when
  ready)
- Doctor schedule management UI (the `doctorsApi.upsertSchedule` / `listSchedules` /
  `scheduleAtTenant` endpoints are implemented in the API layer but have no page yet)
- Lab report upload UI (`medicalApi.uploadLabReport` is implemented but not exposed in
  a form — currently only display of existing lab reports is wired)
- File/document upload for hospital license documents on the registration form (it
  currently accepts a URL to an already-hosted file, per the documented DTO shape)

## Interface

The public site, account screens, and all four portals share the Medora blue/slate
palette, readable typography, consistent form controls, and responsive layouts.
`src/components/layout/PortalShell.tsx` provides role-specific navigation, a working
page finder (Cmd/Ctrl+K), notifications, and a keyboard-accessible mobile menu.
Shared fields associate labels, hints, and errors with their controls; dialogs
trap focus, close with Escape, and restore focus to their trigger.

Password recovery uses the existing `authApi.forgotPassword` and
`authApi.resetPassword` endpoints. Configure the backend recovery email to link to
this frontend's `/reset-password?token=…` URL. Hospital SSO and QR sign-in are not
shown as available sign-in methods because they have no frontend implementation.
