import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function fullName(first?: string, last?: string) {
  return [first, last].filter(Boolean).join(' ') || '—';
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function formatEnum(value?: string | null): string {
  if (!value) return '—';
  return value
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatBloodGroup(value?: string | null): string {
  if (!value) return '—';
  const map: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
    UNKNOWN: 'Unknown',
  };
  return map[value] || value;
}

export function formatDate(value?: string | null, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-LK', opts).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatDateTime(value?: string | null) {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatTime(value?: string | null) {
  if (!value) return '—';
  // handles both ISO datetimes and HH:mm:ss strings
  if (/^\d{2}:\d{2}/.test(value)) {
    const [h, m] = value.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m));
    return new Intl.DateTimeFormat('en-LK', { hour: '2-digit', minute: '2-digit' }).format(d);
  }
  return formatDate(value, { timeStyle: 'short' } as Intl.DateTimeFormatOptions);
}

export function timeAgo(value?: string | null): string {
  if (!value) return '—';
  const diffMs = Date.now() - new Date(value).getTime();
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

const ROLE_HOME: Record<string, string> = {
  PATIENT: '/patient',
  DOCTOR: '/doctor',
  HOSPITAL_ADMIN: '/hospital',
  ADMIN: '/admin',
  RECEPTIONIST: '/hospital',
  LAB_TECHNICIAN: '/hospital',
};

export function roleHomePath(role?: string | null): string {
  if (!role) return '/login';
  return ROLE_HOME[role] || '/login';
}

export function roleLabel(role?: string | null): string {
  const map: Record<string, string> = {
    PATIENT: 'Patient',
    DOCTOR: 'Doctor',
    HOSPITAL_ADMIN: 'Hospital Admin',
    ADMIN: 'Super Admin',
    RECEPTIONIST: 'Receptionist',
    LAB_TECHNICIAN: 'Lab Technician',
  };
  return role ? map[role] || formatEnum(role) : '—';
}
