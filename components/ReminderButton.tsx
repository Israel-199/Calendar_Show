"use client";
import { useState } from 'react';
import { Bell, BellRing, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReminderButtonProps {
  appointmentId: string;
  patientName: string;
  appointmentTime: Date;
}

export function ReminderButton({ appointmentId, patientName, appointmentTime }: ReminderButtonProps) {
  const [reminderSet, setReminderSet] = useState<string | null>(null);
  const { toast } = useToast();

  const reminderOptions = [
    { label: '15 minutes before', value: '15min', minutes: 15 },
    { label: '30 minutes before', value: '30min', minutes: 30 },
    { label: '1 hour before', value: '1hour', minutes: 60 },
    { label: '1 day before', value: '1day', minutes: 1440 },
  ];

  const setReminder = (option: typeof reminderOptions[0]) => {
    const reminderTime = new Date(appointmentTime.getTime() - option.minutes * 60 * 1000);
    
    // Check if reminder time is in the past
    if (reminderTime <= new Date()) {
      toast({
        title: 'Cannot set reminder',
        description: 'The reminder time has already passed.',
        variant: 'destructive',
      });
      return;
    }

    // Store reminder in localStorage (in a real app, this would be in the database)
    const reminders = JSON.parse(localStorage.getItem('appointment_reminders') || '{}');
    reminders[appointmentId] = {
      reminderTime: reminderTime.toISOString(),
      option: option.value,
      patientName,
      appointmentTime: appointmentTime.toISOString(),
    };
    localStorage.setItem('appointment_reminders', JSON.stringify(reminders));

    setReminderSet(option.value);
    
    toast({
      title: 'Reminder set',
      description: `You'll be reminded ${option.label} for ${patientName}'s appointment.`,
    });

    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const clearReminder = () => {
    const reminders = JSON.parse(localStorage.getItem('appointment_reminders') || '{}');
    delete reminders[appointmentId];
    localStorage.setItem('appointment_reminders', JSON.stringify(reminders));
    setReminderSet(null);
    
    toast({
      title: 'Reminder cleared',
      description: `Reminder for ${patientName}'s appointment has been removed.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8',
            reminderSet && 'text-primary'
          )}
        >
          {reminderSet ? (
            <BellRing className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {reminderOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setReminder(option)}
            className="flex items-center gap-2"
          >
            {reminderSet === option.value && <Check className="w-4 h-4 text-primary" />}
            <span className={reminderSet === option.value ? 'font-medium' : ''}>
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
        {reminderSet && (
          <DropdownMenuItem
            onClick={clearReminder}
            className="text-destructive focus:text-destructive"
          >
            Clear reminder
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
