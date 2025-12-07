"use client";
import { useState } from 'react';
import { Header } from '@/components/Header';
import { CalendarView } from '@/components/CalendarView';
import { AppointmentList } from '@/components/AppointmentList';
import { StatsCards } from '@/components/StatsCards';
import { MockCallInterface } from '@/components/MockCallInterface';
import { AppointmentForm } from '@/components/AppointmentForm';
import { RescheduleDialog } from '@/components/RescheduleDialog';
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const { appointments, isLoading, updateStatus, rescheduleAppointment: doReschedule, isRescheduling } = useAppointments();
  const { toast } = useToast();

  const handleCallClick = (appointment: Appointment) => {
    setActiveCall(appointment);
  };

  const handleCloseCall = () => {
    setActiveCall(null);
  };

  const handleStatusUpdate = (status: AppointmentStatus) => {
    if (activeCall) {
      updateStatus({ id: activeCall.id, status });
    }
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setRescheduleAppointment(appointment);
  };

  const handleReschedule = (newDateTime: Date) => {
    if (rescheduleAppointment) {
      doReschedule(
        { id: rescheduleAppointment.id, newDateTime },
        {
          onSuccess: () => {
            toast({
              title: 'Appointment Rescheduled',
              description: `Appointment for ${rescheduleAppointment.patient_name} has been rescheduled.`,
            });
            setRescheduleAppointment(null);
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to reschedule appointment. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleCallReschedule = (appointment: Appointment) => {
    setActiveCall(null);
    setRescheduleAppointment(appointment);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6 animate-fade-in">
          {/* Stats Overview */}
          <div className="flex items-center justify-between">
            <StatsCards appointments={appointments} />
            <AppointmentForm />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-[340px_1fr] gap-6">
            {/* Calendar Sidebar */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CalendarView
                appointments={appointments}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {/* Appointments List */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <AppointmentList
                appointments={appointments}
                selectedDate={selectedDate}
                onCallClick={handleCallClick}
                onRescheduleClick={handleRescheduleClick}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mock Call Interface */}
      {activeCall && (
        <MockCallInterface
          appointment={activeCall}
          onClose={handleCloseCall}
          onStatusUpdate={handleStatusUpdate}
          onRescheduleRequest={handleCallReschedule}
        />
      )}

      {/* Reschedule Dialog */}
      {rescheduleAppointment && (
        <RescheduleDialog
          open={!!rescheduleAppointment}
          onOpenChange={(open) => !open && setRescheduleAppointment(null)}
          currentDate={new Date(rescheduleAppointment.appointment_time)}
          onReschedule={handleReschedule}
          isLoading={isRescheduling}
        />
      )}
    </div>
  );
};

export default Home;


