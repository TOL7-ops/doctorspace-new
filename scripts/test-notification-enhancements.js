// Test script for notification enhancements
console.log('🧪 Testing Notification Enhancements...');

// Test 1: Clear All Notifications
async function testClearAllNotifications() {
  console.log('📋 Testing Clear All Notifications...');
  
  try {
    const response = await fetch('/api/notifications?clearAll=true', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Clear All Notifications: SUCCESS', result);
    } else {
      console.log('❌ Clear All Notifications: FAILED', response.status);
    }
  } catch (error) {
    console.log('❌ Clear All Notifications: ERROR', error);
  }
}

// Test 2: Create test notifications with reasons
async function testNotificationsWithReasons() {
  console.log('📝 Testing Notifications with Reasons...');
  
  try {
    // Test cancellation notification with reason
    const cancellationResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Appointment Cancelled',
        message: 'Your appointment with Dr. Smith has been cancelled. Reason: I\'m traveling.',
        notification_type: 'appointment',
        priority: 'high',
        metadata: {
          doctor_name: 'Dr. Smith',
          date: '2024-01-15',
          time: '10:00',
          cancelled_by: 'patient',
          reason: 'I\'m traveling'
        }
      }),
    });

    if (cancellationResponse.ok) {
      console.log('✅ Cancellation Notification with Reason: SUCCESS');
    } else {
      console.log('❌ Cancellation Notification with Reason: FAILED');
    }

    // Test reschedule notification with reason
    const rescheduleResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Appointment Rescheduled',
        message: 'Your appointment with Dr. Johnson has been rescheduled. Reason: Schedule conflict.',
        notification_type: 'appointment',
        priority: 'medium',
        metadata: {
          doctor_name: 'Dr. Johnson',
          old_date: '2024-01-15',
          old_time: '10:00',
          new_date: '2024-01-16',
          new_time: '14:00',
          rescheduled_by: 'patient',
          reason: 'Schedule conflict'
        }
      }),
    });

    if (rescheduleResponse.ok) {
      console.log('✅ Reschedule Notification with Reason: SUCCESS');
    } else {
      console.log('❌ Reschedule Notification with Reason: FAILED');
    }

  } catch (error) {
    console.log('❌ Notifications with Reasons: ERROR', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Notification Enhancement Tests...\n');
  
  await testNotificationsWithReasons();
  console.log('');
  await testClearAllNotifications();
  
  console.log('\n🎉 Test completed! Check the notification panel to see the results.');
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Open the notification panel (bell icon)');
  console.log('2. Look for notifications with reasons in the message');
  console.log('3. Try cancelling an appointment - you should see a reason input field');
  console.log('4. Try rescheduling an appointment - you should see a reason input field');
  console.log('5. Click "Clear All" - all notifications should be deleted');
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runTests();
} else {
  console.log('This script should be run in the browser console');
} 