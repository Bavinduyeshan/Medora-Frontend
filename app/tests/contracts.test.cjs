/* eslint-disable @typescript-eslint/no-require-imports -- Isolated Node CommonJS test harness. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const axios = require("axios");
const root = path.resolve(__dirname, "..");
function load(file, modules = {}) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const hostModule = { exports: {} };
  vm.runInNewContext(
    js,
    {
      module: hostModule,
      exports: hostModule.exports,
      require(name) {
        if (name in modules) return modules[name];
        throw new Error(`Unexpected import: ${name}`);
      },
      crypto: require("node:crypto").webcrypto,
      Date,
      Map,
      Set,
      Promise,
      Error,
      console,
    },
    { filename: file },
  );
  return hostModule.exports;
}
const { adapters } = load("src/lib/api/adapters.ts");
function setup() {
  const cookies = {
    accessToken: "access-0",
    refreshToken: "refresh-0",
    role: "DOCTOR",
    userId: "account-1",
    setTokens(v) {
      Object.assign(this, v);
    },
    setAccessToken(v) {
      this.accessToken = v;
    },
    clear() {
      this.accessToken = null;
      this.refreshToken = null;
      this.cleared = true;
    },
  };
  const mockAxios = {
    create: axios.create.bind(axios),
    post: async () => {
      throw new Error("Unexpected refresh");
    },
  };
  const transport = load("src/lib/http.ts", {
    axios: mockAxios,
    "../config/env": {
      env: { apiBaseUrl: "http://unused.invalid", apiTimeoutMs: 1000 },
    },
    "./sessionCookies": { sessionCookies: cookies },
  });
  const requests = [];
  transport.http.defaults.adapter = async (config) => {
    requests.push(config);
    return response(config, {});
  };
  return { cookies, mockAxios, transport, requests };
}
function response(config, data) {
  return {
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    data: { success: true, data },
  };
}
function expired(config) {
  return new axios.AxiosError(
    "Expired",
    "ERR_BAD_REQUEST",
    config,
    {},
    {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
      data: { message: "Expired" },
    },
  );
}

test("DTO adapters use primary IDs when relationship UUIDs are present", () => {
  const fixtures = [
    ["user", { userId: "account", tenantId: "facility" }, "account"],
    ["patient", { patientId: "patient", userId: "account" }, "patient"],
    ["doctor", { doctorId: "doctor", userId: "account" }, "doctor"],
    [
      "prescription",
      {
        prescriptionId: "prescription",
        recordId: "record",
        patientId: "patient",
        items: [{ itemId: "item", prescriptionId: "prescription" }],
      },
      "prescription",
    ],
    [
      "lab",
      {
        labReportId: "lab",
        recordId: "record",
        patientId: "patient",
        tenantId: "facility",
      },
      "lab",
    ],
    [
      "scan",
      { scanId: "scan", tenantId: "facility", scannedBy: "account" },
      "scan",
    ],
    [
      "record",
      {
        recordId: "record",
        patientId: "patient",
        doctorId: "doctor",
        tenantId: "facility",
      },
      "record",
    ],
    [
      "appointment",
      {
        appointmentId: "visit",
        patientId: "patient",
        doctorId: "doctor",
        tenantId: "facility",
      },
      "visit",
    ],
    [
      "affiliation",
      {
        affiliationId: "affiliation",
        doctorId: "doctor",
        tenantId: "facility",
      },
      "affiliation",
    ],
    [
      "schedule",
      { scheduleId: "schedule", doctorId: "doctor", tenantId: "facility" },
      "schedule",
    ],
    [
      "report",
      { reportId: "report", tenantId: "facility", requestedBy: "account" },
      "report",
    ],
    [
      "notification",
      { notificationId: "notification", userId: "account" },
      "notification",
    ],
    ["qr", { qrId: "qr", patientId: "patient", isActive: true }, "qr"],
  ];
  for (const [kind, fixture, id] of fixtures)
    assert.equal(adapters[kind](fixture).id, id, kind);
  assert.equal(adapters.prescription(fixtures[3][1]).items[0].id, "item");
  assert.equal(adapters.qr(fixtures[12][1]).active, true);
});
test("backend pagination, lab metadata and report results survive adaptation", () => {
  const page = adapters.lab({
    page: 1,
    size: 20,
    totalElements: 21,
    content: [
      {
        labReportId: "lab",
        recordId: "record",
        reportUrl: "https://storage.example/report.pdf",
        reportFilename: "Results",
        notes: "Reviewed",
        uploadedAt: "2026-01-01",
      },
    ],
  });
  assert.equal(page.number, 1);
  assert.equal(page.first, false);
  assert.equal(page.content[0].fileUrl, "https://storage.example/report.pdf");
  assert.equal(page.content[0].resultsSummary, "Reviewed");
  const report = adapters.report({
    reportId: "r",
    requestedBy: "account",
    payload: { appointments: [] },
    resultSummary: "Ready",
    failureReason: null,
  });
  assert.equal(report.requestedByUserId, "account");
  assert.equal(report.resultSummary, "Ready");
  assert.ok(report.payload.appointments);
});
test("prescription item badges reflect the backend prescription dispensing state", () => {
  const prescription = adapters.prescription({
    prescriptionId: "rx",
    recordId: "r",
    isDispensed: true,
    items: [{ itemId: "item", medicineName: "Example" }],
  });
  assert.equal(prescription.items[0].dispensed, true);
});
test("flat staff auth responses retain account ID and facility relationship", () => {
  const auth = adapters.auth({
    accessToken: "a",
    refreshToken: "r",
    userId: "account",
    tenantId: "facility",
    role: "HOSPITAL_ADMIN",
  });
  assert.equal(auth.user.id, "account");
  assert.equal(auth.user.tenantId, "facility");
  assert.equal(auth.user.accessToken, undefined);
  assert.equal(auth.user.refreshToken, undefined);
});
test("two consecutive expirations use each rotated refresh token", async () => {
  const { cookies, mockAxios, transport } = setup();
  const refreshes = [];
  mockAxios.post = async (_, body) => {
    refreshes.push(body.refreshToken);
    const n = refreshes.length;
    return {
      data: {
        success: true,
        data: { accessToken: `access-${n}`, refreshToken: `refresh-${n}` },
      },
    };
  };
  let expiredToken = "access-0";
  transport.http.defaults.adapter = async (config) => {
    if (config.headers.Authorization === `Bearer ${expiredToken}`)
      throw expired(config);
    return response(config, { userId: "account" });
  };
  await transport.http.get("/api/users/me");
  expiredToken = cookies.accessToken;
  await transport.http.get("/api/users/me");
  assert.deepEqual(refreshes, ["refresh-0", "refresh-1"]);
  assert.equal(cookies.refreshToken, "refresh-2");
  assert.equal(cookies.cleared, undefined);
});
test("concurrent expired requests share one refresh and retry with the new token", async () => {
  const { cookies, mockAxios, transport } = setup();
  let count = 0;
  mockAxios.post = async () => {
    count++;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return {
      data: { data: { accessToken: "access-1", refreshToken: "refresh-1" } },
    };
  };
  transport.http.defaults.adapter = async (config) => {
    if (config.headers.Authorization === "Bearer access-0")
      throw expired(config);
    assert.equal(config.headers.Authorization, "Bearer access-1");
    return response(config, {});
  };
  await Promise.all(
    Array.from({ length: 5 }, () => transport.http.get("/api/records")),
  );
  assert.equal(count, 1);
  assert.equal(cookies.refreshToken, "refresh-1");
});
test("failed refresh clears the session and notifies the auth provider", async () => {
  const { cookies, transport } = setup();
  let expiredCalls = 0;
  transport.registerSessionExpiredHandler(() => expiredCalls++);
  transport.http.defaults.adapter = async (config) => {
    throw expired(config);
  };
  await assert.rejects(transport.http.get("/api/users/me"));
  assert.equal(cookies.cleared, true);
  assert.equal(expiredCalls, 1);
});
test("unsuccessful API envelopes are rejected even with HTTP 200", async () => {
  const { transport } = setup();
  await assert.rejects(
    transport.unwrap(
      Promise.resolve({
        data: { success: false, message: "Not permitted", data: null },
      }),
    ),
    /Not permitted/,
  );
});
test("clinical writes carry only the selected account-scoped facility hint", async () => {
  const { cookies, transport, requests } = setup();
  const workspace = { activeTenantId: "facility-1", ownerUserId: "account-1" };
  const { medicalApi } = load("src/lib/api/medical.ts", {
    "../http": transport,
    "./adapters": { adapters },
    "../sessionCookies": { sessionCookies: cookies },
    "@/hooks/useActiveWorkspace": {
      useActiveWorkspace: { getState: () => workspace },
    },
  });
  await medicalApi.createRecord({
    patientId: "patient",
    diagnosis: "Checkup",
    followUpDate: "",
    status: "FINAL",
    visibility: "ALL_DOCTORS",
  });
  await medicalApi.createPrescription("record", {
    items: [{ medicineName: "Example" }],
  });
  await medicalApi.uploadLabReport({
    patientId: "patient",
    title: "Results",
    type: "Blood Test",
    fileUrl: "https://storage.example/lab.pdf",
    testDate: "2026-01-01",
  });
  for (const request of requests) {
    assert.equal(request.headers["X-Workspace-Tenant-ID"], "facility-1");
    assert.equal(request.headers["X-Doctor-ID"], undefined);
    assert.equal(request.headers.Authorization, "Bearer access-0");
  }
  assert.equal(JSON.parse(requests[0].data).followUpDate, undefined);
  assert.equal(
    JSON.parse(requests[2].data).reportUrl,
    "https://storage.example/lab.pdf",
  );
  workspace.ownerUserId = "another-account";
  assert.throws(
    () => medicalApi.createRecord({ patientId: "patient" }),
    /Choose your active facility/,
  );
  assert.equal(requests.length, 3);
});
test("staff creation returns the new account without replacing the administrator session", async () => {
  const { cookies, transport } = setup();
  transport.http.defaults.adapter = async (config) =>
    response(config, {
      accessToken: "new-access",
      refreshToken: "new-refresh",
      userId: "new-account",
      tenantId: "facility",
      role: "HOSPITAL_ADMIN",
    });
  const { usersApi } = load("src/lib/api/users.ts", {
    "../http": transport,
    "./adapters": { adapters },
  });
  const staff = await usersApi.adminCreate({
    username: "staff",
    email: "staff@example.com",
    password: "Example123",
    role: "HOSPITAL_ADMIN",
    tenantId: "facility",
  });
  assert.equal(staff.id, "new-account");
  assert.equal(cookies.accessToken, "access-0");
});

test("appointment lists resolve each distinct doctor and facility once", async () => {
  const { transport } = setup();
  transport.http.defaults.adapter = async (config) =>
    response(config, [
      { appointmentId: "a1", doctorId: "d1", tenantId: "t1", patientId: "p1" },
      { appointmentId: "a2", doctorId: "d1", tenantId: "t1", patientId: "p1" },
    ]);
  let doctorCalls = 0,
    tenantCalls = 0;
  const { appointmentsApi } = load("src/lib/api/appointments.ts", {
    "../http": transport,
    "./adapters": { adapters },
    "./doctors": {
      doctorsApi: {
        async getById() {
          doctorCalls++;
          return { firstName: "Sample", lastName: "Doctor" };
        },
      },
    },
    "./tenants": {
      tenantsApi: {
        async getById() {
          tenantCalls++;
          return { name: "Example Clinic" };
        },
      },
    },
  });
  const visits = await appointmentsApi.byPatient("p1");
  assert.equal(doctorCalls, 1);
  assert.equal(tenantCalls, 1);
  assert.equal(visits[0].doctorName, "Dr. Sample Doctor");
  assert.equal(visits[1].tenantName, "Example Clinic");
  assert.equal(visits[1].id, "a2");
});
test("registration keeps both issued tokens and the account identity", async () => {
  const { cookies, transport } = setup();
  transport.http.defaults.adapter = async (config) =>
    response(config, {
      accessToken: "new-access",
      refreshToken: "new-refresh",
      userId: "new-patient",
      role: "PATIENT",
    });
  const { authApi } = load("src/lib/api/auth.ts", {
    "../http": transport,
    "./adapters": { adapters },
    "../sessionCookies": { sessionCookies: cookies },
  });
  const tokens = await authApi.register({
    username: "sample",
    email: "sample@example.com",
    password: "Example123",
    role: "PATIENT",
  });
  assert.equal(tokens.refreshToken, "new-refresh");
  assert.equal(tokens.accessToken, "new-access");
  assert.equal(tokens.user.id, "new-patient");
});
