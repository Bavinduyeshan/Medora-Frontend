# Medora integration repair — 6 November 2026

The operational frontend and backend were repaired together. The separate showcase
site remains a presentation project. No Docker container, database, Redis instance,
backend application, migration, or real email delivery was started during this work.

## Changes

- Explicit DTO identities replace generic first-UUID guessing. Staff accounts,
  prescriptions, lab reports and QR scan logs retain their correct primary IDs.
- Refresh persists the rotating access/refresh pair, including concurrent requests.
  Session boundaries clear private caches and selected doctor workspaces.
- Doctor record/prescription/lab writes carry an account-scoped facility hint.
  Medical Service resolves doctor profiles from account principals, checks active
  affiliation, rejects mismatched record/facility/patient links, and enforces record
  visibility on related reads.
- Patient onboarding uses a service-authenticated internal User lookup. Appointment
  Service can perform its necessary patient lookups with its service credential.
  The public gateway blocks that internal User endpoint and strips caller-supplied
  service/identity headers.
- Appointment access resolves profile IDs to account IDs, limits reception teams to
  their facility, and checks scope before cancellation/rescheduling/completion.
- Clinical and appointment notifications target the patient's account UUID.
  EMAIL notifications remain queued until the scheduler resolves the recipient,
  calls JavaMailSender and records success. Failures retry instead of claiming SENT.
  A forwarded user JWT no longer replaces Notification Service's service identity.
- The portal includes verification completion, profile editing, appointment booking
  and rescheduling, doctor schedules, staff creation/assignment, lab report links,
  facility hours, and structured report viewing/JSON download.
- Frontend navigation and backend permissions agree for reception and lab staff.
  Editing another doctor's profile/schedule or another facility's settings is denied.
- Added an admin-only paginated facility directory (`GET /api/tenants`) so approved
  facilities remain available for staff assignments after review.
- Next.js and eslint-config-next are pinned to 16.4.5. `npm start` prepares and serves
  standalone build assets.

## Hosted connection (not yet configured)

| Location | Setting | Purpose |
| --- | --- | --- |
| Frontend build environment | `NEXT_PUBLIC_API_BASE_URL` | HTTPS gateway origin, without `/api` |
| Gateway and downstream services | `FRONTEND_ORIGIN` | Exact deployed frontend origin for CORS |
| Notification Service | `PUBLIC_FRONTEND_ORIGIN` | Origin used in verification/reset email links |
| All backend services | Existing `JWT_SECRET`, `SERVICE_AUTH_TOKEN` settings | Consistent signing and internal-service credentials |
| Notification Service | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, optional `MAIL_FROM_NAME` | Real SMTP delivery |
| Backend hosting | Existing database, discovery, gateway rate-limit/cache and storage settings | Supply through the hosting secret/configuration system |

Set frontend `NEXT_PUBLIC_*` values before building. They are public and compiled
into the browser bundle. Keep all backend credentials on the server. Internal
services should be reachable only through the deployment's private network; expose
the API Gateway publicly. Keep internal service credentials out of browser requests.
The new User internal lookup intentionally does not route through the public gateway.

No hosted URLs were supplied. `.env.example` retains its localhost development
default; it is not a configured remote deployment. SMTP/storage credentials were
not invented or added. Backend Docker and database configuration were not changed.

## Offline verification

| Check | Result |
| --- | --- |
| Frontend lint and TypeScript | Passed |
| API method/path comparison | All 98 frontend calls match backend controller routes |
| Frontend contract tests | 12 passing tests |
| Frontend production build | Passed |
| Production dependency audit | Zero vulnerabilities |
| Full development dependency audit | Eight moderate findings remain in the ESLint/minimatch dependency chain; automatic removal proposes a breaking Next ESLint downgrade, which was not applied |
| Browser portal checks | 28 portal pages plus verification/reset pages; all six roles; portal widths 390/768/1440; no browser errors or horizontal overflow |
| Browser mutation flows | 12 passing flows: booking, rescheduling, clinical facility context, availability, report download, hours, role restrictions, lab entry, staff creation, email verification, password recovery |
| Backend builds | All nine changed core services plus gateway compiled |
| Selected backend unit tests | 37 tests across identity, authorization, clinical contracts, SMTP mocks, reports, appointments and outbox behavior |

Contract tests execute the real TypeScript transport/adapters with in-memory Axios
adapters. Browser checks return raw backend-shaped DTOs. Java tests use Mockito and
standalone request/filter objects; no Spring application or H2 database starts.
These checks validate code and contracts, not deployed infrastructure.

```sh
npm run lint
npm test
npx tsc --noEmit --incremental false
npm run build
# Terminal 1:
PORT=3116 HOSTNAME=127.0.0.1 npm start
# Terminal 2 (install Playwright Chromium once, or set MEDORA_BROWSER_PATH):
MEDORA_PREVIEW_BASE=http://127.0.0.1:3116 npm run test:browser
```

The browser runner intercepts every `/api/` request with fixtures and must target
an isolated local frontend preview. It can use an installed browser through
`MEDORA_BROWSER_PATH`; no browser download is required when using that option.

Use your Maven executable or each module's wrapper with an explicit unit-test
selection; do not run unreviewed application-context test suites on this laptop:

| Module | `-Dtest=` selection |
| --- | --- |
| User | `InternalUserAccessTest` |
| Patient | `PatientProfileScopeTest` |
| Appointment | `AppointmentAccessTest,AppointmentServiceTest,AuditOutboxServiceTest` |
| Medical | `MedicalIntegrationContractTest` |
| Notification | `NotificationDeliveryTest,NotificationServiceIdentityTest` |
| Doctor | `DoctorWorkspaceAccessTest` |
| Tenant | `FacilityWorkspaceAccessTest` |
| Report | `ReportServiceTest,ReportAccessTest` |
| Gateway | `GatewayIdentityTest` |

Example: `./mvnw -Dtest=MedicalIntegrationContractTest test` inside Medical Service.
Patient profile ownership was also unit-tested. Audit changes were compile-checked without starting the application.

## Deployment-side acceptance checks

After hosting the existing backend infrastructure, verify registration → real
verification email → profile creation; consecutive refreshes; approved facility
assignment and clinician affiliation; QR patient lookup → care note → prescription
and lab result → patient inbox; booking/rescheduling/cancellation; and facility
report generation/download. Confirm cross-account and cross-facility requests are
denied. Check CORS from the deployed frontend origin and SMTP links in a real inbox.

Lab report entry links existing HTTPS storage documents. Binary upload, camera QR
recognition, a mobile application implementation, and an HttpOnly-cookie BFF are
not supplied by the current contracts or this repair. The operational UI provides
QR token entry and server-authorized API requests.
