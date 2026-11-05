// ---------------------------------------------------------------------------
// Types mirror the Medora microservice DTOs described in
// Medora_API_Documentation.md. Every service response is wrapped in an
// envelope: { success, message, data, timestamp }.
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
}

// ---- Enums ----------------------------------------------------------------

export type UserRoleApi = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'HOSPITAL_ADMIN' | 'RECEPTIONIST' | 'LAB_TECHNICIAN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type TenantType = 'HOSPITAL' | 'CLINIC' | 'DIAGNOSTIC_CENTER' | 'PHARMACY';
export type TenantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type BloodGroup =
  | 'A_POSITIVE' | 'A_NEGATIVE'
  | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE'
  | 'O_POSITIVE' | 'O_NEGATIVE'
  | 'UNKNOWN';

export type AffiliationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type RecordStatus = 'DRAFT' | 'FINAL' | 'AMENDED';
export type RecordVisibility = 'ALL_DOCTORS' | 'TREATING_DOCTOR_ONLY' | 'PATIENT_RESTRICTED';

export type AppointmentStatus = 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export type ReportType = 'PATIENT_SUMMARY' | 'TENANT_ACTIVITY' | 'DOCTOR_ACTIVITY' | 'AUDIT_EXPORT';
export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type NotificationType = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type NotificationStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'READ';

// ---- User Service -----------------------------------------------------------

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRoleApi;
  tenantId: string | null;
  status: AccountStatus;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user?: UserDto;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: Extract<UserRoleApi, 'PATIENT' | 'DOCTOR'>;
  tenantId?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ---- Tenant Service ---------------------------------------------------------

export interface TenantDto {
  id: string;
  name: string;
  type: TenantType;
  status: TenantStatus;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  registrationNumber: string;
  licenseDocumentUrl?: string;
  logoUrl?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface TenantRequestPayload {
  name: string;
  type: TenantType;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  registrationNumber: string;
  licenseDocumentUrl?: string;
}

export interface DepartmentDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
}

export interface ScheduleDayDto {
  dayOfWeek: number; // 0-6
  openTime: string; // HH:mm:ss
  closeTime: string;
  isClosed: boolean;
}

// ---- Patient Service ---------------------------------------------------------

export interface PatientDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: GenderType;
  bloodGroup: BloodGroup;
  nationalId: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  city: string;
  province: string;
  allergies?: string;
  chronicConditions?: string;
  createdAt: string;
}

export interface PatientCreatePayload {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: GenderType;
  bloodGroup: BloodGroup;
  nationalId: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  city: string;
  province: string;
  allergies?: string;
  chronicConditions?: string;
}

export interface PatientQrDto {
  patientId: string;
  qrToken: string;
  qrImageUrl?: string;
  issuedAt: string;
  expiresAt?: string;
}

export interface QrScanResultDto {
  patientId: string;
  patient?: PatientDto;
  scannedAt: string;
  purpose: string;
}

export interface ScanHistoryEntryDto {
  id: string;
  patientId: string;
  scannedByUserId: string;
  scannedByName?: string;
  tenantId: string;
  tenantName?: string;
  purpose: string;
  scannedAt: string;
}

// ---- Doctor Service -----------------------------------------------------------

export interface DoctorDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  slmcNumber: string;
  specialization: string;
  subSpecialization?: string;
  experienceYears: number;
  education?: string;
  bio?: string;
  profileImageUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface DoctorCreatePayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  slmcNumber: string;
  specialization: string;
  subSpecialization?: string;
  experienceYears: number;
  education?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface AffiliationDto {
  id: string;
  doctorId: string;
  doctorName?: string;
  tenantId: string;
  tenantName?: string;
  departmentId?: string;
  roleAtTenant: string;
  status: AffiliationStatus;
  createdAt: string;
}

export interface DoctorScheduleDto {
  id: string;
  doctorId: string;
  tenantId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMins: number;
  maxPatients: number;
  isAvailable: boolean;
}

// ---- Medical Service ----------------------------------------------------------

export interface DiseaseDto {
  id: string;
  name: string;
  icdCode?: string;
  description?: string;
}

export interface VitalSignsPayload {
  bloodPressure?: string;
  pulseRate?: number;
  temperature?: number;
  weightKg?: number;
  heightCm?: number;
  oxygenSaturation?: number;
}

export interface MedicalRecordDto extends VitalSignsPayload {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  tenantId: string;
  tenantName?: string;
  diseaseId?: string;
  diseaseName?: string;
  chiefComplaint: string;
  diagnosis: string;
  diagnosticData?: string;
  treatments?: string;
  followUpNotes?: string;
  followUpDate?: string;
  reportUrl?: string;
  reportFilename?: string;
  status: RecordStatus;
  visibility: RecordVisibility;
  createdAt: string;
  updatedAt?: string;
}

export interface MedicalRecordCreatePayload {
  patientId: string;
  diseaseId?: string;
  chiefComplaint: string;
  diagnosis: string;
  diagnosticData?: string;
  treatments?: string;
  followUpNotes?: string;
  followUpDate?: string;
  reportUrl?: string;
  reportFilename?: string;
  status: RecordStatus;
  visibility: RecordVisibility;
  bloodPressure?: string;
  pulseRate?: number;
  temperature?: number;
  weightKg?: number;
  heightCm?: number;
  oxygenSaturation?: number;
}

export interface PrescriptionItemPayload {
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  quantity: number;
  instructions?: string;
  isControlled?: boolean;
}

export interface PrescriptionDto {
  isDispensed?: boolean;
  dispensedAt?: string;
  id: string;
  recordId: string;
  patientId: string;
  notes?: string;
  validUntil?: string;
  items: (PrescriptionItemPayload & { id: string; dispensed?: boolean })[];
  createdAt: string;
}

export interface PrescriptionCreatePayload {
  notes?: string;
  validUntil?: string;
  items: PrescriptionItemPayload[];
}

export interface LabReportDto {
  id: string;
  recordId?: string;
  patientId: string;
  title: string;
  type: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  resultsSummary?: string;
  flagged: boolean;
  reportedAt: string;
}

// ---- Appointment Service -------------------------------------------------------

export interface AppointmentDto {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  tenantId: string;
  tenantName?: string;
  appointmentStart: string;
  appointmentEnd: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface AppointmentCreatePayload {
  patientId: string;
  doctorId: string;
  tenantId: string;
  appointmentStart: string;
  appointmentEnd: string;
  reason?: string;
}

// ---- Report Service --------------------------------------------------------

export interface ReportDto {
  id: string;
  reportType: ReportType;
  status: ReportStatus;
  tenantId?: string;
  patientId?: string;
  requestedByUserId: string;
  resultSummary?: string;
  payload?: Record<string, unknown>;
  failureReason?: string;
  fromTime?: string;
  toTime?: string;
  fileUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ReportCreatePayload {
  reportType: ReportType;
  tenantId?: string;
  patientId?: string;
  fromTime?: string;
  toTime?: string;
}

// ---- Audit Service ----------------------------------------------------------

export interface AuditLogDto {
  id: string;
  action: string;
  actorUserId: string;
  actorRole: UserRoleApi;
  actorTenantId?: string;
  targetType?: string;
  targetId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---- Notification Service ----------------------------------------------------

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  deepLink?: string;
  status: NotificationStatus;
  scheduledFor?: string;
  createdAt: string;
  readAt?: string;
}
