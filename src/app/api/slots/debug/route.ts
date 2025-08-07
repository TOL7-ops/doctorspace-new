import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId') || '550e8400-e29b-41d4-a716-446655440104';
    const date = searchParams.get('date') || '2025-08-09';

    const supabase = createServerSupabase();

    // Check if doctor exists
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single();

    // Check appointments for this doctor and date
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*, appointment_types(*)')
      .eq('doctor_id', doctorId)
      .eq('date', date);

    // Check all doctors
    const { data: allDoctors, error: allDoctorsError } = await supabase
      .from('doctors')
      .select('id, full_name, available_hours')
      .limit(5);

    return NextResponse.json({
      debug: true,
      params: { doctorId, date },
      doctor: {
        data: doctor,
        error: doctorError
      },
      appointments: {
        data: appointments,
        error: appointmentsError,
        count: appointments?.length || 0
      },
      allDoctors: {
        data: allDoctors,
        error: allDoctorsError,
        count: allDoctors?.length || 0
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 