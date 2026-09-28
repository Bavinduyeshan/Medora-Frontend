'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAddDepartment, useRemoveDepartment, useTenantDepartments } from '@/hooks/useHospitalData';
import { PageHeader, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Card, CardContent } from '@/components/ui/Card';
import { ApiError } from '@/lib/http';

export default function HospitalDepartmentsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? undefined;
  const { data: departments, isLoading, error, refetch } = useTenantDepartments(tenantId);
  const addDepartment = useAddDepartment(tenantId);
  const removeDepartment = useRemoveDepartment(tenantId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDepartment.mutateAsync({ name, description });
      toast.success('Department added.');
      setName('');
      setDescription('');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not add department.');
    }
  };

  const onRemove = async (id: string) => {
    try {
      await removeDepartment.mutateAsync(id);
      toast.success('Department removed.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove department.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Facility Structure"
        title="Departments"
        description="Organize your affiliated doctors by department."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            Add department
          </Button>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {error && <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />}
      {!isLoading && !error && (!departments || departments.length === 0) && (
        <EmptyState icon={LayoutGrid} title="No departments yet" description="Add your first department, like Cardiology or Emergency." />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments?.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-900">{d.name}</p>
                {d.description && <p className="mt-1 text-xs text-ink-500">{d.description}</p>}
              </div>
              <button onClick={() => onRemove(d.id)} className="text-ink-300 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add department">
        <form onSubmit={onAdd} className="space-y-4">
          <Field label="Department name" required>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Cardiology" />
          </Field>
          <Field label="Description" hint="Optional">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" loading={addDepartment.isPending}>
            Add department
          </Button>
        </form>
      </Modal>
    </div>
  );
}
