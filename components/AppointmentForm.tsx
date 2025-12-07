"use client";
import { useState } from 'react';
import { CalendarIcon, Clock, User, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AppointmentFormProps {
  trigger?: React.ReactNode;
}

export function AppointmentForm({ trigger }: AppointmentFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('09:00');
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetForm = () => {
    setDate(undefined);
    setTime('09:00');
    setPatientName('');
    setPhoneNumber('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !patientName || !phoneNumber) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentTime = new Date(date);
      appointmentTime.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from('appointments').insert({
        patient_name: patientName,
        phone_number: phoneNumber,
        appointment_time: appointmentTime.toISOString(),
        notes: notes || null,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Appointment Created',
        description: `Appointment for ${patientName} has been scheduled.`,
      });

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
            <CalendarIcon className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Schedule New Appointment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Patient Name */}
          <div className="space-y-2">
            <Label htmlFor="patientName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Patient Name *
            </Label>
            <Input
              id="patientName"
              placeholder="Enter patient name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Phone Number *
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Time *
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this appointment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Appointment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
