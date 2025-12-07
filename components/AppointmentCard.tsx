import { format } from 'date-fns';
import { Phone, Clock, User, FileText, CalendarDays } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReminderButton } from './ReminderButton';

interface AppointmentCardProps {
  appointment: Appointment;
  onCallClick: (appointment: Appointment) => void;
  onRescheduleClick?: (appointment: Appointment) => void;
  isSelected?: boolean;
}

export function AppointmentCard({ appointment, onCallClick, onRescheduleClick, isSelected }: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.appointment_time);

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-lg cursor-pointer border-border/50',
        isSelected && 'ring-2 ring-primary shadow-lg'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-foreground truncate">
                {appointment.patient_name}
              </h3>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{format(appointmentDate, 'MMM d, yyyy • h:mm a')}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{appointment.phone_number}</span>
              </div>

              {appointment.notes && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{appointment.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              <ReminderButton
                appointmentId={appointment.id}
                patientName={appointment.patient_name}
                appointmentTime={appointmentDate}
              />
              <StatusBadge status={appointment.status} />
            </div>
            <div className="flex items-center gap-1.5">
              {onRescheduleClick && appointment.status !== 'cancelled' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRescheduleClick(appointment);
                  }}
                  className="border-status-rescheduled text-status-rescheduled hover:bg-status-rescheduled-bg"
                >
                  <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                  Reschedule
                </Button>
              )}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCallClick(appointment);
                }}
                className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                disabled={appointment.status === 'cancelled'}
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Call
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
