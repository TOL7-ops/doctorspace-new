import { NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/actions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: 'Doctor ID and date are required' },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(doctorId, date);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 