import { Appointment } from '@/types/appointment';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';

interface StatsCardsProps {
  appointments: Appointment[];
}

export function StatsCards({ appointments }: StatsCardsProps) {
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const cards = [
    {
      label: 'Total',
      value: stats.total,
      icon: Calendar,
      className: 'bg-primary/10 text-primary',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      className: 'bg-status-pending-bg text-status-pending',
    },
    {
      label: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle2,
      className: 'bg-status-confirmed-bg text-status-confirmed',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      className: 'bg-status-cancelled-bg text-status-cancelled',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(card => (
        <Card key={card.label} className="shadow-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.className}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
