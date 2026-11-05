// Explicit DTO identity maps: relationship UUIDs must never become entity IDs.
type Row = Record<string, unknown>;
function row(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid API response");
  return value as Row;
}
function collection(mapper: (value: unknown) => Row) {
  return function adapt(value: unknown): unknown {
    if (value == null) return value;
    if (Array.isArray(value)) return value.map(mapper);
    const data = row(value);
    if (Array.isArray(data.content)) {
      const number = data.number ?? data.page ?? 0;
      return {
        ...data,
        number,
        first: number === 0,
        content: data.content.map(mapper),
      };
    }
    return mapper(data);
  };
}
function entity(key: string, extra: (data: Row) => Row = () => ({})) {
  return collection((value) => {
    const data = row(value);
    return { ...data, id: data[key] ?? data.id, ...extra(data) };
  });
}
export const adapters = {
  user: entity("userId"),
  patient: entity("patientId"),
  doctor: entity("doctorId", (d) => ({ active: d.isActive ?? d.active })),
  tenant: entity("tenantId"),
  department: entity("departmentId"),
  schedule: entity("scheduleId"),
  affiliation: entity("affiliationId"),
  record: entity("recordId"),
  prescription: entity("prescriptionId", (d) => ({
    createdAt: d.dateIssued ?? d.createdAt,
    items: Array.isArray(d.items)
      ? d.items.map((value) => {
          const item = row(value);
          return {
            ...item,
            id: item.itemId ?? item.id,
            dispensed: d.isDispensed ?? item.dispensed ?? false,
          };
        })
      : [],
  })),
  lab: entity("labReportId", (d) => ({
    title: d.reportFilename ?? d.reportType ?? d.title,
    type: d.reportType ?? d.type,
    fileUrl: d.reportUrl ?? d.fileUrl,
    resultsSummary: d.notes ?? d.resultsSummary,
    reportedAt: d.uploadedAt ?? d.testDate ?? d.reportedAt,
    flagged: d.flagged ?? false,
  })),
  disease: entity("diseaseId"),
  appointment: entity("appointmentId"),
  report: entity("reportId", (d) => ({
    requestedByUserId: d.requestedBy ?? d.requestedByUserId,
  })),
  audit: entity("auditId", (d) => ({ createdAt: d.occurredAt ?? d.createdAt })),
  notification: entity("notificationId"),
  qr: entity("qrId", (d) => ({
    active: d.isActive ?? d.active,
    issuedAt: d.createdAt ?? d.issuedAt,
  })),
  scan: entity("scanId", (d) => ({
    scannedByUserId: d.scannedBy ?? d.scannedByUserId,
  })),
  auth(value: unknown) {
    const d = row(value);
    return {
      ...d,
      user: d.user
        ? adapters.user(d.user)
        : d.userId
          ? adapters.user({
              userId: d.userId,
              username: d.username,
              email: d.email,
              role: d.role,
              tenantId: d.tenantId ?? null,
              status: d.status,
              emailVerified: d.emailVerified ?? false,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
            })
          : undefined,
    };
  },
};
