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
  console.log('🏥 getAvailableSlots called with:', { doctorId, date });
  
  const supabase = createServerSupabase();
  
  try {
    // Get doctor's available hours - handle case where column might not exist
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('available_hours, full_name')
      .eq('id', doctorId)
      .single();

    if (doctorError) {
      console.error('❌ Error fetching doctor:', doctorError);
      // If doctor not found, still return default slots for testing
      console.log('🔄 Doctor not found, using default slots for doctorId:', doctorId);
    }

    console.log('👨‍⚕️ Doctor data:', {
      doctorId,
      name: doctor?.full_name,
      availableHours: doctor?.available_hours,
      hasCustomHours: !!(doctor?.available_hours && Array.isArray(doctor.available_hours) && doctor.available_hours.length > 0)
    });

    // Use doctor's available hours or default time slots
    // Handle case where available_hours might be null, undefined, or not an array
    let availableHours = DEFAULT_TIME_SLOTS;
    if (doctor?.available_hours && Array.isArray(doctor.available_hours) && doctor.available_hours.length > 0) {
      availableHours = doctor.available_hours;
    }

    console.log('⏰ Available hours to use:', availableHours);

    // Get existing appointments for this doctor and date
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*, appointment_types(duration)')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .neq('status', 'cancelled');

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError);
      // Continue with empty appointments array
    }

    console.log('📅 Existing appointments on', date, ':', {
      count: appointments?.length || 0,
      appointments: appointments?.map(apt => ({
        id: apt.id,
        start_time: apt.start_time,
        status: apt.status,
        duration: apt.appointment_types?.duration
      })) || []
    });

    // Create time slots from available hours
    const slots: TimeSlot[] = availableHours.map(hour => ({
      date,
      start_time: hour,
      is_available: true
    }));

    console.log('🎰 Created initial slots:', slots.length, 'slots');

    // Mark booked slots as unavailable
    if (appointments && appointments.length > 0) {
      appointments.forEach(appointment => {
        try {
          const appointmentDate = new Date(`${date}T${appointment.start_time}`);
          const duration = appointment.appointment_types?.duration || 30;
          const endTime = new Date(appointmentDate.getTime() + duration * 60000);

          console.log('🚫 Processing busy slot:', {
            appointmentId: appointment.id,
            start: appointment.start_time,
            duration: duration,
            startISO: appointmentDate.toISOString(),
            endISO: endTime.toISOString()
          });

          slots.forEach(slot => {
            const slotDateTime = new Date(`${date}T${slot.start_time}`);
            if (slotDateTime >= appointmentDate && slotDateTime < endTime) {
              console.log(`🔒 Marking slot ${slot.start_time} as unavailable`);
              slot.is_available = false;
            }
          });
        } catch (timeError) {
          console.error('❌ Error processing appointment time:', timeError, appointment);
        }
      });
    }

    const availableSlots = slots.filter(slot => slot.is_available);
    
    console.log('✅ Final available slots result:', {
      doctorId,
      date,
      totalSlots: slots.length,
      availableCount: availableSlots.length,
      unavailableCount: slots.length - availableSlots.length,
      availableTimes: availableSlots.map(s => s.start_time)
    });

    return availableSlots;
  } catch (error) {
    console.error('❌ Unexpected error in getAvailableSlots:', error);
    // Return default slots as fallback
    const fallbackSlots: TimeSlot[] = DEFAULT_TIME_SLOTS.map(hour => ({
      date,
      start_time: hour,
      is_available: true
    }));
    console.log('🔄 Returning fallback default slots:', fallbackSlots.length);
    return fallbackSlots;
  }
} 