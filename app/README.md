# Medora web portal

Next.js 16.4.5 application for the Medora microservice backend. Runtime screens use
real API modules; test fixtures are isolated under `tests/`.

## Run the frontend

```sh
npm ci
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL to your hosted API Gateway when available.
npm run dev
```

`NEXT_PUBLIC_API_BASE_URL` is compiled into the browser bundle. Set it before
`npm run build` and rebuild after changing it. The development fallback is
`http://localhost:8080`; it requires a local backend and will not connect until one
exists. No hosted URL has been configured for this checkout.

```sh
npm run lint
npm test
npx tsc --noEmit --incremental false
npm run build
npm start
```

`npm start` prepares the standalone server's static assets and starts it. Set `PORT`
and `HOSTNAME` for your deployment. Next's Google font loader needs internet access
at build time.

## Workspaces

| Account | Workflows |
| --- | --- |
| Patient | Profile onboarding/editing, care records, prescriptions, lab reports, QR identity, booking/rescheduling/cancellation, notifications |
| Doctor | Profile onboarding/editing, facility selection, QR patient lookup, medical notes/prescriptions, lab report links, schedules, appointment completion/cancellation |
| Hospital administrator | Facility overview, doctor affiliations, departments, opening hours, appointments, structured reports/downloads |
| Receptionist | Facility-scoped appointment booking/rescheduling/cancellation with QR patient identification |
| Lab technician | QR patient identification and hosted diagnostic report links for their assigned facility |
| Platform administrator | Facility review/directory, staff creation/assignment, account status, audit logs |

Hospital staff must have an approved facility assignment. Staff can access only the
screens appropriate to their role. Administrators create staff accounts without
replacing their own session.

## API contracts and session state

`src/lib/api/` contains typed API modules and explicit DTO adapters. Each adapter
maps its entity's own UUID; patient, doctor, account, record and facility UUIDs are
separate identities. Pagination adapters accept the backend's `page` field.

`src/lib/http.ts` attaches bearer/correlation headers, unwraps response envelopes,
and coordinates one refresh request for concurrent expirations. Both returned
tokens are stored on rotation. Login, logout and expiry clear private query data;
notifications and the persisted doctor workspace are account-scoped.

Doctor selection is a browser workspace, not a server check-in session. Clinical
writes send `X-Workspace-Tenant-ID` as context. The server resolves the clinician's
account to their profile and validates active affiliation before saving. Headers
never establish account identity or grant affiliation.

## Documents and reports

Lab report entry accepts an existing HTTPS document URL from approved storage;
there is no binary-upload/storage API in this backend. Protect those documents
using your storage provider's access policies. Structured operational reports use
`resultSummary`, `payload` and `failureReason`, and can be downloaded as JSON.

## Deployment and validation

See [INTEGRATION.md](INTEGRATION.md) for paired backend changes, environment
settings, verification evidence, and the remaining hosted-service checks.

The portal currently uses browser-readable bearer-token cookies because it calls
the gateway directly. Proxy route guards improve navigation; backend JWT and scope
checks provide authorization. An HttpOnly-cookie BFF is a separate deployment
architecture and has not been implemented here.

`Medora-Showcase` is an independent presentation site. The mobile application source
is not included in these projects.
