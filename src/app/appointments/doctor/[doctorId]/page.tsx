'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, MapPin, Star, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { createAppointmentNotification } from '@/lib/notifications';
import Image from 'next/image';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification?: string;
  years_of_experience?: number;
  available_days?: string[];
  available_hours?: string[];
  image_url?: string;
  rating?: number;
  location?: string;
}

interface TimeSlot {
  date: string;
  start_time: string;
  is_available: boolean;
}

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  description: string;
}

export default function DoctorAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate dates for the next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return format(date, 'yyyy-MM-dd');
  });

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctorId]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctor details
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

      if (doctorError) {
        toast.error('Doctor not found');
        router.push('/dashboard');
        return;
      }

      setDoctor(doctorData);

      // Fetch appointment types
      const { data: typesData, error: typesError } = await supabase
        .from('appointment_types')
        .select('*')
        .order('duration');

      if (typesError) {
        console.error('Error fetching appointment types:', typesError);
      } else {
        setAppointmentTypes(typesData || []);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    try {
      setSlotsLoading(true);
      const response = await fetch(`/api/slots?doctorId=${doctorId}&date=${selectedDate}`);
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data);
      } else {
        console.error('Error fetching slots:', data.error);
        toast.error('Failed to load available time slots');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingLoading) return;

    if (!selectedType || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setBookingLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Please sign in to book an appointment');
        router.push('/login');
        return;
      }

      // Create the appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: doctorId,
          appointment_type_id: selectedType,
          date: selectedDate,
          start_time: selectedTime,
          notes: notes.trim() || undefined,
          status: 'pending'
        })
        .select()
        .single();

      if (appointmentError) {
        if (appointmentError.code === '23505') {
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
            doctor?.full_name || 'Your doctor',
            selectedDate,
            selectedTime,
            appointmentData?.id
          );
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Don&apos;t fail the appointment booking if notification fails
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
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-6 w-48" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Doctor not found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Book Appointment</h1>
          <p className="text-muted-foreground">Schedule your appointment with Dr. {doctor.full_name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                    {doctor.image_url ? (
                      <Image
                        src={doctor.image_url}
                        alt={`Dr. ${doctor.full_name}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">
                      Dr. {doctor.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialization}
                    </p>
                    {doctor.qualification && (
                      <p className="text-xs text-muted-foreground">
                        {doctor.qualification}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {doctor.years_of_experience && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{doctor.years_of_experience} years experience</span>
                    </div>
                  )}
                  
                  {doctor.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="truncate">{doctor.location}</span>
                    </div>
                  )}

                  {doctor.rating && (
                    <div className="flex items-center text-sm">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground">{doctor.rating}/5</span>
                    </div>
                  )}
                </div>

                {doctor.available_days && doctor.available_days.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Available Days:</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.available_days.slice(0, 3).map((day, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                        >
                          <Calendar className="mr-1 h-3 w-3" />
                          {day}
                        </span>
                      ))}
                      {doctor.available_days.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{doctor.available_days.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Appointment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookAppointment} className="space-y-6">
                  {/* Appointment Type */}
                  <div>
                    <label htmlFor="appointmentType" className="block text-sm font-medium text-foreground mb-2">
                      Appointment Type
                    </label>
                    <select
                      id="appointmentType"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      required
                      disabled={bookingLoading}
                      className="w-full rounded-md border border-input bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 p-3 transition-colors duration-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-900 dark:hover:bg-gray-800 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-white"
                    >
                      <option value="" className="bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400">Select appointment type</option>
                      {appointmentTypes.map((type) => (
                        <option key={type.id} value={type.id} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                          {type.name} ({type.duration} minutes)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                      Select Date
                    </label>
                    <select
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      disabled={bookingLoading}
                      className="w-full rounded-md border border-input bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 p-3 transition-colors duration-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-900 dark:hover:bg-gray-800 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-white"
                    >
                      <option value="" className="bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400">Choose a date</option>
                      {availableDates.map((date) => (
                        <option key={date} value={date} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Available Time Slots
                      </label>
                      {slotsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center space-y-2">
                            <Spinner size="md" className="text-primary" />
                            <p className="text-sm text-muted-foreground">Loading available slots...</p>
                          </div>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.start_time}
                              type="button"
                              variant={selectedTime === slot.start_time ? "default" : "outline"}
                              onClick={() => setSelectedTime(slot.start_time)}
                              disabled={bookingLoading}
                              className="h-10"
                            >
                              {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No available slots for this date. Please select another date.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={bookingLoading}
                      rows={3}
                      className="w-full rounded-md border border-input bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 p-3 transition-colors duration-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-900 dark:hover:bg-gray-800 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder="Any additional information or symptoms..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={bookingLoading || !selectedType || !selectedDate || !selectedTime}
                    className="w-full"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Notification sound (hidden) */}
        <audio
          ref={audioRef}
          src="/notification.mp3"
          preload="auto"
          style={{ display: 'none' }}
          onError={() => toast('🔔 (Notification sound not supported in this browser)', { icon: '🔕' })}
        />
      </div>
    </main>
  );
} 