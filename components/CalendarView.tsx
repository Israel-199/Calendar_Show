"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

interface CalendarViewProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

export function CalendarView({
  appointments,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  // Map appointments by date
  const appointmentDates = appointments.reduce((acc, apt) => {
    const key = format(new Date(apt.appointment_time), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = { pending: 0, confirmed: 0 };
    if (apt.status === "pending") acc[key].pending++;
    if (apt.status === "confirmed") acc[key].confirmed++;
    return acc;
  }, {} as Record<string, { pending: number; confirmed: number }>);

  // Modifiers for dots
  const modifiers = {
    pending: (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      return (appointmentDates[key]?.pending ?? 0) > 0;
    },
    confirmed: (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      return (appointmentDates[key]?.confirmed ?? 0) > 0;
    },
  };

  // Add classes used by CSS to draw dots (and ensure relative positioning)
  const modifiersClassNames = {
    pending: "day-pending relative",
    confirmed: "day-confirmed relative",
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
          className="rounded-md"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
        />

        {/* Legend */}
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
