import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { useEffect } from 'react';

export function useAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const rescheduleAppointment = useMutation({
    mutationFn: async ({ id, newDateTime }: { id: string; newDateTime: Date }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          appointment_time: newDateTime.toISOString(),
          status: 'rescheduled' as AppointmentStatus
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments,
    isLoading,
    error,
    updateStatus: updateStatus.mutate,
    isUpdating: updateStatus.isPending,
    rescheduleAppointment: rescheduleAppointment.mutate,
    isRescheduling: rescheduleAppointment.isPending,
  };
}
