import React, { useState } from 'react';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Appointment } from '@/types';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { cancelAppointment } from '@/lib/appointment-management';

interface NextAppointmentProps {
  appointment: Appointment;
}

export function NextAppointment({ appointment }: NextAppointmentProps) {
  const { doctor, start_time: time, date, status, id } = appointment;
  const [showReschedule, setShowReschedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!doctor) return null;

  // Real cancel action with notification
  const handleCancel = async () => {
    setLoading(true);
    try {
      console.log('🗑️ Cancelling appointment with notification...');
      await cancelAppointment({
        appointmentId: id,
        reason: 'Cancelled by patient'
      });
      toast.success('Appointment cancelled');
      router.refresh();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  // Real follow-up action (redirect to book-appointment with doctorId)
  const handleBookFollowUp = () => {
    router.push(`/book-appointment?doctorId=${doctor.id}`);
  };

  // Reschedule modal (simple inline for demo)
  const handleReschedule = () => setShowReschedule(true);
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Example: just close modal and show toast
    setTimeout(() => {
      setShowReschedule(false);
      setLoading(false);
      toast.success('Reschedule request sent!');
      router.refresh();
    }, 1000);
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold mb-4">Next Appointment</h2>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 relative rounded-full bg-gray-200 overflow-hidden">
            {doctor.image_url ? (
              <Image
                src={doctor.image_url}
                alt={doctor.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{doctor.full_name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
          </div>
          <span className="text-sm font-medium text-green-600 capitalize">
            {status}
          </span>
        </div>
        <div className="mt-4 flex space-x-6">
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-5 w-5 mr-2" />
            {time}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            {date}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={handleReschedule}
            disabled={loading}
          >
            Reschedule
          </button>
          <button
            className="w-full sm:w-auto bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="w-full sm:w-auto bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition"
            onClick={handleBookFollowUp}
            disabled={loading}
          >
            Book Follow-up
          </button>
        </div>
        {/* Reschedule Modal */}
        {showReschedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form
              onSubmit={handleRescheduleSubmit}
              className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm flex flex-col gap-4"
            >
              <h3 className="text-lg font-bold mb-2">Reschedule Appointment</h3>
              <label className="text-sm">New Date
                <input 
                  type="date" 
                  className="block w-full border border-input rounded px-2 py-1 mt-1 bg-white text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-900 dark:hover:bg-gray-800" 
                  required 
                />
              </label>
              <label className="text-sm">New Time
                <input 
                  type="time" 
                  className="block w-full border border-input rounded px-2 py-1 mt-1 bg-white text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-900 dark:hover:bg-gray-800" 
                  required 
                />
              </label>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-200 rounded py-2 font-medium"
                  onClick={() => setShowReschedule(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Rescheduling...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 