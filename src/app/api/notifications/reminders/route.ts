import { NextResponse } from 'next/server';
import { createScheduledReminders } from '@/lib/notifications';

export async function POST() {
  try {
    // This endpoint can be called by a cron job or scheduled task
    // to send reminders for upcoming appointments
    
    await createScheduledReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scheduled reminders processed successfully' 
    });
  } catch (error) {
    console.error('Error processing scheduled reminders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process scheduled reminders' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // For testing purposes, also allow GET requests
    await createScheduledReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scheduled reminders processed successfully' 
    });
  } catch (error) {
    console.error('Error processing scheduled reminders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process scheduled reminders' 
      },
      { status: 500 }
    );
  }
} 