import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { safeLog, isClient } from './utils'
import { ensureTemplateId, getAppointmentTemplateId, getMessageTemplateId, getUrgentReminderTemplateId } from './notification-templates'

type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type NotificationType = 
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'appointment_upcoming'
  | 'message_received'
  | 'system_alert'

export interface NotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>
  priority?: 'low' | 'medium' | 'high'
}

export async function createNotification(notification: NotificationInsert) {
  // Only run on client side to prevent SSR errors
  if (!isClient) {
    safeLog.warn('createNotification called during SSR, skipping...');
    return null;
  }

  try {
    // Ensure we have a valid template_id
    const templateId = await ensureTemplateId(notification.template_id, 'system_alert');
    
    // Prepare the notification data with template_id
    const notificationData = {
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      read: notification.read || false,
      template_id: templateId,
      notification_type: notification.notification_type || 'system',
      priority: notification.priority || 'low',
      metadata: notification.metadata || {},
      // Add other enhanced fields if they exist
      ...(notification.expires_at && { expires_at: notification.expires_at }),
      ...(notification.action_url && { action_url: notification.action_url })
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) {
      safeLog.error('Error creating notification:', error)
      
      // If the error is due to missing template_id, try to get a default one
      if (error.message.includes('template_id') && error.message.includes('null')) {
        safeLog.log('Template ID is null, trying to get default template...')
        const defaultTemplateId = await ensureTemplateId(null, 'system_alert');
        
        if (defaultTemplateId) {
          const { data: retryData, error: retryError } = await supabase
            .from('notifications')
            .insert({
              ...notificationData,
              template_id: defaultTemplateId
            })
            .select()
            .single()

          if (retryError) throw retryError
          return retryData
        }
      }
      
      throw error
    }
    
    return data
  } catch (error) {
    safeLog.error('Error creating notification:', error)
    throw error
  }
}

export async function createEnhancedNotification(data: NotificationData) {
  const notification: NotificationInsert = {
    user_id: data.userId,
    title: data.title,
    message: data.message,
    read: false,
    // Add metadata as JSON in a custom field if needed
  }

  return createNotification(notification)
}

// Enhanced appointment confirmation notification
export async function createAppointmentNotification(
  userId: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentId?: string
) {
  const templateId = await getAppointmentTemplateId('confirmed');
  
  const notification: NotificationInsert = {
    user_id: userId,
    title: 'Appointment Confirmed',
    message: `Your appointment with ${doctorName} has been confirmed for ${appointmentDate} at ${appointmentTime}. Please arrive 10 minutes early.`,
    read: false,
    template_id: templateId,
    notification_type: 'appointment',
    priority: 'medium',
    metadata: {
      doctor_name: doctorName,
      date: appointmentDate,
      time: appointmentTime,
      appointment_id: appointmentId
    }
  }

  return createNotification(notification)
}

// Enhanced appointment reminder notification
export async function createAppointmentReminderNotification(
  userId: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  hoursUntilAppointment: number
) {
  let urgency = 'reminder'
  let message = `Reminder: You have an appointment with ${doctorName} on ${appointmentDate} at ${appointmentTime}.`
  let priority = 'medium'
  let templateId: string | null = null

  if (hoursUntilAppointment <= 2) {
    urgency = 'urgent'
    message = `URGENT: Your appointment with ${doctorName} is in ${hoursUntilAppointment} hour(s) at ${appointmentTime}. Please confirm your attendance.`
    priority = 'high'
    templateId = await getUrgentReminderTemplateId()
  } else if (hoursUntilAppointment <= 24) {
    urgency = 'soon'
    message = `Reminder: You have an appointment with ${doctorName} tomorrow at ${appointmentTime}. Please confirm your attendance.`
    priority = 'medium'
    templateId = await getAppointmentTemplateId('reminder')
  } else {
    templateId = await getAppointmentTemplateId('reminder')
  }

  const notification: NotificationInsert = {
    user_id: userId,
    title: `Appointment ${urgency === 'urgent' ? 'URGENT' : 'Reminder'}`,
    message,
    read: false,
    template_id: templateId,
    notification_type: 'appointment',
    priority,
    metadata: {
      doctor_name: doctorName,
      date: appointmentDate,
      time: appointmentTime,
      hours_until_appointment: hoursUntilAppointment,
      urgency
    }
  }

  return createNotification(notification)
}

// Enhanced cancellation notification
export async function createCancellationNotification(
  userId: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  cancelledBy: 'patient' | 'doctor' | 'system',
  reason?: string
) {
  const templateId = await getAppointmentTemplateId('cancelled');
  const cancelledByText = cancelledBy === 'patient' ? 'you' : 
                         cancelledBy === 'doctor' ? 'the doctor' : 'the system'
  
  const reasonText = reason ? ` Reason: ${reason}` : ''

  const notification: NotificationInsert = {
    user_id: userId,
    title: 'Appointment Cancelled',
    message: `Your appointment with ${doctorName} on ${appointmentDate} at ${appointmentTime} has been cancelled by ${cancelledByText}.${reasonText}`,
    read: false,
    template_id: templateId,
    notification_type: 'appointment',
    priority: 'high',
    metadata: {
      doctor_name: doctorName,
      date: appointmentDate,
      time: appointmentTime,
      cancelled_by: cancelledBy,
      reason: reason || null
    }
  }

  return createNotification(notification)
}

