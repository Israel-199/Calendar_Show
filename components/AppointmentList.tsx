import { Appointment } from '@/types/appointment';
import { AppointmentCard } from './AppointmentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Loader2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
  onCallClick: (appointment: Appointment) => void;
  onRescheduleClick?: (appointment: Appointment) => void;
  isLoading: boolean;
}

export function AppointmentList({ appointments, selectedDate, onCallClick, onRescheduleClick, isLoading }: AppointmentListProps) {
  const filteredAppointments = selectedDate
    ? appointments.filter(apt => isSameDay(new Date(apt.appointment_time), selectedDate))
    : appointments;

  const groupedAppointments = filteredAppointments.reduce((groups, apt) => {
    const dateKey = format(new Date(apt.appointment_time), 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(apt);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort();

  return (
    <Card className="shadow-card border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="w-5 h-5 text-primary" />
          {selectedDate ? (
            <>Appointments for {format(selectedDate, 'MMMM d, yyyy')}</>
          ) : (
            <>All Appointments</>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No appointments {selectedDate ? 'for this date' : 'found'}</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-6 pr-4">
              {sortedDates.map(dateKey => (
                <div key={dateKey}>
                  {!selectedDate && (
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {format(new Date(dateKey), 'EEEE, MMMM d')}
                    </h3>
                  )}
                  <div className="space-y-3">
                    {groupedAppointments[dateKey]
                      .sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())
                      .map(apt => (
                        <AppointmentCard
                          key={apt.id}
                          appointment={apt}
                          onCallClick={onCallClick}
                          onRescheduleClick={onRescheduleClick}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
