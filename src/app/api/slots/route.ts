import { NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/actions';

// Force this API route to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    console.log('🔍 Slots API called with:', { doctorId, date });

    if (!doctorId || !date) {
      console.error('❌ Missing required parameters:', { doctorId, date });
      return NextResponse.json(
        { error: 'Doctor ID and date are required' },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(doctorId, date);
    console.log('✅ Available slots fetched:', {
      doctorId,
      date,
      slotsCount: slots.length,
      slots: slots.slice(0, 3) // Log first 3 slots for debugging
    });

    return NextResponse.json({
      success: true,
      availableSlots: slots,
      count: slots.length
    });
  } catch (error) {
    console.error('❌ Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 