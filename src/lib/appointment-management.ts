import { supabase } from '@/lib/supabase'
import { 
  createNotification, 
  createCancellationNotification, 
  createRescheduleNotification 
} from '@/lib/notifications'

export interface AppointmentAction {
  id: string
  patient_id: string
  doctor_id: string
  date: string
  start_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  doctor?: {
    full_name: string
  }
}

export interface RatingData {
  appointmentId: string
  patientId: string
  doctorId: string
  rating: number
  comment?: string
}

export interface RescheduleData {
  appointmentId: string
  newDate: string
  newTime: string
  reason?: string
}

export interface CancellationData {
  appointmentId: string
  reason: string
}

// Cancel appointment
export async function cancelAppointment(data: CancellationData): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Authentication required')
  }

  // Get appointment details
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(full_name),
      patient:patients(full_name)
    `)
    .eq('id', data.appointmentId)
    .single()

  if (appointmentError || !appointment) {
    throw new Error('Appointment not found')
  }

  // Check if user can cancel this appointment
  if (appointment.patient_id !== user.id) {
    throw new Error('You can only cancel your own appointments')
  }

  // Check if appointment can be cancelled (more than 24 hours away)
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilAppointment < 24) {
    throw new Error('Appointments can only be cancelled at least 24 hours in advance')
  }

  // Update appointment status
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', data.appointmentId)

  if (updateError) {
    throw new Error('Failed to cancel appointment')
  }

  // Record cancellation reason
  const { error: cancellationError } = await supabase
    .from('appointment_cancellations')
    .insert({
      appointment_id: data.appointmentId,
      cancelled_by: user.id,
      reason: data.reason
    })

  if (cancellationError) {
    console.error('Failed to record cancellation reason:', cancellationError)
  }

  // Create notifications
  try {
    console.log('Creating cancellation notifications...')
    
    // Notify patient
    await createCancellationNotification(
      appointment.patient_id,
      appointment.doctor?.full_name || 'your doctor',
      appointment.date,
      appointment.start_time,
      'patient',
      data.reason
    )
    console.log('Patient notification created successfully')

    // Notify doctor
    await createNotification({
      user_id: appointment.doctor_id,
      title: 'Appointment Cancelled',
      message: `Appointment with ${appointment.patient?.full_name} on ${appointment.date} at ${appointment.start_time} has been cancelled by the patient.`
    })
    console.log('Doctor notification created successfully')
  } catch (notificationError) {
    console.error('Failed to create cancellation notifications:', notificationError)
    // Don't throw the error - appointment cancellation should still succeed even if notifications fail
  }
}

// Reschedule appointment
export async function rescheduleAppointment(data: RescheduleData): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Authentication required')
  }

  // Get appointment details
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(full_name),
      patient:patients(full_name)
    `)
    .eq('id', data.appointmentId)
    .single()

  if (appointmentError || !appointment) {
    throw new Error('Appointment not found')
  }

  // Check if user can reschedule this appointment
  if (appointment.patient_id !== user.id) {
    throw new Error('You can only reschedule your own appointments')
  }

  // Check if appointment can be rescheduled (more than 24 hours away)
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilAppointment < 24) {
    throw new Error('Appointments can only be rescheduled at least 24 hours in advance')
  }

  // Check if new slot is available
  const { data: conflictingAppointments, error: conflictError } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', appointment.doctor_id)
    .eq('date', data.newDate)
    .eq('start_time', data.newTime)
    .neq('status', 'cancelled')

  if (conflictError) {
    throw new Error('Failed to check slot availability')
  }

  if (conflictingAppointments && conflictingAppointments.length > 0) {
    throw new Error('Selected time slot is not available')
  }

  // Record reschedule history
  const { error: rescheduleError } = await supabase
    .from('appointment_reschedules')
    .insert({
      appointment_id: data.appointmentId,
      rescheduled_by: user.id,
      old_date: appointment.date,
      old_start_time: appointment.start_time,
      new_date: data.newDate,
      new_start_time: data.newTime,
      reason: data.reason
    })

  if (rescheduleError) {
    console.error('Failed to record reschedule history:', rescheduleError)
  }

  // Update appointment
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      date: data.newDate,
      start_time: data.newTime
    })
    .eq('id', data.appointmentId)

  if (updateError) {
    throw new Error('Failed to reschedule appointment')
  }

  // Create notifications
  try {
    // Notify patient
    await createRescheduleNotification(
      appointment.patient_id,
      appointment.doctor?.full_name || 'your doctor',
      appointment.date,
      appointment.start_time,
      data.newDate,
      data.newTime,
      'patient',
      data.reason
    )

    // Notify doctor
    await createNotification({
      user_id: appointment.doctor_id,
      title: 'Appointment Rescheduled',
      message: `Appointment with ${appointment.patient?.full_name} has been rescheduled to ${data.newDate} at ${data.newTime}.${data.reason ? ` Reason: ${data.reason}` : ''}`
    })
  } catch (notificationError) {
    console.error('Failed to create reschedule notifications:', notificationError)
  }
}

// Submit rating for completed appointment
export async function submitRating(data: RatingData): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Authentication required')
  }

  // Verify appointment exists and is completed
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select('status, patient_id')
    .eq('id', data.appointmentId)
    .single()

  if (appointmentError || !appointment) {
    throw new Error('Appointment not found')
  }

  if (appointment.status !== 'completed') {
    throw new Error('You can only rate completed appointments')
  }

  if (appointment.patient_id !== user.id) {
    throw new Error('You can only rate your own appointments')
  }

  // Check if rating already exists
  const { data: existingRating, error: checkError } = await supabase
    .from('appointment_ratings')
    .select('id')
    .eq('appointment_id', data.appointmentId)
    .eq('patient_id', data.patientId)
    .single()

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error('Failed to check existing rating')
  }

  if (existingRating) {
    // Update existing rating
    const { error: updateError } = await supabase
      .from('appointment_ratings')
      .update({
        rating: data.rating,
        comment: data.comment
      })
      .eq('appointment_id', data.appointmentId)
      .eq('patient_id', data.patientId)

    if (updateError) {
      throw new Error('Failed to update rating')
    }
  } else {
    // Create new rating
    const { error: insertError } = await supabase
      .from('appointment_ratings')
      .insert({
        appointment_id: data.appointmentId,
        patient_id: data.patientId,
        doctor_id: data.doctorId,
        rating: data.rating,
        comment: data.comment
      })

    if (insertError) {
      throw new Error('Failed to submit rating')
    }
  }
}

// Get appointment ratings
export async function getAppointmentRatings(doctorId: string) {
  const { data, error } = await supabase
    .from('appointment_ratings')
    .select(`
      *,
      appointment:appointments(date, start_time),
      patient:patients(full_name)
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch ratings')
  }

  return data || []
}

// Check if appointment can be cancelled/rescheduled
export async function canModifyAppointment(appointmentId: string): Promise<boolean> {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('date, start_time')
    .eq('id', appointmentId)
    .single()

  if (error || !appointment) {
    return false
  }

  const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  return hoursUntilAppointment >= 24
} 