'use client'

import { getCurrentUserClient as getCurrentUserImpl } from './users';

export async function getCurrentUser() {
  return getCurrentUserImpl();
}

export { getUpcomingAppointments, getPastAppointments, getMessages, getTopDoctors, getPromotions, updateAppointmentStatus, markMessageAsRead } from './users';