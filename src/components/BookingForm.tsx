'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
}

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  description: string;
}

interface BookingFormProps {
  onSubmit: (data: {
    doctorId: string;
    appointmentTypeId: string;
    date: string;
    startTime: string;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function BookingForm({ onSubmit, isLoading = false }: BookingFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('id, full_name, specialization')
          .order('full_name');

        if (doctorsError) throw doctorsError;
        setDoctors(doctorsData || []);

        // Fetch appointment types
        const { data: typesData, error: typesError } = await supabase
          .from('appointment_types')
          .select('*')
          .order('duration');

        if (typesError) throw typesError;
        setAppointmentTypes(typesData || []);
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Generate dates for the next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return format(date, 'yyyy-MM-dd');
  });

  // Default time slots (9 AM to 5 PM)
  const defaultTimeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      await onSubmit({
        doctorId: selectedDoctor,
        appointmentTypeId: selectedType,
        date: selectedDate,
        startTime: selectedTime,
        notes: notes.trim() || undefined,
      });

      // Reset form on success
      setSelectedDoctor('');
      setSelectedType('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="doctor" className="block text-sm font-medium text-foreground">
          Select Doctor
        </label>
        <select
          id="doctor"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          required
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Choose a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name} - {doctor.specialization}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="appointmentType" className="block text-sm font-medium text-foreground">
          Appointment Type
        </label>
        <select
          id="appointmentType"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          required
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select type</option>
          {appointmentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.duration} minutes)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-foreground">
          Date
        </label>
        <select
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
        <label htmlFor="time" className="block text-sm font-medium text-foreground">
          Time
        </label>
        <select
          id="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select time</option>
          {defaultTimeSlots.map((time) => (
            <option key={time} value={time}>
              {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          rows={3}
          className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Any additional information..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
} 