"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ClockIcon, UserIcon, X, Calendar, Star, Download, RefreshCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { cancelAppointment, rescheduleAppointment, submitRating } from '@/lib/appointment-management'
import { createAppointmentNotification, createNotification } from '@/lib/notifications'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { RescheduleModal } from '@/components/RescheduleModal'
import { RatingModal } from '@/components/RatingModal'

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_type_id: string
  date: string
  start_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  created_at?: string
  updated_at?: string
  doctor?: {
    id: string
    full_name: string
    specialization: string
    qualification?: string
    years_of_experience?: number
    available_days?: string[]
    available_hours?: string[]
    image_url?: string
    created_at?: string
    updated_at?: string
  }
  appointment_type?: {
    id: string
    name: string
    duration: number
    description: string
    created_at?: string
    updated_at?: string
  }
}

interface AppointmentsClientProps {
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  cancelledAppointments: Appointment[]
}

type TabType = 'upcoming' | 'past' | 'cancelled'

export default function AppointmentsClient({ 
  upcomingAppointments, 
  pastAppointments,
  cancelledAppointments
}: AppointmentsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [localAppointments, setLocalAppointments] = useState({
    upcoming: upcomingAppointments,
    past: pastAppointments,
    cancelled: cancelledAppointments
  })
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; appointment: Appointment | null }>({ isOpen: false, appointment: null })
  const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean; appointment: Appointment | null }>({ isOpen: false, appointment: null })
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; appointment: Appointment | null }>({ isOpen: false, appointment: null })
  const [clearHistoryModal, setClearHistoryModal] = useState<{ isOpen: boolean; tab: TabType | null }>({ isOpen: false, tab: null })
  const [rebookModal, setRebookModal] = useState<{ isOpen: boolean; appointment: Appointment | null }>({ isOpen: false, appointment: null })

  // Update local appointments when props change
  useEffect(() => {
    setLocalAppointments({
      upcoming: upcomingAppointments,
      past: pastAppointments,
      cancelled: cancelledAppointments
    })
  }, [upcomingAppointments, pastAppointments, cancelledAppointments])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'completed':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const handleCancelAppointment = async (reason?: string) => {
    if (!cancelModal.appointment) return

    setLoadingStates(prev => ({ ...prev, [`cancel-${cancelModal.appointment.id}`]: true }))

    try {
      console.log('🗑️ Cancelling appointment with notification...')
      await cancelAppointment({
        appointmentId: cancelModal.appointment.id,
        reason: reason || 'No reason provided'
      })

      // Update local state - move to cancelled tab
      const updatedAppointment = {
        ...cancelModal.appointment,
        status: 'cancelled' as const
      }

      setLocalAppointments(prev => ({
        upcoming: prev.upcoming.filter(a => a.id !== cancelModal.appointment!.id),
        past: prev.past.filter(a => a.id !== cancelModal.appointment!.id),
        cancelled: [updatedAppointment, ...prev.cancelled]
      }))

      toast.success('Appointment cancelled successfully')
      setCancelModal({ isOpen: false, appointment: null })
      
      // Force page refresh to update notifications
      router.refresh()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel appointment')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`cancel-${cancelModal.appointment!.id}`]: false }))
    }
  }

  const handleRescheduleAppointment = async (newDate: string, newTime: string, reason?: string) => {
    if (!rescheduleModal.appointment) return

    setLoadingStates(prev => ({ ...prev, [`reschedule-${rescheduleModal.appointment.id}`]: true }))

    try {
      console.log('📅 Rescheduling appointment with notification...')
      await rescheduleAppointment({
        appointmentId: rescheduleModal.appointment.id,
        newDate,
        newTime,
        reason
      })

      // Update local state
      const updatedAppointment = {
        ...rescheduleModal.appointment,
        date: newDate,
        start_time: newTime
      }

      setLocalAppointments(prev => ({
        upcoming: prev.upcoming.map(a => 
          a.id === rescheduleModal.appointment!.id ? updatedAppointment : a
        ),
        past: prev.past,
        cancelled: prev.cancelled
      }))

      toast.success('Appointment rescheduled successfully')
      setRescheduleModal({ isOpen: false, appointment: null })
      
      // Force page refresh to update notifications
      router.refresh()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule appointment')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`reschedule-${rescheduleModal.appointment!.id}`]: false }))
    }
  }

  const handleSubmitRating = async (rating: number, comment?: string) => {
    if (!ratingModal.appointment) return

    setLoadingStates(prev => ({ ...prev, [`rating-${ratingModal.appointment.id}`]: true }))

    try {
      await submitRating({
        appointmentId: ratingModal.appointment.id,
        patientId: ratingModal.appointment.patient_id,
        doctorId: ratingModal.appointment.doctor_id,
        rating,
        comment
      })

      toast.success('Rating submitted successfully')
      setRatingModal({ isOpen: false, appointment: null })
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit rating')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`rating-${ratingModal.appointment!.id}`]: false }))
    }
  }

  const handleClearHistory = async () => {
    if (!clearHistoryModal.tab) return

    setLoadingStates(prev => ({ ...prev, [`clear-${clearHistoryModal.tab}`]: true }))

    try {
      const appointmentsToDelete = localAppointments[clearHistoryModal.tab]
      const appointmentIds = appointmentsToDelete.map(a => a.id)

      console.log(`🗑️ Deleting ${appointmentIds.length} appointments:`, appointmentIds)

      // Test with single appointment first if there are multiple
      if (appointmentIds.length > 1) {
        console.log('🧪 Testing with single appointment first...')
        
        // Get current user ID for test
        const { data: { user: testUser } } = await supabase.auth.getUser()
        if (!testUser) {
          throw new Error('User not authenticated for test')
        }

        const testResponse = await fetch(`/api/appointments/delete?ids=${appointmentIds[0]}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUser.id}`,
            'x-user-id': testUser.id
          }
        })

        const testResult = await testResponse.json()
        console.log('🧪 Single appointment test result:', testResult)

        if (!testResponse.ok) {
          throw new Error(`Single appointment test failed: ${testResult.error}`)
        }
      }

          // Delete appointments using API endpoint (bypasses RLS issues)
    console.log('🔍 Attempting to delete appointments via API...')
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`/api/appointments/delete?ids=${appointmentIds.join(',')}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`,
        'x-user-id': user.id
      }
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ API deletion error:', result)
      throw new Error(result.error || 'Failed to delete appointments')
    }

    console.log('✅ Appointments deleted via API successfully')
    console.log('📊 Deletion result:', result)

    // Create notification for clearing appointments
    if (typeof window !== 'undefined') {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          const notificationTitle = clearHistoryModal.tab === 'cancelled' 
            ? 'Cancelled Appointments Cleared'
            : 'Past Appointments Cleared';
          
          const notificationMessage = clearHistoryModal.tab === 'cancelled'
            ? `Successfully cleared ${appointmentIds.length} cancelled appointment${appointmentIds.length > 1 ? 's' : ''} from your history.`
            : `Successfully cleared ${appointmentIds.length} past appointment${appointmentIds.length > 1 ? 's' : ''} from your history.`;

          await createNotification({
            user_id: currentUser.id,
            title: notificationTitle,
            message: notificationMessage,
            template_id: `clear_${clearHistoryModal.tab}_success`,
            notification_type: 'system_alert',
            priority: 'medium'
          });
          console.log(`✅ Clear ${clearHistoryModal.tab} notification created successfully`);
        }
      } catch (notificationError) {
        console.error(`Error creating clear ${clearHistoryModal.tab} notification:`, notificationError);
        // Don&apos;t fail the clearing if notification fails
      }
    }

    // Update local state
    setLocalAppointments(prev => ({
      ...prev,
      [clearHistoryModal.tab]: []
    }))

    toast.success(`${clearHistoryModal.tab} appointments cleared successfully`)
    setClearHistoryModal({ isOpen: false, tab: null })

    // Force page refresh to ensure server-side data is updated
    router.refresh()
    } catch (error) {
      console.error('Error clearing appointments:', error)
      toast.error('Failed to clear appointments')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`clear-${clearHistoryModal.tab!}`]: false }))
    }
  }

  const handleRebookAppointment = async () => {
    if (!rebookModal.appointment) return

    try {
      console.log('🔄 Rebooking appointment with notification...')
      
      // Create a new appointment with the same details
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: rebookModal.appointment.patient_id,
          doctor_id: rebookModal.appointment.doctor_id,
          appointment_type_id: rebookModal.appointment.appointment_type_id,
          date: rebookModal.appointment.date,
          start_time: rebookModal.appointment.start_time,
          status: 'pending',
          notes: `Rebooked from appointment ${rebookModal.appointment.id}`
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for the rebooked appointment
      if (typeof window !== 'undefined') {
        try {
          await createAppointmentNotification(
            rebookModal.appointment.patient_id,
            rebookModal.appointment.doctor?.full_name || 'Your doctor',
            rebookModal.appointment.date,
            rebookModal.appointment.start_time,
            data.id
          );
          console.log('✅ Rebook notification created successfully');
        } catch (notificationError) {
          console.error('Error creating rebook notification:', notificationError);
          // Don&apos;t fail the rebooking if notification fails
        }
      }

      // Add to upcoming appointments
      const newAppointment = {
        ...data,
        doctor: rebookModal.appointment.doctor,
        appointment_type: rebookModal.appointment.appointment_type
      }

      setLocalAppointments(prev => ({
        ...prev,
        upcoming: [newAppointment, ...prev.upcoming]
      }))

      toast.success('Appointment rebooked successfully')
      setRebookModal({ isOpen: false, appointment: null })
      
      // Force page refresh to update notifications
      router.refresh()
    } catch (error) {
      console.error('Error rebooking appointment:', error)
      toast.error('Failed to rebook appointment')
    }
  }

  const handleDownloadReceipt = async (appointment: Appointment) => {
    try {
      const receiptData = {
        appointmentId: appointment.id,
        patientName: 'Patient Name', // You can get this from user profile
        doctorName: appointment.doctor?.full_name || 'Unknown Doctor',
        date: formatDate(appointment.date),
        time: formatTime(appointment.start_time),
        type: appointment.appointment_type?.name || 'General Consultation',
        status: appointment.status,
        notes: appointment.notes || 'No additional notes'
      }

      // Create receipt content
      const receiptContent = `
        DOCTORSPACE - APPOINTMENT RECEIPT
        
        Appointment ID: ${receiptData.appointmentId}
        Date: ${receiptData.date}
        Time: ${receiptData.time}
        Doctor: ${receiptData.doctorName}
        Type: ${receiptData.type}
        Status: ${receiptData.status}
        
        Notes: ${receiptData.notes}
        
        Generated on: ${new Date().toLocaleString()}
      `

      // Create and download file
      const blob = new Blob([receiptContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `appointment-${appointment.id}-receipt.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Receipt downloaded successfully')
    } catch (error) {
      console.error('Error downloading receipt:', error)
      toast.error('Failed to download receipt')
    }
  }

  // const canModify = async (appointment: Appointment) => {
  //   try {
  //     return await canModifyAppointment(appointment.id)
  //   } catch (error) {
  //     console.error('Error checking if appointment can be modified:', error)
  //     return false
  //   }
  // }

  const getCurrentAppointments = () => {
    return localAppointments[activeTab]
  }

  const getTabCount = (tab: TabType) => {
    return localAppointments[tab].length
  }

  const canShowActions = (appointment: Appointment) => {
    if (activeTab === 'upcoming') {
      return appointment.status === 'pending' || appointment.status === 'confirmed'
    }
    if (activeTab === 'past') {
      return appointment.status === 'completed'
    }
    if (activeTab === 'cancelled') {
      return true // Can rebook cancelled appointments
    }
    return false
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground">
          Manage your upcoming, past, and cancelled appointments
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('upcoming')}
          className="flex-1"
          aria-label="View upcoming appointments"
        >
          Upcoming ({getTabCount('upcoming')})
        </Button>
        <Button
          variant={activeTab === 'past' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('past')}
          className="flex-1"
          aria-label="View past appointments"
        >
          Past ({getTabCount('past')})
        </Button>
        <Button
          variant={activeTab === 'cancelled' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('cancelled')}
          className="flex-1"
          aria-label="View cancelled appointments"
        >
          Cancelled ({getTabCount('cancelled')})
        </Button>
      </div>

      {/* Clear History Button */}
      {(activeTab === 'past' || activeTab === 'cancelled') && getTabCount(activeTab) > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearHistoryModal({ isOpen: true, tab: activeTab })}
            disabled={loadingStates[`clear-${activeTab}`]}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear {activeTab === 'past' ? 'History' : 'Cancelled'}
          </Button>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {getCurrentAppointments().length > 0 ? (
          getCurrentAppointments().map((appointment) => (
            <Card key={appointment.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {appointment.doctor?.full_name || 'Unknown Doctor'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor?.specialization || 'General'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant={getStatusVariant(appointment.status)}
                      className={cn("capitalize", getStatusColor(appointment.status))}
                    >
                      {appointment.status}
                    </Badge>
                    
                    {/* Action buttons - Mobile responsive with flex-wrap */}
                    {canShowActions(appointment) && (
                      <div className="flex flex-wrap gap-2">
                        {/* Reschedule button for upcoming appointments */}
                        {activeTab === 'upcoming' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRescheduleModal({ isOpen: true, appointment })}
                            disabled={loadingStates[`reschedule-${appointment.id}`]}
                            className="text-xs flex-shrink-0"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Reschedule
                          </Button>
                        )}

                        {/* Cancel button for upcoming appointments */}
                        {activeTab === 'upcoming' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCancelModal({ isOpen: true, appointment })}
                            disabled={loadingStates[`cancel-${appointment.id}`]}
                            className="text-xs flex-shrink-0"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}

                        {/* Rate button for completed appointments */}
                        {activeTab === 'past' && appointment.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRatingModal({ isOpen: true, appointment })}
                            disabled={loadingStates[`rating-${appointment.id}`]}
                            className="text-xs flex-shrink-0"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Rate
                          </Button>
                        )}

                        {/* Rebook button for cancelled appointments */}
                        {activeTab === 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRebookModal({ isOpen: true, appointment })}
                            className="text-xs flex-shrink-0"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Rebook
                          </Button>
                        )}

                        {/* Download receipt button for all appointments */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(appointment)}
                          className="text-xs flex-shrink-0"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(appointment.start_time)}</span>
                  </div>
                </div>
                
                {appointment.appointment_type && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">
                      {appointment.appointment_type.name}
                    </Badge>
                  </div>
                )}

                {appointment.notes && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Notes:</span> {appointment.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  No {activeTab} appointments
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === 'upcoming' 
                    ? "You don&apos;t have any upcoming appointments scheduled."
                    : activeTab === 'past'
                    ? "You don&apos;t have any past appointments."
                    : "You don&apos;t have any cancelled appointments."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, appointment: null })}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment"
        description={`Are you sure you want to cancel your appointment with Dr. ${cancelModal.appointment?.doctor?.full_name} on ${cancelModal.appointment ? formatDate(cancelModal.appointment.date) : ''}?`}
        confirmText="Cancel Appointment"
        variant="destructive"
        showReasonInput={true}
        reasonLabel="Cancellation Reason"
        reasonPlaceholder="Please provide a reason for cancellation..."
        isLoading={loadingStates[`cancel-${cancelModal.appointment?.id || ''}`]}
      />

      {/* Reschedule Modal */}
      {rescheduleModal.appointment && (
        <RescheduleModal
          isOpen={rescheduleModal.isOpen}
          onClose={() => setRescheduleModal({ isOpen: false, appointment: null })}
          onReschedule={handleRescheduleAppointment}
          appointment={rescheduleModal.appointment}
          isLoading={loadingStates[`reschedule-${rescheduleModal.appointment.id}`]}
        />
      )}

      {/* Rating Modal */}
      {ratingModal.appointment && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal({ isOpen: false, appointment: null })}
          onSubmit={handleSubmitRating}
          doctorName={ratingModal.appointment.doctor?.full_name || 'Unknown Doctor'}
          isLoading={loadingStates[`rating-${ratingModal.appointment.id}`]}
        />
      )}

      {/* Clear History Confirmation Modal */}
      <ConfirmationModal
        isOpen={clearHistoryModal.isOpen}
        onClose={() => setClearHistoryModal({ isOpen: false, tab: null })}
        onConfirm={handleClearHistory}
        title={`Clear ${clearHistoryModal.tab === 'past' ? 'History' : 'Cancelled'} Appointments`}
        description={`Are you sure you want to permanently delete all ${clearHistoryModal.tab} appointments? This action cannot be undone.`}
        confirmText={`Clear ${clearHistoryModal.tab === 'past' ? 'History' : 'Cancelled'}`}
        variant="destructive"
        isLoading={loadingStates[`clear-${clearHistoryModal.tab || ''}`]}
      />

      {/* Rebook Confirmation Modal */}
      <ConfirmationModal
        isOpen={rebookModal.isOpen}
        onClose={() => setRebookModal({ isOpen: false, appointment: null })}
        onConfirm={handleRebookAppointment}
        title="Rebook Appointment"
        description={`Are you sure you want to rebook your appointment with Dr. ${rebookModal.appointment?.doctor?.full_name}? This will create a new pending appointment.`}
        confirmText="Rebook Appointment"
        variant="default"
      />
    </div>
  )
} 