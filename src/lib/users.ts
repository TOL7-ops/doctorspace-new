import { createServerSupabase } from './supabase-server'
import { supabase } from './supabase'

export async function getCurrentUserServer() {
  const supa = createServerSupabase()
  const { data: { user } } = await supa.auth.getUser()
  if (!user) return null

  const { data: profile } = await supa
    .from('patients')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email,
    ...profile,
  }
}

export async function getCurrentUserClient() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('patients')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email,
    ...profile,
  }
}

export async function getUpcomingAppointments(userId: string) {
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(*),
      appointment_type:appointment_types(*)
    `)
    .eq('patient_id', userId)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return appointments
}

export async function getPastAppointments(userId: string) {
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(*),
      appointment_type:appointment_types(*)
    `)
    .eq('patient_id', userId)
    .lt('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: false })
    .order('start_time', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Error fetching past appointments:', error)
    return []
  }

  return appointments
}

export async function getMessages(userId: string) {
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`*, sender:users!messages_sender_id_fkey(*)`)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return messages
}

export async function getTopDoctors() {
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      *,
      users!inner(*),
      appointments(count)
    `)
    .order('appointments_count', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching top doctors:', error)
    return []
  }

  return doctors
}

export async function getPromotions() {
  const { data: promotions, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching promotions:', error)
    return []
  }

  return promotions
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
) {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)

  if (error) {
    throw new Error(`Failed to update appointment status: ${error.message}`)
  }
}

export async function markMessageAsRead(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)

  if (error) {
    throw new Error(`Failed to mark message as read: ${error.message}`)
  }
}

export async function getUpcomingAppointmentsServer(userId: string) {
  const supa = createServerSupabase()
  const { data: appointments, error } = await supa
    .from('appointments')
    .select(`
      *,
      doctor:doctors(*),
      appointment_type:appointment_types(*)
    `)
    .eq('patient_id', userId)
    .gte('date', new Date().toISOString().split('T')[0])
    .not('status', 'eq', 'cancelled')
    .not('status', 'eq', 'completed')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return appointments
}

export async function getMessagesServer(userId: string) {
  const supa = createServerSupabase()
  const { data: messages, error } = await supa
    .from('messages')
    .select('*, sender:users!messages_sender_id_fkey(*)')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  return messages
}

export async function getPastAppointmentsServer(userId: string) {
  const supa = createServerSupabase()
  const { data: appointments, error } = await supa
    .from('appointments')
    .select(`
      *,
      doctor:doctors(*),
      appointment_type:appointment_types(*)
    `)
    .eq('patient_id', userId)
    .eq('status', 'completed')
    .order('date', { ascending: false })
    .order('start_time', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error fetching past appointments:', error)
    return []
  }

  return appointments
}

export async function getCancelledAppointmentsServer(userId: string) {
  const supa = createServerSupabase()
  const { data: appointments, error } = await supa
    .from('appointments')
    .select(`
      *,
      doctor:doctors(*),
      appointment_type:appointment_types(*)
    `)
    .eq('patient_id', userId)
    .eq('status', 'cancelled')
    .order('date', { ascending: false })
    .order('start_time', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error fetching cancelled appointments:', error)
    return []
  }

  return appointments
} 