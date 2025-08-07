import DashboardLayout from '@/components/DashboardLayout'

export const metadata = {
  title: 'DoctorSpace - Dashboard',
  description: 'Your healthcare management platform',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
