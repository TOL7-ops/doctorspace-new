import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { doctorId, appointmentTypeId, date, startTime, notes } = body;

    // Get the appointment type duration
    const { data: appointmentType } = await supabase
      .from('appointment_types')
      .select('duration')
      .eq('id', appointmentTypeId)
      .single();

    if (!appointmentType) {
      return NextResponse.json(
        { error: 'Appointment type not found' },
        { status: 404 }
      );
    }

    // Check if slot is available
    const { data: isAvailable } = await supabase.rpc(
      'check_appointment_slot_available',
      {
        p_doctor_id: doctorId,
        p_date: date,
        p_start_time: startTime,
        p_duration: appointmentType.duration,
      }
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 400 }
      );
    }

    // Create the appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        appointment_type_id: appointmentTypeId,
        date,
        start_time: startTime,
        notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(*),
        patient:patients(*),
        appointmentType:appointment_types(*)
      `);

    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (patientId) query = query.eq('patient_id', patientId);
    if (status) query = query.eq('status', status);
    if (date) query = query.eq('date', date);

    const { data: appointments, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 