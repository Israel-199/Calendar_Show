"use client";
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Appointment } from '@/types/appointment';
import { format, isSameDay } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface CalendarViewProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

export function CalendarView({ appointments, selectedDate, onSelectDate }: CalendarViewProps) {
  // Get dates that have appointments
  const appointmentDates = appointments.reduce((acc, apt) => {
    const dateKey = format(new Date(apt.appointment_time), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = { total: 0, pending: 0, confirmed: 0 };
    }
    acc[dateKey].total++;
    if (apt.status === 'pending') acc[dateKey].pending++;
    if (apt.status === 'confirmed') acc[dateKey].confirmed++;
    return acc;
  }, {} as Record<string, { total: number; pending: number; confirmed: number }>);

  const modifiers = {
    hasAppointments: (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return !!appointmentDates[dateKey];
    },
    hasPending: (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return appointmentDates[dateKey]?.pending > 0;
    },
  };

  const modifiersStyles = {
    hasAppointments: {
      fontWeight: 700,
    },
    hasPending: {
      position: 'relative' as const,
    },
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="w-5 h-5 text-primary" />
          Appointment Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md"
          components={{
            DayContent: ({ date }: { date: Date }) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayData = appointmentDates[dateKey];
              
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <span>{date.getDate()}</span>
                  {dayData && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayData.pending > 0 && (
                        <span className="w-2 h-2 rounded-full bg-status-pending" />
                      )}
                      {dayData.confirmed > 0 && (
                        <span className="w-2 h-2 rounded-full bg-status-confirmed" />
                      )}
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-pending" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-confirmed" />
              <span>Confirmed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