// Enhanced rescheduling notification
export async function createRescheduleNotification(
  userId: string,
  doctorName: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string,
  rescheduledBy: 'patient' | 'doctor',
  reason?: string
) {
  const templateId = await getAppointmentTemplateId('rescheduled');
  const rescheduledByText = rescheduledBy === 'patient' ? 'you' : 'the doctor'
  const reasonText = reason ? ` Reason: ${reason}` : ''

  const notification: NotificationInsert = {
    user_id: userId,
    title: 'Appointment Rescheduled',
    message: `Your appointment with ${doctorName} has been rescheduled by ${rescheduledByText} from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}.${reasonText}`,
    read: false,
    template_id: templateId,
    notification_type: 'appointment',
    priority: 'medium',
    metadata: {
      doctor_name: doctorName,
      old_date: oldDate,
      old_time: oldTime,
      new_date: newDate,
      new_time: newTime,
      rescheduled_by: rescheduledBy,
      reason: reason || null
    }
  }

  return createNotification(notification)
}

// Upcoming appointment notification (for appointments within 24 hours)
export async function createUpcomingAppointmentNotification(
  userId: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  hoursUntilAppointment: number
) {
  const templateId = await getAppointmentTemplateId('reminder');
  const timeText = hoursUntilAppointment < 1 ? 
    'less than an hour' : 
    `${hoursUntilAppointment} hour${hoursUntilAppointment === 1 ? '' : 's'}`

  const notification: NotificationInsert = {
    user_id: userId,
    title: 'Upcoming Appointment',
    message: `Your appointment with ${doctorName} is in ${timeText} (${appointmentDate} at ${appointmentTime}). Please prepare for your visit.`,
    read: false,
    template_id: templateId,
    notification_type: 'appointment',
    priority: 'medium',
    metadata: {
      doctor_name: doctorName,
      date: appointmentDate,
      time: appointmentTime,
      hours_until_appointment: hoursUntilAppointment
    }
  }

  return createNotification(notification)
}

// Message notification
export async function createMessageNotification(
  userId: string,
  senderName: string,
  messagePreview: string
) {
  const templateId = await getMessageTemplateId();

  const notification: NotificationInsert = {
    user_id: userId,
    title: 'New Message',
    message: `${senderName} sent you a message: "${messagePreview}"`,
    read: false,
    template_id: templateId,
    notification_type: 'message',
    priority: 'low',
    metadata: {
      sender_name: senderName,
      message_preview: messagePreview
    }
  }

  return createNotification(notification)
}

// System notification
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string
) {
  const templateId = await ensureTemplateId(null, 'system_alert');

  const notification: NotificationInsert = {
    user_id: userId,
    title,
    message,
    read: false,
    template_id: templateId,
    notification_type: 'system',
    priority: 'low',
    metadata: {
      system_message: message
    }
  }

  return createNotification(notification)
}

// Batch create notifications for multiple users
export async function createBatchNotifications(
  userIds: string[],
  title: string,
  message: string
) {
  const templateId = await ensureTemplateId(null, 'system_alert');
  
  const notifications = userIds.map(userId => ({
    user_id: userId,
    title,
    message,
    read: false,
    template_id: templateId,
    notification_type: 'system',
    priority: 'low',
    metadata: {
      batch_message: message
    }
  }))

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) throw error
    return data
  } catch (error) {
    safeLog.error('Error creating batch notifications:', error)
    throw error
  }
}

// Get upcoming appointments that need reminders
export async function getUpcomingAppointmentsForReminders() {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      doctor_id,
      date,
      start_time,
      status,
      doctor:doctors(full_name),
      patient:patients(full_name)
    `)
    .eq('status', 'confirmed')
    .gte('date', now.toISOString().split('T')[0])
    .lte('date', dayAfterTomorrow.toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming appointments:', error)
    return []
  }

  return data || []
}

// Create scheduled reminders for upcoming appointments
export async function createScheduledReminders() {
  const upcomingAppointments = await getUpcomingAppointmentsForReminders()
  const now = new Date()

  for (const appointment of upcomingAppointments) {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`)
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Send reminder if appointment is within 24 hours and we haven't sent one recently
    if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 0) {
      try {
        const doctorName = (appointment.doctor as any)?.full_name || 'your doctor'
        await createAppointmentReminderNotification(
          appointment.patient_id,
          doctorName,
          appointment.date,
          appointment.start_time,
          Math.floor(hoursUntilAppointment)
        )
      } catch (error) {
        console.error(`Failed to create reminder for appointment ${appointment.id}:`, error)
      }
    }
  }
} 