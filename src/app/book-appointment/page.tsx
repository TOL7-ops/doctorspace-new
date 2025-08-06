'use client';

import { useState, useRef } from 'react';
import { BookingForm } from '@/components/BookingForm';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { createAppointmentNotification } from '@/lib/notifications';

export default function BookAppointment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAppointmentSubmit = async (data: {
    doctorId: string;
    appointmentTypeId: string;
    date: string;
    startTime: string;
    notes?: string;
  }) => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        toast.error('Authentication error. Please sign in again.');
        router.push('/login');
        return;
      }
      if (!user) {
        toast.error('Please sign in to book an appointment');
        router.push('/login');
        return;
      }

      // Get doctor information for notification
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('full_name')
        .eq('id', data.doctorId)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor info:', doctorError);
      }

      // Create the appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: data.doctorId,
          appointment_type_id: data.appointmentTypeId,
          date: data.date,
          start_time: data.startTime,
          notes: data.notes,
          status: 'pending'
        });

      if (appointmentError) {
        if (appointmentError.code === '23505') { // Unique violation
          toast.error('You already have an appointment at this time');
        } else {
          toast.error('Failed to book appointment. Please try again.');
        }
        return;
      }

      // Create notification for the appointment (only on client side)
      if (typeof window !== 'undefined') {
        try {
          await createAppointmentNotification(
            user.id,
            doctorData?.full_name || 'Your doctor',
            data.date,
            data.startTime
          );
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Don't fail the appointment booking if notification fails
        }
      }

      toast.success('Appointment booked successfully!');
      // Play notification sound (with fallback)
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      router.push('/dashboard/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card shadow-sm rounded-lg border border-border">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Book an Appointment
            </h2>
            <BookingForm
              onSubmit={handleAppointmentSubmit}
              isLoading={loading}
            />
            {/* Notification sound (hidden) */}
            <audio
              ref={audioRef}
              src="/notification.mp3"
              preload="auto"
              style={{ display: 'none' }}
              onError={() => toast('🔔 (Notification sound not supported in this browser)', { icon: '🔕' })}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 