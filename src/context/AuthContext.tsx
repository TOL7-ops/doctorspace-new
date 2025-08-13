'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  full_name?: string | null
  role?: string | null
  avatar_url?: string | null
}

interface AuthContextValue {
  user: { id: string; email?: string | null } | null
  profile: Profile | null
  role: string | null
  pendingAppointmentsCount: number
  loading: boolean
  signOut: () => Promise<{ error: null } | { error: { message: string } }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Fetch profile from Supabase (patients is the single source of truth)
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching patient profile:', error)
        return
      }

      setProfile(data as Profile)
      setRole((data as Profile)?.role ?? null)
    } catch (err) {
      console.error('Unexpected error fetching patient profile:', err)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const sUser = session?.user
        setUser(sUser ? { id: sUser.id, email: sUser.email } : null)
        if (sUser) {
          await fetchUserProfile(sUser.id)
        }
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sUser = session?.user
      setUser(sUser ? { id: sUser.id, email: sUser.email } : null)
      if (sUser) {
        await fetchUserProfile(sUser.id)
      } else {
        setProfile(null)
        setRole(null)
        setPendingAppointmentsCount(0)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Track pending appointment requests for doctors
  useEffect(() => {
    if (!user || role !== 'doctor') return

    let cancelled = false

    const fetchPending = async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('status', 'pending')
      if (!cancelled) setPendingAppointmentsCount(error ? 0 : (count || 0))
    }

    fetchPending()

    const channel = supabase
      .channel('authctx-doctor-pending')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${user.id}` }, async () => {
        await fetchPending()
      })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [user, role])

  const value: AuthContextValue = {
    user,
    profile, // contains role
    role,
    pendingAppointmentsCount,
    loading,
    signOut: () => supabase.auth.signOut() as unknown as Promise<{ error: null } | { error: { message: string } }>,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
} 