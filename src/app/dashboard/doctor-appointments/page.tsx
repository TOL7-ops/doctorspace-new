"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import { Calendar, Clock, Check, X, CalendarDays } from "lucide-react"

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

interface PatientProfile {
  id: string
  full_name?: string | null
  date_of_birth?: string | null
}

export default function DoctorAppointmentsPage() {
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'past'>('pending')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Record<string, PatientProfile>>({})
  const [loading, setLoading] = useState(true)

  // Resolve current doctor id from auth
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setDoctorId(user.id)
    })()
  }, [])

  // Fetch appointments based on filter
  useEffect(() => {
    if (!doctorId) return
    let isCancelled = false

    const run = async () => {
      try {
        setLoading(true)
        let query = supabase.from('appointments').select('*').eq('doctor_id', doctorId)
        if (filter === 'pending') query = query.eq('status', 'pending')
        else if (filter === 'confirmed') query = query.eq('status', 'confirmed')
        else if (filter === 'past') query = query.in('status', ['completed','cancelled','declined'])

        const { data, error } = await query.order('created_at', { ascending: false })
        if (error) throw error
        if (!isCancelled) setAppointments(data || [])

        // Fetch minimal patient info
        const patientIds = Array.from(new Set((data || []).map(a => a.patient_id))).filter(Boolean)
        if (patientIds.length) {
          const { data: profiles } = await supabase
            .from('patients')
            .select('id, full_name, date_of_birth')
            .in('id', patientIds)
          const map: Record<string, PatientProfile> = {}
          ;(profiles || []).forEach(p => { map[p.id] = p })
          if (!isCancelled) setPatients(map)
        } else {
          if (!isCancelled) setPatients({})
        }
      } catch (err) {
        console.error('Failed to fetch appointments', err)
        toast.error('Failed to load appointments')
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    run()
    return () => { isCancelled = true }
  }, [doctorId, filter])

  // Real-time updates for the doctor
  useEffect(() => {
    if (!doctorId) return
    const channel = supabase
      .channel('doctor-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${doctorId}` }, (payload) => {
        setAppointments(prev => {
          if (payload.eventType === 'INSERT') return [payload.new as Appointment, ...prev]
          if (payload.eventType === 'UPDATE') return prev.map(a => a.id === (payload.new as Appointment).id ? payload.new as Appointment : a)
          if (payload.eventType === 'DELETE') return prev.filter(a => a.id !== (payload.old as Appointment).id)
          return prev
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [doctorId])

  const ageFromDOB = (dob?: string | null) => {
    if (!dob) return undefined
    const birth = new Date(dob)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
    return age
  }

  const updateStatus = async (id: string, next: Appointment['status']) => {
    // optimistic
    const prev = appointments
    setAppointments(a => a.map(x => x.id === id ? { ...x, status: next } : x))
    try {
      const { error } = await supabase.from('appointments').update({ status: next }).eq('id', id)
      if (error) throw error
      toast.success(`Appointment ${next}`)
    } catch (err) {
      setAppointments(prev)
      console.error('Failed to update status', err)
      toast.error('Update failed')
    }
  }

  const reschedule = async (id: string) => {
    // Demo: push a day; in real UI, open a date/time picker
    const appt = appointments.find(a => a.id === id)
    if (!appt) return
    const nextDate = new Date(appt.date)
    nextDate.setDate(nextDate.getDate() + 1)
    const iso = nextDate.toISOString().slice(0,10)
    const prev = appointments
    setAppointments(a => a.map(x => x.id === id ? { ...x, date: iso } : x))
    try {
      const { error } = await supabase.from('appointments').update({ date: iso }).eq('id', id)
      if (error) throw error
      toast.success('Rescheduled')
    } catch (err) {
      console.error('Reschedule failed', err)
      setAppointments(prev)
      toast.error('Reschedule failed')
    }
  }

  const filtered = appointments.filter(a => {
    if (filter === 'pending') return a.status === 'pending'
    if (filter === 'confirmed') return a.status === 'confirmed'
    return ['completed','cancelled','declined'].includes(a.status)
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg sticky top-16 z-30">
          <Button variant={filter === 'pending' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setFilter('pending')} aria-label="Pending">Pending</Button>
          <Button variant={filter === 'confirmed' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setFilter('confirmed')} aria-label="Confirmed">Confirmed</Button>
          <Button variant={filter === 'past' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setFilter('past')} aria-label="Past">Past</Button>
        </div>

        {/* Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(appt => {
            const p = patients[appt.patient_id]
            const age = ageFromDOB(p?.date_of_birth)
            const initials = (p?.full_name || 'Patient').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()
            return (
              <Card key={appt.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p?.full_name || 'Unknown Patient'}{age !== undefined ? ` · ${age}` : ''}</p>
                      <p className="text-xs text-muted-foreground truncate">Reason: {appt.reason || '—'}</p>
                    </div>
                  </div>
                  <Badge variant={appt.status === 'pending' ? 'secondary' : appt.status === 'confirmed' ? 'default' : 'outline'} className="capitalize">{appt.status}</Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {appt.date}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {appt.start_time}</div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {appt.status === 'pending' && (
                    <Button size="sm" onClick={() => updateStatus(appt.id, 'confirmed')} aria-label="Accept appointment"><Check className="h-4 w-4 mr-1" /> Accept</Button>
                  )}
                  {appt.status === 'pending' && (
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(appt.id, 'declined')} aria-label="Decline appointment"><X className="h-4 w-4 mr-1" /> Decline</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => reschedule(appt.id)} aria-label="Reschedule appointment"><CalendarDays className="h-4 w-4 mr-1" /> Reschedule</Button>
                </div>
              </Card>
            )
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-12">No appointments found.</div>
        )}
      </div>
    </main>
  )
} 