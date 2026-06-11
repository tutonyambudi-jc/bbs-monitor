import type { ServiceStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const config: Record<ServiceStatus, { label: string; className: string }> = {
  ONLINE: { label: 'ONLINE', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  OFFLINE: { label: 'OFFLINE', className: 'bg-red-500/15 text-red-700 border-red-500/30' },
  DEGRADED: { label: 'DEGRADED', className: 'bg-amber-500/15 text-amber-800 border-amber-500/30' },
  UNKNOWN: { label: 'UNKNOWN', className: 'bg-slate-500/15 text-slate-600 border-slate-500/30' },
};

export function StatusBadge({ status, className }: { status: ServiceStatus; className?: string }) {
  const c = config[status];
  return (
    <Badge variant="outline" className={cn(c.className, className)}>
      {c.label}
    </Badge>
  );
}
