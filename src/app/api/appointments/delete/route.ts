import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
  try {
    // Create Supabase client with environment variables
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const appointmentIds = searchParams.get('ids');

    if (!appointmentIds) {
      return NextResponse.json(
        { error: 'Appointment IDs are required' },
        { status: 400 }
      );
    }

    // Parse the appointment IDs
    const ids = appointmentIds.split(',');

    console.log('🗑️ API: Attempting to delete appointments:', ids);

    // Get the authorization header to get the user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract user ID from the request (we'll pass it from the client)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    // Verify that all appointments belong to the current user
    console.log('🔍 Verifying appointments exist and belong to user...');
    const { data: userAppointments, error: verifyError } = await supabase
      .from('appointments')
      .select('id, patient_id, status')
      .in('id', ids);

    if (verifyError) {
      console.error('❌ Error verifying appointments:', verifyError);
      return NextResponse.json(
        { error: 'Failed to verify appointments' },
        { status: 500 }
      );
    }

    console.log('📊 Found appointments:', userAppointments);

    // Check if appointments exist
    if (!userAppointments || userAppointments.length === 0) {
      console.log('⚠️ No appointments found with provided IDs');
      return NextResponse.json(
        { error: 'No appointments found with provided IDs' },
        { status: 404 }
      );
    }

    // Check if all appointments belong to the user
    const unauthorizedAppointments = userAppointments?.filter(
      appointment => appointment.patient_id !== userId
    );

    if (unauthorizedAppointments && unauthorizedAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized to delete some appointments' },
        { status: 403 }
      );
    }

    // Delete the appointments
    console.log('🔍 Attempting database deletion with service role...');
    const { data, error, count } = await supabase
      .from('appointments')
      .delete()
      .in('id', ids)
      .select();

    if (error) {
      console.error('❌ Database deletion error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to delete appointments',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('✅ API: Appointments deleted successfully:', { data, count });
    console.log('📊 Deletion details:', {
      requestedIds: ids,
      deletedData: data,
      count: count,
      dataLength: data?.length || 0
    });

    return NextResponse.json({
      success: true,
      deletedCount: count,
      deletedAppointments: data
    });

  } catch (error) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 