import { cn } from '@/lib/utils';

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-950 text-white shadow-sm">
        <span className="text-base font-black tracking-tight">M</span>
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand-600" />
      </div>
      {!compact && (
        <span className="text-2xl font-black tracking-normal text-ink-950">
          Med<span className="text-brand-600">ora</span>
        </span>
      )}
    </div>
  );
}