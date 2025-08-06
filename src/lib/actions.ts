import { createServerSupabase } from './supabase-server';
import type { Doctor, AppointmentType, TimeSlot } from '@/types';

export async function getDoctors(): Promise<Doctor[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('full_name');

  if (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }

  return data || [];
}

export async function getAppointmentTypes(): Promise<AppointmentType[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('appointment_types')
    .select('*')
    .order('duration');

  if (error) {
    console.error('Error fetching appointment types:', error);
    return [];
  }

  return data || [];
}

// Add default time slots (8 AM to 5 PM)
const DEFAULT_TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export async function getAvailableSlots(
  doctorId: string,
  date: string
): Promise<TimeSlot[]> {
  const supabase = createServerSupabase();
  
  // Get doctor's available hours
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('available_hours')
    .eq('id', doctorId)
    .single();

  if (doctorError) {
    console.error('Error fetching doctor:', doctorError);
    return [];
  }

  // Use doctor's available hours or default time slots
  const availableHours = doctor?.available_hours?.length 
    ? doctor.available_hours 
    : DEFAULT_TIME_SLOTS;

  // Get existing appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*, appointment_types(*)')
    .eq('doctor_id', doctorId)
    .eq('date', date)
    .neq('status', 'cancelled');

  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError);
    return [];
  }

  // Create time slots from available hours
  const slots: TimeSlot[] = availableHours.map(hour => ({
    date,
    start_time: hour,
    is_available: true
  }));

  // Mark booked slots as unavailable
  appointments?.forEach(appointment => {
    const start = new Date(`${date}T${appointment.start_time}`);
    const end = new Date(start.getTime() + (appointment.appointment_types?.duration || 30) * 60000);

    slots.forEach(slot => {
      const slotTime = new Date(`${date}T${slot.start_time}`);
      if (slotTime >= start && slotTime < end) {
        slot.is_available = false;
      }
    });
  });

  return slots.filter(slot => slot.is_available);
} 