'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onReschedule: (newDate: string, newTime: string, reason?: string) => Promise<void>
  appointment: {
    id: string
    date: string
    start_time: string
    doctor_id: string
    appointment_type_id: string
  }
  isLoading?: boolean
}

export function RescheduleModal({
  isOpen,
  onClose,
  onReschedule,
  appointment,
  isLoading = false
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [reason, setReason] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Generate dates for the next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return format(date, 'yyyy-MM-dd')
  })

  // Default time slots (9 AM to 5 PM)
  const defaultTimeSlots = useMemo(() => [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ], [])

  const fetchAvailableSlots = useCallback(async (date: string, doctorId: string) => {
    setLoadingSlots(true)
    try {
      // Get doctor's available hours
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('available_hours')
        .eq('id', doctorId)
        .single()

      if (doctorError) throw doctorError

      // Get existing appointments for this doctor on this date
      const { data: existingAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('start_time')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .neq('status', 'cancelled')

      if (appointmentsError) throw appointmentsError

      const bookedTimes = existingAppointments?.map(apt => apt.start_time) || []
      const availableHours = doctorData?.available_hours || defaultTimeSlots

      // Filter out booked times
      const available = availableHours.filter(time => !bookedTimes.includes(time))
      setAvailableSlots(available)
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setAvailableSlots(defaultTimeSlots)
    } finally {
      setLoadingSlots(false)
    }
  }, [defaultTimeSlots])

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('')
      setSelectedTime('')
      setReason('')
      setAvailableSlots([])
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedDate && appointment.doctor_id) {
      fetchAvailableSlots(selectedDate, appointment.doctor_id)
    } else {
      setAvailableSlots(defaultTimeSlots)
    }
  }, [selectedDate, appointment.doctor_id, fetchAvailableSlots, defaultTimeSlots])

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    try {
      await onReschedule(selectedDate, selectedTime, reason.trim() || undefined)
      onClose()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
    }
  }

  const canReschedule = selectedDate && selectedTime && !loadingSlots

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Choose a new date and time for your appointment with Dr. {appointment.doctor_id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="date">New Date</Label>
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            >
              <option value="">Select date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {format(new Date(date), 'MMMM d, yyyy')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="time">New Time</Label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || loadingSlots || !selectedDate}
            >
              <option value="">Select time</option>
              {loadingSlots ? (
                <option value="" disabled>Loading available slots...</option>
              ) : (
                availableSlots.map((time) => (
                  <option key={time} value={time}>
                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <Label htmlFor="reason">Reason for rescheduling (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!canReschedule || isLoading}
          >
            {isLoading ? 'Rescheduling...' : 'Reschedule Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 