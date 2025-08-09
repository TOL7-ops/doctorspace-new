"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  date: string
  start_time: string
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
  reason?: string | null
  created_at?: string
}

interface PatientProfile { id: string; full_name?: string | null }

export default function DoctorAppointmentRequestsPage() {
  const router = useRouter()
  const { user, role, loading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Record<string, PatientProfile>>({})
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    if (role !== 'doctor') { router.replace('/'); return }
  }, [user, role, loading, router])

  useEffect(() => {
    if (!user || role !== 'doctor') return
    let cancelled = false
    const run = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) { console.error(error); return }
      if (!cancelled) setAppointments(data || [])

      const ids = Array.from(new Set((data || []).map(a => a.patient_id))).filter(Boolean)
      if (ids.length) {
        const { data: profiles } = await supabase
          .from('patients')
          .select('id, full_name')
          .in('id', ids)
        const map: Record<string, PatientProfile> = {}
        ;(profiles || []).forEach(p => { map[p.id] = p })
        if (!cancelled) setPatients(map)
      } else {
        if (!cancelled) setPatients({})
      }
    }
    run()

    const channel = supabase
      .channel('doctor-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${user.id}` }, () => run())
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [user, role])

  const updateStatus = async (id: string, next: Appointment['status']) => {
    setBusy(id)
    const prev = appointments
    setAppointments(a => a.map(x => x.id === id ? { ...x, status: next } : x))
    try {
      const { error } = await supabase.from('appointments').update({ status: next }).eq('id', id)
      if (error) throw error
      toast.success(next === 'confirmed' ? 'Accepted' : 'Declined')
    } catch (err) {
      console.error(err)
      setAppointments(prev)
      toast.error('Action failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Appointment Requests</h1>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map(appt => {
            const p = patients[appt.patient_id]
            const initials = (p?.full_name || 'Patient').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()
            return (
              <Card key={appt.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p?.full_name || 'Unknown Patient'}</p>
                      <p className="text-xs text-muted-foreground truncate">Reason: {appt.reason || '—'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{appt.status}</Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {appt.date}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {appt.start_time}</div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" onClick={() => updateStatus(appt.id, 'confirmed')} disabled={busy === appt.id} aria-label="Accept"><Check className="h-4 w-4 mr-1" /> Accept</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(appt.id, 'declined')} disabled={busy === appt.id} aria-label="Decline"><X className="h-4 w-4 mr-1" /> Decline</Button>
                </div>
              </Card>
            )
          })}
        </div>
        {appointments.length === 0 && (
          <div className="text-center text-muted-foreground py-12">No pending requests.</div>
        )}
      </div>
    </main>
  )
} 