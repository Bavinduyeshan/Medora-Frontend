'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FilePlus, Pill, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { useCreateMedicalRecord, useCreatePrescription, useDiseases } from '@/hooks/useDoctorData';
import { ApiError } from '@/lib/http';
import type { MedicalRecordCreatePayload, PrescriptionItemPayload, RecordStatus, RecordVisibility } from '@/types/api';

const emptyItem: PrescriptionItemPayload = {
  medicineName: '',
  genericName: '',
  dosage: '',
  frequency: '',
  duration: '',
  route: 'ORAL',
  quantity: 1,
  instructions: '',
  isControlled: false,
};

export function NewDiagnosisModal({
  isOpen,
  onClose,
  patientId,
  patientName,
}: {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}) {
  const { data: diseases } = useDiseases();
  const createRecord = useCreateMedicalRecord();
  const createPrescription = useCreatePrescription();

  const [step, setStep] = useState<'record' | 'prescription' | 'done'>('record');
  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<MedicalRecordCreatePayload, 'patientId'>>({
    diseaseId: undefined,
    chiefComplaint: '',
    diagnosis: '',
    diagnosticData: '',
    treatments: '',
    followUpNotes: '',
    followUpDate: '',
    status: 'FINAL' as RecordStatus,
    visibility: 'ALL_DOCTORS' as RecordVisibility,
    bloodPressure: '',
    pulseRate: undefined,
    temperature: undefined,
    weightKg: undefined,
    heightCm: undefined,
    oxygenSaturation: undefined,
  });

  const [items, setItems] = useState<PrescriptionItemPayload[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setStep('record');
    setCreatedRecordId(null);
    setItems([]);
    setPrescriptionNotes('');
    setForm({
      diseaseId: undefined,
      chiefComplaint: '',
      diagnosis: '',
      diagnosticData: '',
      treatments: '',
      followUpNotes: '',
      followUpDate: '',
      status: 'FINAL',
      visibility: 'ALL_DOCTORS',
      bloodPressure: '',
      pulseRate: undefined,
      temperature: undefined,
      weightKg: undefined,
      heightCm: undefined,
      oxygenSaturation: undefined,
    });
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const onSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const record = await createRecord.mutateAsync({ ...form, patientId });
      setCreatedRecordId(record.id);
      toast.success('Medical record saved.');
      setStep('prescription');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save the record.');
    }
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const updateItem = (idx: number, key: keyof PrescriptionItemPayload, value: string | number | boolean) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onSubmitPrescription = async () => {
    if (!createdRecordId) return;
    if (items.length === 0) {
      setStep('done');
      return;
    }
    try {
      await createPrescription.mutateAsync({
        recordId: createdRecordId,
        payload: { notes: prescriptionNotes, items },
      });
      toast.success('Prescription added.');
      setStep('done');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save the prescription.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      size="lg"
      title={step === 'record' ? 'New Diagnosis' : step === 'prescription' ? 'Add Prescription' : 'Record Complete'}
      description={`Patient: ${patientName}`}
    >
      {step === 'record' && (
        <form onSubmit={onSubmitRecord} className="space-y-4">
          <Field label="Chief complaint" required>
            <Input required value={form.chiefComplaint} onChange={(e) => set('chiefComplaint', e.target.value)} placeholder="Chest pain, shortness of breath" />
          </Field>
          <Field label="Diagnosis" required>
            <Input required value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} placeholder="Acute bronchitis" />
          </Field>
          <Field label="Known disease" hint="Optional">
            <Select value={form.diseaseId ?? ''} onChange={(e) => set('diseaseId', e.target.value || undefined)}>
              <option value="">— None selected —</option>
              {diseases?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.icdCode ? `(${d.icdCode})` : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Diagnostic findings" hint="Optional">
            <Textarea value={form.diagnosticData} onChange={(e) => set('diagnosticData', e.target.value)} placeholder="Chest exam normal, lungs clear" />
          </Field>
          <Field label="Treatment plan" hint="Optional">
            <Textarea value={form.treatments} onChange={(e) => set('treatments', e.target.value)} placeholder="Rest, fluids, medication" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Follow-up notes" hint="Optional">
              <Input value={form.followUpNotes} onChange={(e) => set('followUpNotes', e.target.value)} />
            </Field>
            <Field label="Follow-up date" hint="Optional">
              <Input type="date" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Vital signs (optional)</p>
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="BP e.g. 120/80" value={form.bloodPressure} onChange={(e) => set('bloodPressure', e.target.value)} />
              <Input type="number" placeholder="Pulse (bpm)" value={form.pulseRate ?? ''} onChange={(e) => set('pulseRate', e.target.value ? Number(e.target.value) : undefined)} />
              <Input type="number" step="0.1" placeholder="Temp (°C)" value={form.temperature ?? ''} onChange={(e) => set('temperature', e.target.value ? Number(e.target.value) : undefined)} />
              <Input type="number" step="0.1" placeholder="Weight (kg)" value={form.weightKg ?? ''} onChange={(e) => set('weightKg', e.target.value ? Number(e.target.value) : undefined)} />
              <Input type="number" step="0.1" placeholder="Height (cm)" value={form.heightCm ?? ''} onChange={(e) => set('heightCm', e.target.value ? Number(e.target.value) : undefined)} />
              <Input type="number" placeholder="SpO₂ (%)" value={form.oxygenSaturation ?? ''} onChange={(e) => set('oxygenSaturation', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set('status', e.target.value as RecordStatus)}>
                <option value="DRAFT">Draft</option>
                <option value="FINAL">Final</option>
                <option value="AMENDED">Amended</option>
              </Select>
            </Field>
            <Field label="Visibility">
              <Select value={form.visibility} onChange={(e) => set('visibility', e.target.value as RecordVisibility)}>
                <option value="ALL_DOCTORS">All doctors</option>
                <option value="TREATING_DOCTOR_ONLY">Treating doctor only</option>
                <option value="PATIENT_RESTRICTED">Patient restricted</option>
              </Select>
            </Field>
          </div>

          <Button type="submit" className="w-full" loading={createRecord.isPending} icon={<FilePlus className="h-4 w-4" />}>
            Save record & continue
          </Button>
        </form>
      )}

      {step === 'prescription' && (
        <div className="space-y-4">
          <Field label="Prescription notes" hint="Optional">
            <Input value={prescriptionNotes} onChange={(e) => setPrescriptionNotes(e.target.value)} placeholder="Take after meals" />
          </Field>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-ink-100 p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-700">Medication {idx + 1}</span>
                  <button onClick={() => removeItem(idx)} className="text-ink-400 hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Medicine name" value={item.medicineName} onChange={(e) => updateItem(idx, 'medicineName', e.target.value)} />
                  <Input placeholder="Dosage e.g. 500mg" value={item.dosage} onChange={(e) => updateItem(idx, 'dosage', e.target.value)} />
                  <Input placeholder="Frequency" value={item.frequency} onChange={(e) => updateItem(idx, 'frequency', e.target.value)} />
                  <Input placeholder="Duration e.g. 5 days" value={item.duration} onChange={(e) => updateItem(idx, 'duration', e.target.value)} />
                  <Input placeholder="Quantity" type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                  <Select value={item.route} onChange={(e) => updateItem(idx, 'route', e.target.value)}>
                    <option value="ORAL">Oral</option>
                    <option value="TOPICAL">Topical</option>
                    <option value="INJECTION">Injection</option>
                    <option value="INHALATION">Inhalation</option>
                  </Select>
                </div>
                <Input className="mt-2" placeholder="Instructions (optional)" value={item.instructions} onChange={(e) => updateItem(idx, 'instructions', e.target.value)} />
              </div>
            ))}
            <button
              onClick={addItem}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 py-3 text-xs font-semibold text-ink-500 hover:bg-ink-50"
            >
              <Plus className="h-4 w-4" /> Add medication
            </button>
          </div>

          <Button className="w-full" loading={createPrescription.isPending} onClick={onSubmitPrescription} icon={<Pill className="h-4 w-4" />}>
            {items.length === 0 ? 'Skip — finish without prescription' : 'Save prescription'}
          </Button>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-brand-600" />
          <p className="text-sm font-bold text-ink-800">Diagnosis recorded successfully</p>
          <p className="text-xs text-ink-500">The patient has been notified and the record is now part of their history.</p>
          <Button onClick={closeAndReset}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
