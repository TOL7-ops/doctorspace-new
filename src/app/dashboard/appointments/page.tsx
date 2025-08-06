import { Suspense } from 'react'
import { getCurrentUserServer, getUpcomingAppointmentsServer, getPastAppointmentsServer, getCancelledAppointmentsServer } from '@/lib/server-queries'
import { redirect } from 'next/navigation'
import AppointmentsClient from './AppointmentsClient'
import { Skeleton } from '@/components/ui/skeleton'

function AppointmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}

export default async function AppointmentsPage() {
  const user = await getCurrentUserServer()
  if (!user) redirect('/login')
  
  const [upcomingAppointments, pastAppointments, cancelledAppointments] = await Promise.all([
    getUpcomingAppointmentsServer(user.id),
    getPastAppointmentsServer(user.id),
    getCancelledAppointmentsServer(user.id),
  ])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Suspense fallback={<AppointmentsSkeleton />}>
          <AppointmentsClient
            upcomingAppointments={upcomingAppointments}
            pastAppointments={pastAppointments}
            cancelledAppointments={cancelledAppointments}
          />
        </Suspense>
      </div>
    </main>
  )
} 