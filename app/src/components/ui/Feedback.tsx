import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />;
}

export function FullPageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-400">
      <Spinner className="h-6 w-6" />
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[1.35rem] border border-dashed border-brand-200 bg-white/70 px-6 py-12 text-center shadow-[var(--shadow-card)]">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-bold text-ink-800">{title}</p>
        {description && <p className="text-xs text-ink-500 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[1.35rem] border border-rose-100 bg-rose-50/70 px-6 py-10 text-center">
      <p className="text-sm font-bold text-rose-700">Couldn&apos;t load this data</p>
      <p className="text-xs text-rose-500 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'brand',
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'brand' | 'ink' | 'amber' | 'rose' | 'sky';
}) {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-600/10',
    ink: 'bg-ink-100 text-ink-800 ring-ink-500/10',
    amber: 'bg-amber-50 text-amber-600 ring-amber-500/10',
    rose: 'bg-rose-50 text-rose-600 ring-rose-500/10',
    sky: 'bg-sky-50 text-sky-600 ring-sky-500/10',
  }[tone];

  return (
    <div className="rounded-[1.35rem] border border-white/80 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-ink-400">{label}</span>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl ring-1', toneClasses)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-black tracking-normal text-ink-950 font-tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function Avatar({ name, className, size = 40 }: { name: string; className?: string; size?: number }) {
  const initialsText = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-ink-950 font-black text-white shadow-sm',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsText || 'M'}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/75 bg-white/70 p-5 shadow-[var(--shadow-card)] backdrop-blur sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-black tracking-normal text-ink-950 sm:text-[30px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}