"use client";
import { useCurrentPatient } from '@/hooks/usePatientData';
import { PatientOnboarding } from '@/components/patient/PatientOnboarding';
export default function ProfilePage() { const { data } = useCurrentPatient(); return data ? <PatientOnboarding key={data.id} initialData={data} /> : null; }
