'use client';

import { useState } from 'react';
import { Appointment, Doctor, AppointmentType, Patient } from '@/types';
import { AppointmentCard } from './AppointmentCard';

interface AdminAppointmentsViewProps {
  appointments: (Appointment & {
    doctor: Doctor;
    patient: Patient;
    appointmentType: AppointmentType;
  })[];
  onStatusChange: (appointmentId: string, status: Appointment['status']) => void;
}

export const AdminAppointmentsView = ({
  appointments,
  onStatusChange,
}: AdminAppointmentsViewProps) => {
  const [filter, setFilter] = useState<Appointment['status'] | 'all'>('all');

  const filteredAppointments = appointments.filter((appointment) =>
    filter === 'all' ? true : appointment.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Appointment['status'] | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="col-span-1">
            <AppointmentCard
              appointment={appointment}
              doctor={appointment.doctor}
              appointmentType={appointment.appointmentType}
              onStatusChange={onStatusChange}
              isAdmin={true}
            />
            <div className="mt-2 text-sm text-gray-600">
              <p>Patient: {appointment.patient.full_name}</p>
              <p>Phone: {appointment.patient.phone_number}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  );
}; 