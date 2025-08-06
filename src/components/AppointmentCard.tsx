'use client';

import { format } from 'date-fns';
import { Appointment, Doctor, AppointmentType } from '@/types';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface AppointmentCardProps {
  appointment: Appointment;
  doctor: Doctor;
  appointmentType: AppointmentType;
  onStatusChange?: (appointmentId: string, status: Appointment['status']) => void;
  isAdmin?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const statusIcons = {
  pending: ClockIcon,
  confirmed: CheckCircleIcon,
  cancelled: XCircleIcon,
  completed: CheckCircleIcon,
};

export const AppointmentCard = ({
  appointment,
  doctor,
  appointmentType,
  onStatusChange,
  isAdmin = false,
}: AppointmentCardProps) => {
  const StatusIcon = statusIcons[appointment.status];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {appointmentType.name}
          </h3>
          <p className="text-gray-600">with Dr. {doctor.full_name}</p>
        </div>
        <div className={`px-3 py-1 rounded-full ${statusColors[appointment.status]}`}>
          <div className="flex items-center">
            <StatusIcon className="w-4 h-4 mr-1" />
            <span className="capitalize">{appointment.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-gray-700">
            {format(new Date(appointment.date), 'MMMM d, yyyy')}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Time</p>
          <p className="text-gray-700">
            {format(new Date(`2000-01-01T${appointment.start_time}`), 'h:mm a')}
          </p>
        </div>
      </div>

      {appointment.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-gray-700">{appointment.notes}</p>
        </div>
      )}

      {isAdmin && onStatusChange && appointment.status === 'pending' && (
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onStatusChange(appointment.id, 'confirmed')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Confirm
          </button>
          <button
            onClick={() => onStatusChange(appointment.id, 'cancelled')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}; 