import { AppointmentStatus } from '@/types/appointment';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'status-pending',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'status-confirmed',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'status-cancelled',
  },
  rescheduled: {
    label: 'Rescheduled',
    className: 'status-rescheduled',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
