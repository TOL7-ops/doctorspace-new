import { createServerSupabase } from './supabase-server'
import type { User, Doctor, Appointment, Message } from '@/types'

export async function getCurrentUserServer() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error fetching user:', userError)
      return null
    }
    
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return null
    }

    if (!profile) {
      console.error('No profile found for user:', user.id)
      return null
    }

    return {
      id: user.id,
      email: user.email,
      ...profile
    }
  } catch (error) {
    console.error('Error in getCurrentUserServer:', error)
    return null
  }
}

export async function getUpcomingAppointmentsServer(userId: string) {
  try {
    const supabase = createServerSupabase()
    const { data: appointments, error } = await supabase
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
  } catch (error) {
    console.error('Error in getUpcomingAppointmentsServer:', error)
    return []
  }
}

export async function getMessagesServer(userId: string) {
  try {
    const supabase = createServerSupabase();
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(*)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      console.error('Error fetching messages:', error)
      return [];
    }
    return messages;
  } catch (error) {
    console.error('Error in getMessagesServer:', error)
    return [];
  }
}

export async function getPastAppointmentsServer(userId: string) {
  try {
    const supabase = createServerSupabase()
    const { data: appointments, error } = await supabase
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
  } catch (error) {
    console.error('Error in getPastAppointmentsServer:', error)
    return []
  }
}

export async function getCancelledAppointmentsServer(userId: string) {
  try {
    const supabase = createServerSupabase()
    const { data: appointments, error } = await supabase
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
  } catch (error) {
    console.error('Error in getCancelledAppointmentsServer:', error)
    return []
  }
} 