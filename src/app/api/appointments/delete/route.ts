import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Force this API route to be dynamic
export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentIds = searchParams.get('ids')

    if (!appointmentIds) {
      return NextResponse.json(
        { error: 'Appointment IDs are required' },
        { status: 400 }
      )
    }

    const ids = appointmentIds.split(',')

    // Rely on RLS by scoping delete to patient_id = auth.uid()
    const result = await supabase
      .from('appointments')
      .delete()
      .in('id', ids)
      .eq('patient_id', user.id)
      .select()

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to delete appointments', details: result.error.message, code: result.error.code },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, deletedCount: result.data?.length || 0, deletedAppointments: result.data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 