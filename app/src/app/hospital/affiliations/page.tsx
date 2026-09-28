'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Search, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAddAffiliation, useTenantAffiliations, useTenantDepartments, useUpdateAffiliationStatus } from '@/hooks/useHospitalData';
import { doctorsApi } from '@/lib/api/doctors';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, fullName } from '@/lib/utils';
import { ApiError } from '@/lib/http';
import type { DoctorDto } from '@/types/api';

function AddAffiliationModal({ isOpen, onClose, tenantId }: { isOpen: boolean; onClose: () => void; tenantId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DoctorDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<DoctorDto | null>(null);
  const [roleAtTenant, setRoleAtTenant] = useState('Consultant');
  const { data: departments } = useTenantDepartments(tenantId);
  const [departmentId, setDepartmentId] = useState('');
  const addAffiliation = useAddAffiliation(tenantId);

  const onSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const doctors = await doctorsApi.search(query.trim());
      setResults(doctors);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async () => {
    if (!selected) return;
    try {
      await addAffiliation.mutateAsync({ doctorId: selected.id, departmentId: departmentId || undefined, roleAtTenant });
      toast.success(`${fullName(selected.firstName, selected.lastName)} added to your facility.`);
      setSelected(null);
      setQuery('');
      setResults([]);
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not add affiliation.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add doctor affiliation" description="Search by name, specialization, or SLMC number.">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Search doctors…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch()} />
          <Button variant="outline" icon={<Search className="h-4 w-4" />} loading={searching} onClick={onSearch}>
            Search
          </Button>
        </div>

        <div className="max-h-56 space-y-2 overflow-y-auto">
          {results.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                selected?.id === d.id ? 'border-brand-500 bg-brand-50' : 'border-ink-100 hover:bg-ink-50'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-ink-800">{fullName(d.firstName, d.lastName)}</p>
                <p className="text-[11px] text-ink-500">{d.specialization} · SLMC {d.slmcNumber}</p>
              </div>
              {selected?.id === d.id && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>

        {selected && (
          <div className="space-y-3 rounded-xl bg-ink-50 p-3.5">
            <Field label="Role at facility">
              <Input value={roleAtTenant} onChange={(e) => setRoleAtTenant(e.target.value)} placeholder="Consultant, Resident, etc." />
            </Field>
            <Field label="Department" hint="Optional">
              <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">— Unassigned —</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button className="w-full" loading={addAffiliation.isPending} onClick={onSubmit} icon={<UserPlus className="h-4 w-4" />}>
              Add affiliation
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function HospitalAffiliationsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? undefined;
  const { data: affiliations, isLoading, error, refetch } = useTenantAffiliations(tenantId);
  const updateStatus = useUpdateAffiliationStatus(tenantId);
  const [addOpen, setAddOpen] = useState(false);

  const onToggleStatus = async (doctorId: string, status: 'ACTIVE' | 'INACTIVE') => {
    try {
      await updateStatus.mutateAsync({ doctorId, status });
      toast.success(`Affiliation ${status === 'ACTIVE' ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update affiliation.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hospital Network"
        title="Doctor Affiliations"
        description="Grant or revoke clinical privileges for doctors at your facility."
        actions={
          <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            Add doctor
          </Button>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!affiliations || affiliations.length === 0) && (
        <EmptyState icon={Building2} title="No affiliated doctors yet" description="Add a doctor to grant them access to write records at your facility." />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {affiliations?.map((a) => (
          <Card key={a.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink-900">{a.doctorName || a.doctorId}</p>
                  <p className="text-xs text-ink-500">{a.roleAtTenant}</p>
                  <p className="mt-1 text-[11px] text-ink-400">Since {formatDate(a.createdAt)}</p>
                </div>
                <Badge tone={a.status === 'ACTIVE' ? 'success' : a.status === 'PENDING' ? 'warning' : 'neutral'}>{a.status}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                {a.status !== 'ACTIVE' && (
                  <Button size="sm" variant="outline" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => onToggleStatus(a.doctorId, 'ACTIVE')}>
                    Activate
                  </Button>
                )}
                {a.status !== 'INACTIVE' && (
                  <Button size="sm" variant="ghost" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => onToggleStatus(a.doctorId, 'INACTIVE')}>
                    Deactivate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenantId && <AddAffiliationModal isOpen={addOpen} onClose={() => setAddOpen(false)} tenantId={tenantId} />}
    </div>
  );
}
