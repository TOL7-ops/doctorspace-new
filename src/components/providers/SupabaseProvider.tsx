'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { PropsWithChildren } from 'react'

export default function SupabaseProvider({
  children,
  session,
}: PropsWithChildren<{
  session: Session | null
}>) {
  const supabase = createClientComponentClient()

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={session}
    >
      {children}
    </SessionContextProvider>
  )
} 