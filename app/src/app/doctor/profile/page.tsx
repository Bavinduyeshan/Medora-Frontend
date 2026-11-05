"use client";
import { useCurrentDoctor } from '@/hooks/useDoctorData';
import { DoctorOnboarding } from '@/components/doctor/DoctorOnboarding';
export default function ProfilePage() { const { data } = useCurrentDoctor(); return data ? <DoctorOnboarding key={data.id} initialData={data} /> : null; }
