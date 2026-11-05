/* eslint-disable @typescript-eslint/no-require-imports -- Node browser integration runner. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const artifacts =
  process.env.MEDORA_TEST_ARTIFACTS || require("node:os").tmpdir();
fs.mkdirSync(artifacts, { recursive: true });
const base = process.env.MEDORA_PREVIEW_BASE || "http://127.0.0.1:3116";
const stamp = "2026-11-06T09:00:00Z";
const ids = {
  user: "10000000-0000-4000-8000-000000000001",
  patient: "20000000-0000-4000-8000-000000000001",
  doctor: "30000000-0000-4000-8000-000000000001",
  tenant: "40000000-0000-4000-8000-000000000001",
  record: "50000000-0000-4000-8000-000000000001",
  appointment: "60000000-0000-4000-8000-000000000001",
};
const tenant = {
  tenantId: ids.tenant,
  name: "Demo Care Hospital",
  type: "HOSPITAL",
  status: "APPROVED",
  address: "100 Sample Road",
  city: "Colombo",
  province: "Western",
  postalCode: "00100",
  country: "Sri Lanka",
  phone: "+94000000000",
  email: "facility@example.com",
  registrationNumber: "DEMO-001",
  createdAt: stamp,
};
const patient = {
  patientId: ids.patient,
  userId: ids.user,
  firstName: "Sample",
  lastName: "Patient",
  dateOfBirth: "1998-05-16",
  gender: "PREFER_NOT_TO_SAY",
  bloodGroup: "O_POSITIVE",
  nationalId: "DEMO-ID",
  email: "patient@example.com",
  phone: "+94000000000",
  emergencyContactName: "Sample Contact",
  emergencyContactPhone: "+94000000001",
  address: "10 Example Lane",
  city: "Colombo",
  province: "Western",
  allergies: "Example allergy",
  chronicConditions: "None recorded",
  createdAt: stamp,
};
const doctor = {
  doctorId: ids.doctor,
  userId: ids.user,
  firstName: "Sample",
  lastName: "Doctor",
  email: "doctor@example.com",
  phone: "+94000000000",
  slmcNumber: "DEMO-REG",
  specialization: "General Medicine",
  experienceYears: 5,
  isActive: true,
  createdAt: stamp,
};
const affiliation = {
  affiliationId: "aff-1",
  doctorId: ids.doctor,
  tenantId: ids.tenant,
  tenantName: tenant.name,
  roleAtTenant: "Consultant",
  status: "ACTIVE",
  createdAt: stamp,
};
const record = {
  recordId: ids.record,
  patientId: ids.patient,
  doctorId: ids.doctor,
  doctorName: "Dr. Sample Doctor",
  tenantId: ids.tenant,
  chiefComplaint: "Example consultation",
  diagnosis: "Sample care record",
  treatments: "Example follow-up notes",
  status: "FINAL",
  visibility: "ALL_DOCTORS",
  createdAt: stamp,
  bloodPressure: "120/80",
  pulseRate: 72,
};
const appointment = {
  appointmentId: ids.appointment,
  patientId: ids.patient,
  doctorId: ids.doctor,
  tenantId: ids.tenant,
  appointmentStart: "2026-12-10T10:00:00Z",
  appointmentEnd: "2026-12-10T10:30:00Z",
  reason: "Sample follow-up",
  status: "SCHEDULED",
  createdAt: stamp,
};
const prescription = {
  prescriptionId: "rx-1",
  recordId: ids.record,
  patientId: ids.patient,
  notes: "Example prescription",
  items: [
    {
      itemId: "item-1",
      medicineName: "Example medication",
      dosage: "Example dosage",
      frequency: "As recorded",
      duration: "Example duration",
      route: "ORAL",
      quantity: 1,
    },
  ],
  dateIssued: stamp,
};
const lab = {
  labReportId: "lab-1",
  recordId: ids.record,
  patientId: ids.patient,
  tenantId: ids.tenant,
  reportFilename: "Example lab results",
  reportType: "Blood Test",
  reportUrl: "https://storage.example.com/result.pdf",
  notes: "Sample diagnostic summary",
  testDate: "2026-11-01",
  uploadedAt: stamp,
};
const schedule = {
  scheduleId: "schedule-1",
  doctorId: ids.doctor,
  tenantId: ids.tenant,
  dayOfWeek: 1,
  startTime: "09:00:00",
  endTime: "17:00:00",
  slotDurationMins: 15,
  maxPatients: 20,
  isAvailable: true,
};
const report = {
  reportId: "report-1",
  reportType: "TENANT_ACTIVITY",
  status: "COMPLETED",
  tenantId: ids.tenant,
  requestedBy: ids.user,
  resultSummary: "Generated facility activity report",
  payload: { appointments: [appointment], auditLogs: { totalElements: 1 } },
  createdAt: stamp,
  completedAt: stamp,
};
const paged = (content) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  page: 0,
  size: 20,
  last: true,
});
(async () => {
  const browser = await chromium.launch({
    ...(process.env.MEDORA_BROWSER_PATH
      ? { executablePath: process.env.MEDORA_BROWSER_PATH }
      : {}),
    headless: true,
  });
  const result = { routes: [], flows: [], failures: [] };
  try {
    for (const role of [
      "PATIENT",
      "DOCTOR",
      "HOSPITAL_ADMIN",
      "RECEPTIONIST",
      "LAB_TECHNICIAN",
      "ADMIN",
    ]) {
      const ctx = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      });
      await ctx.addCookies(
        ["hp_at", "hp_rt", "hp_role", "hp_uid"].map((name, i) => ({
          name,
          value: ["mock-access", "mock-refresh", role, ids.user][i],
          url: base,
        })),
      );
      const user = {
        userId: ids.user,
        username: "Sample User",
        email: "sample@example.com",
        role,
        tenantId: ["HOSPITAL_ADMIN", "RECEPTIONIST", "LAB_TECHNICIAN"].includes(
          role,
        )
          ? ids.tenant
          : null,
        status: "ACTIVE",
        emailVerified: true,
        createdAt: stamp,
      };
      const requests = [];
      const unknown = [];
      await ctx.route("**/api/**", async (route) => {
        const req = route.request(),
          p = new URL(req.url()).pathname,
          m = req.method();
        const headers = {
          "access-control-allow-origin": base,
          "access-control-allow-credentials": "true",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
        };
        if (m === "OPTIONS") return route.fulfill({ status: 204, headers });
        const body = req.postDataJSON();
        requests.push({ path: p, method: m, body, headers: req.headers() });
        let data;
        if (p === "/api/users/me") data = user;
        else if (p === "/api/users/admin/create")
          data = {
            accessToken: "staff-access",
            refreshToken: "staff-refresh",
            ...user,
            userId: "staff-account",
          };
        else if (p === "/api/users")
          data = [
            user,
            {
              ...user,
              userId: "staff-account",
              role: "RECEPTIONIST",
              tenantId: ids.tenant,
              username: "Reception User",
            },
          ];
        else if (p.startsWith("/api/users/") && m === "PUT") data = null;
        else if (p === "/api/notifications/unread-count")
          data = { unreadCount: 1 };
        else if (p === "/api/notifications/my")
          data = paged([
            {
              notificationId: "n-1",
              userId: ids.user,
              type: "IN_APP",
              title: "Example update",
              body: "Your results are ready",
              status: "SENT",
              createdAt: stamp,
            },
          ]);
        else if (
          p === `/api/patients/user/${ids.user}` ||
          p === `/api/patients/${ids.patient}`
        )
          data = { ...patient, ...(body || {}) };
        else if (p === `/api/patients/${ids.patient}/qr`)
          data = {
            qrId: "qr-1",
            patientId: ids.patient,
            qrToken: "example-qr",
            isActive: true,
            createdAt: stamp,
          };
        else if (p.includes("/scan-history"))
          data = paged([
            {
              scanId: "scan-1",
              tenantId: ids.tenant,
              scannedBy: ids.user,
              scannedAt: stamp,
              purpose: "CONSULTATION",
            },
          ]);
        else if (p === "/api/patients/qr/scan")
          data = {
            scanId: "scan-1",
            patientId: ids.patient,
            qrId: "qr-1",
            patientName: "Sample Patient",
            scannedAt: stamp,
          };
        else if (
          p === `/api/doctors/user/${ids.user}` ||
          p === `/api/doctors/${ids.doctor}`
        )
          data = { ...doctor, ...(body || {}) };
        else if (
          p === "/api/doctors" ||
          p === `/api/doctors/tenant/${ids.tenant}` ||
          p === "/api/doctors/search"
        )
          data = [doctor];
        else if (p.includes("/affiliations")) data = [affiliation];
        else if (p.includes("/schedules"))
          data = m === "POST" ? { ...schedule, ...body } : [schedule];
        else if (p === "/api/records" && m === "POST")
          data = { ...record, ...body };
        else if (p === `/api/records/${ids.record}`) data = record;
        else if (
          p.includes("/records/patient/") ||
          p.includes("/records/tenant/")
        )
          data = [record];
        else if (p.includes("/prescriptions") && m === "POST")
          data = { ...prescription, ...body };
        else if (p.includes("/prescriptions")) data = [prescription];
        else if (p === "/api/lab-reports" && m === "POST")
          data = { ...lab, ...body };
        else if (p.startsWith("/api/lab-reports/")) data = [lab];
        else if (p === "/api/appointments" && m === "POST")
          data = { ...appointment, ...body };
        else if (p.startsWith("/api/appointments/") && m === "PUT")
          data = { ...appointment, ...body };
        else if (p.startsWith("/api/appointments/")) data = [appointment];
        else if (p === "/api/tenants") data = paged([tenant]);
        else if (p === "/api/tenants/pending")
          data = paged([{ ...tenant, status: "PENDING" }]);
        else if (p === `/api/tenants/${ids.tenant}`) data = tenant;
        else if (p.endsWith("/departments"))
          data = [
            {
              departmentId: "dep-1",
              tenantId: ids.tenant,
              name: "General Medicine",
              description: "Sample department",
            },
          ];
        else if (p.endsWith("/schedule"))
          data =
            m === "PUT"
              ? body.schedule
              : [
                  {
                    dayOfWeek: 1,
                    openTime: "09:00:00",
                    closeTime: "17:00:00",
                    isClosed: false,
                  },
                ];
        else if (p === "/api/reports" && m === "POST") data = report;
        else if (p.startsWith("/api/reports/")) data = [report];
        else if (p === "/api/audit/logs")
          data = paged([
            {
              auditId: "audit-1",
              action: "USER_REGISTERED",
              actorUserId: ids.user,
              actorRole: "ADMIN",
              description: "Sample activity",
              occurredAt: stamp,
            },
          ]);
        else if (p === "/api/diseases") data = [];
        else {
          unknown.push(`${m} ${p}`);
          data = null;
        }
        await route.fulfill({
          status: 200,
          headers,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Mock response",
            data,
            timestamp: stamp,
          }),
        });
      });
      const page = await ctx.newPage();
      page.on("pageerror", (e) =>
        result.failures.push(`${role}: ${e.message}`),
      );
      const paths =
        role === "PATIENT"
          ? [
              "/patient",
              "/patient/records",
              `/patient/records/${ids.record}`,
              "/patient/prescriptions",
              "/patient/appointments",
              "/patient/qr",
              "/patient/lab-reports",
              "/patient/profile",
            ]
          : role === "DOCTOR"
            ? [
                "/doctor",
                "/doctor/appointments",
                "/doctor/affiliations",
                "/doctor/schedules",
                "/doctor/profile",
                `/doctor/patients/${ids.patient}`,
              ]
            : role === "HOSPITAL_ADMIN"
              ? [
                  "/hospital",
                  "/hospital/appointments",
                  "/hospital/departments",
                  "/hospital/affiliations",
                  "/hospital/reports",
                  "/hospital/hours",
                ]
              : role === "ADMIN"
                ? ["/admin", "/admin/tenants", "/admin/users", "/admin/audit"]
                : role === "RECEPTIONIST"
                  ? ["/hospital", "/hospital/appointments"]
                  : ["/hospital", "/hospital/lab-reports"];
      for (const path of paths) {
        await page.goto(base + path, { waitUntil: "networkidle" });
        await page.locator("#portal-main-content h1").first().waitFor();
        for (const width of [390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          );
          if (overflow)
            result.failures.push(
              `${role} ${path}: horizontal overflow at ${width}`,
            );
        }
        result.routes.push(`${role} ${path}`);
      }
      if (role === "PATIENT") {
        await page.goto(base + "/patient/appointments", {
          waitUntil: "networkidle",
        });
        await page
          .getByRole("button", { name: "Book appointment", exact: true })
          .click();
        const modal = page.getByRole("dialog");
        await modal
          .getByLabel("Doctor", { exact: false })
          .selectOption(ids.doctor);
        await modal
          .getByLabel("Facility", { exact: false })
          .selectOption(ids.tenant);
        await modal.getByLabel("Start time").fill("2026-12-11T10:00");
        await modal.getByLabel("End time").fill("2026-12-11T10:30");
        await modal.getByRole("button", { name: "Confirm booking" }).click();
        await modal.waitFor({ state: "hidden" });
        assert(
          requests.some(
            (r) =>
              r.path === "/api/appointments" &&
              r.method === "POST" &&
              r.body.patientId === ids.patient,
          ),
        );
        result.flows.push("Patient books appointment");
        await page
          .getByRole("button", { name: "Reschedule", exact: true })
          .first()
          .click();
        await page.getByLabel("Start time").fill("2026-12-12T10:00");
        await page.getByLabel("End time").fill("2026-12-12T10:30");
        await page.getByRole("button", { name: "Save new time" }).click();
        await page.getByRole("dialog").waitFor({ state: "hidden" });
        assert(
          requests.some(
            (r) => r.path.endsWith("/reschedule") && r.method === "PUT",
          ),
        );
        result.flows.push("Patient reschedules appointment");
      }
      if (role === "DOCTOR") {
        await page.goto(base + "/doctor/schedules", {
          waitUntil: "networkidle",
        });
        await page
          .getByLabel("Facility", { exact: false })
          .selectOption(ids.tenant);
        await page.getByRole("button", { name: "Save schedule" }).click();
        await page.getByText("Availability saved.", { exact: true }).waitFor();
        assert(
          requests.some(
            (r) => r.path.endsWith("/schedules") && r.method === "POST",
          ),
        );
        result.flows.push("Doctor saves availability");
        await page.goto(base + "/doctor", { waitUntil: "networkidle" });
        await page
          .getByRole("button", { name: tenant.name, exact: true })
          .click();
        await page.goto(base + `/doctor/patients/${ids.patient}`, {
          waitUntil: "networkidle",
        });
        await page.getByRole("button", { name: "Add Care Note" }).click();
        await page
          .getByRole("textbox", { name: "Diagnosis", exact: true })
          .fill("Example consultation");
        await page
          .getByLabel("Chief complaint", { exact: false })
          .fill("Example checkup");
        const save = page
          .getByRole("dialog")
          .getByRole("button", {
            name: /Save.*record|Save.*note|Save.*diagnosis/i,
          })
          .first();
        await save.click();
        await page.getByRole("button", { name: /Skip.*finish/ }).waitFor();
        assert(
          requests.some(
            (r) =>
              r.path === "/api/records" &&
              r.method === "POST" &&
              r.headers["x-workspace-tenant-id"] === ids.tenant,
          ),
        );
        result.flows.push("Doctor clinical write carries selected facility");
        await page.keyboard.press("Escape");
      }
      if (role === "HOSPITAL_ADMIN") {
        await page.goto(base + "/hospital/reports", {
          waitUntil: "networkidle",
        });
        await page
          .getByText("Generated facility activity report", { exact: true })
          .waitFor();
        const download = page.waitForEvent("download");
        await page
          .getByRole("button", { name: "Download report", exact: true })
          .click();
        assert((await download).suggestedFilename().endsWith(".json"));
        result.flows.push("Facility views and downloads structured report");
        await page.goto(base + "/hospital/hours", { waitUntil: "networkidle" });
        await page.getByRole("button", { name: "Save opening hours" }).click();
        await page
          .getByText("Facility hours saved.", { exact: true })
          .waitFor();
        assert(
          requests.some(
            (r) =>
              r.path.endsWith("/schedule") &&
              r.method === "PUT" &&
              r.body.schedule.length === 7,
          ),
        );
        result.flows.push("Facility saves opening hours");
      }
      if (role === "ADMIN") {
        await page.goto(base + "/admin/users", { waitUntil: "networkidle" });
        await page
          .getByRole("button", { name: "Create staff account", exact: true })
          .click();
        const modal = page.getByRole("dialog");
        await modal.getByLabel("Username", { exact: false }).fill("newstaff");
        await modal
          .getByLabel("Email", { exact: false })
          .fill("staff@example.com");
        await modal
          .getByLabel("Temporary password", { exact: false })
          .fill("Sample123");
        await modal
          .getByLabel("Approved facility ID", { exact: false })
          .fill(ids.tenant);
        await modal
          .getByRole("button", { name: "Create account", exact: true })
          .click();
        await modal.waitFor({ state: "hidden" });
        assert(
          requests.some(
            (r) => r.path === "/api/users/admin/create" && r.method === "POST",
          ),
        );
        assert.equal(
          (await ctx.cookies()).find((c) => c.name === "hp_at").value,
          "mock-access",
        );
        result.flows.push(
          "Admin creates linked staff account and retains own session",
        );
      }
      if (role === "RECEPTIONIST" || role === "LAB_TECHNICIAN") {
        await page.goto(base + "/hospital/affiliations", {
          waitUntil: "networkidle",
        });
        await page
          .getByText("This page requires a facility administrator account.", {
            exact: true,
          })
          .waitFor();
        assert(!requests.some((r) => r.path.includes("/affiliations/tenant/")));
        result.flows.push(`${role} cannot load administrator controls`);
      }
      if (role === "LAB_TECHNICIAN") {
        await page.goto(base + "/hospital/lab-reports", {
          waitUntil: "networkidle",
        });
        await page
          .getByLabel("Patient QR token", { exact: false })
          .fill("example-qr");
        await page
          .getByRole("button", { name: "Identify patient", exact: true })
          .click();
        await page
          .getByLabel("Report title", { exact: false })
          .fill("Blood results");
        await page
          .getByLabel("Secure document URL", { exact: false })
          .fill("https://storage.example.com/new.pdf");
        await page
          .getByRole("button", { name: "Save report", exact: true })
          .click();
        await page.waitForTimeout(150);
        assert(
          requests.some(
            (r) =>
              r.path === "/api/lab-reports" &&
              r.method === "POST" &&
              r.body.patientId === ids.patient,
          ),
        );
        result.flows.push(
          "Lab staff links hosted report to identified patient",
        );
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(base + paths[0], { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(artifacts, `medora-wired-${role.toLowerCase()}.png`),
        fullPage: true,
      });
      if (unknown.length)
        result.failures.push(`${role}: unmatched routes ${unknown.join(", ")}`);
      await ctx.close();
    }
    const publicContext = await browser.newContext();
    const publicCalls = [];
    await publicContext.route("**/api/**", async (route) => {
      const request = route.request();
      publicCalls.push({
        path: new URL(request.url()).pathname,
        method: request.method(),
        body: request.postDataJSON(),
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "access-control-allow-origin": base,
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
        },
        body: JSON.stringify({
          success: true,
          message: "Completed",
          data: null,
        }),
      });
    });
    const publicPage = await publicContext.newPage();
    publicPage.on("pageerror", (error) =>
      result.failures.push(`Public: ${error.message}`),
    );
    await publicPage.goto(base + "/verify-email?token=example-verification", {
      waitUntil: "networkidle",
    });
    await publicPage
      .getByRole("button", { name: "Verify email address" })
      .click();
    await publicPage
      .getByRole("heading", { name: "Email verified." })
      .waitFor();
    assert(
      publicCalls.some(
        (c) => c.path === "/api/auth/verify-email" && c.method === "GET",
      ),
    );
    result.routes.push("PUBLIC /verify-email");
    result.flows.push("Email verification completes using token from URL");
    await publicPage.goto(base + "/reset-password?token=example-reset", {
      waitUntil: "networkidle",
    });
    await publicPage
      .getByLabel("New password", { exact: false })
      .first()
      .fill("Example123");
    await publicPage
      .getByLabel("Confirm new password", { exact: false })
      .fill("Example123");
    await publicPage
      .getByRole("button", { name: "Reset password", exact: true })
      .click();
    await publicPage
      .getByRole("heading", { name: "Password updated." })
      .waitFor();
    assert(
      publicCalls.some(
        (c) =>
          c.path === "/api/auth/reset-password" &&
          c.method === "POST" &&
          c.body.token === "example-reset" &&
          c.body.newPassword === "Example123",
      ),
    );
    result.routes.push("PUBLIC /reset-password");
    result.flows.push(
      "Password recovery submits the token and validated password",
    );
    await publicContext.close();
    console.log(JSON.stringify(result, null, 2));
    fs.writeFileSync(
      path.join(artifacts, "medora-wiring-browser-results.json"),
      JSON.stringify(result, null, 2),
    );
    if (result.failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
