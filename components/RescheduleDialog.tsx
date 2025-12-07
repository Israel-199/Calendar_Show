"use client";
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CalendarDays, Clock } from 'lucide-react';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  onReschedule: (newDateTime: Date) => void;
  isLoading?: boolean;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  currentDate,
  onReschedule,
  isLoading,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentDate);
  const [selectedTime, setSelectedTime] = useState(format(currentDate, 'HH:mm'));

  const handleReschedule = () => {
    if (!selectedDate) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    onReschedule(newDateTime);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Reschedule Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Select Time
            </Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full"
            />
          </div>

          {selectedDate && (
            <p className="text-sm text-muted-foreground text-center">
              New appointment: {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || isLoading}
            className="gradient-primary text-primary-foreground"
          >
            {isLoading ? 'Saving...' : 'Confirm Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
