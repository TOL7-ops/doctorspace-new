import { Inter } from 'next/font/google'
import { createServerSupabase } from '@/lib/supabase-server'
import { DashboardHeader } from './DashboardHeader'
import { BottomNavigation } from './BottomNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DoctorSpace - Dashboard',
  description: 'Your healthcare management platform',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabase()
  await supabase.auth.getUser()

  return (
    <div className={`${inter.className} min-h-screen bg-background`}>
      <DashboardHeader />
      <div className="pb-20 pt-16">
        {children}
      </div>
      <BottomNavigation />
    </div>
  )
}
