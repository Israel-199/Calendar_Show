export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  patient_name: string;
  phone_number: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
}
