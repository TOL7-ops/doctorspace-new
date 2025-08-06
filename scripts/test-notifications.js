#!/usr/bin/env node

/**
 * Test script for the enhanced notification system
 * This script demonstrates how to use the notification functions
 * and can be used to test the system functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user ID - replace with an actual user ID from your database
const TEST_USER_ID = 'test-user-id';

// Notification test functions
async function testAppointmentNotification() {
  console.log('🧪 Testing appointment notification...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: TEST_USER_ID,
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Smith has been confirmed for 2024-03-25 at 10:00 AM. Please arrive 10 minutes early.',
        notification_type: 'appointment',
        priority: 'medium',
        metadata: {
          appointment_id: 'test-appointment-123',
          doctor_name: 'Dr. Smith',
          appointment_date: '2024-03-25',
          appointment_time: '10:00:00'
        }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Appointment notification created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create appointment notification:', error.message);
    return null;
  }
}

async function testCancellationNotification() {
  console.log('🧪 Testing cancellation notification...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: TEST_USER_ID,
        title: 'Appointment Cancelled',
        message: 'Your appointment with Dr. Smith on 2024-03-25 at 10:00 AM has been cancelled by you. Reason: Schedule conflict',
        notification_type: 'appointment',
        priority: 'high',
        metadata: {
          appointment_id: 'test-appointment-123',
          cancelled_by: 'patient',
          reason: 'Schedule conflict'
        }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Cancellation notification created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create cancellation notification:', error.message);
    return null;
  }
}

async function testReminderNotification() {
  console.log('🧪 Testing reminder notification...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: TEST_USER_ID,
        title: 'Appointment Reminder',
        message: 'Reminder: You have an appointment with Dr. Smith tomorrow at 10:00 AM. Please confirm your attendance.',
        notification_type: 'reminder',
        priority: 'medium',
        metadata: {
          appointment_id: 'test-appointment-123',
          hours_until_appointment: 24
        }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Reminder notification created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create reminder notification:', error.message);
    return null;
  }
}

async function testMessageNotification() {
  console.log('🧪 Testing message notification...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: TEST_USER_ID,
        title: 'New Message',
        message: 'Dr. Smith sent you a message: "Please bring your recent test results to your appointment."',
        notification_type: 'message',
        priority: 'low',
        metadata: {
          sender_id: 'doctor-123',
          sender_name: 'Dr. Smith',
          message_preview: 'Please bring your recent test results...'
        }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Message notification created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create message notification:', error.message);
    return null;
  }
}

async function testUrgentNotification() {
  console.log('🧪 Testing urgent notification...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: TEST_USER_ID,
        title: 'URGENT: Appointment in 1 hour',
        message: 'URGENT: Your appointment with Dr. Smith is in 1 hour at 10:00 AM. Please confirm your attendance immediately.',
        notification_type: 'reminder',
        priority: 'high',
        metadata: {
          appointment_id: 'test-appointment-123',
          hours_until_appointment: 1,
          urgent: true
        }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Urgent notification created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create urgent notification:', error.message);
    return null;
  }
}

async function getNotificationStats() {
  console.log('📊 Getting notification statistics...');
  
  try {
    const { data, error } = await supabase
      .rpc('get_notification_stats', {
        user_id_param: TEST_USER_ID
      });

    if (error) throw error;
    console.log('✅ Notification statistics:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Failed to get notification statistics:', error.message);
    return null;
  }
}

async function markNotificationsAsRead() {
  console.log('📝 Marking notifications as read...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', TEST_USER_ID)
      .eq('read', false)
      .select();

    if (error) throw error;
    console.log(`✅ Marked ${data.length} notifications as read`);
    return data;
  } catch (error) {
    console.error('❌ Failed to mark notifications as read:', error.message);
    return null;
  }
}

async function cleanupTestNotifications() {
  console.log('🧹 Cleaning up test notifications...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', TEST_USER_ID)
      .select();

    if (error) throw error;
    console.log(`✅ Cleaned up ${data.length} test notifications`);
    return data;
  } catch (error) {
    console.error('❌ Failed to cleanup test notifications:', error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting notification system tests...\n');

  // Check if test user ID is set
  if (TEST_USER_ID === 'test-user-id') {
    console.log('⚠️  Please set a valid TEST_USER_ID in the script or environment variables');
    console.log('   You can find a user ID from your Supabase dashboard');
    return;
  }

  try {
    // Create test notifications
    await testAppointmentNotification();
    await testCancellationNotification();
    await testReminderNotification();
    await testMessageNotification();
    await testUrgentNotification();

    console.log('\n📋 Created all test notifications\n');

    // Get statistics
    await getNotificationStats();

    // Mark as read
    await markNotificationsAsRead();

    // Get updated statistics
    await getNotificationStats();

    console.log('\n✅ All tests completed successfully!');

    // Ask if user wants to cleanup
    console.log('\n🧹 To cleanup test notifications, run:');
    console.log('   node scripts/test-notifications.js cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Cleanup function
async function cleanup() {
  console.log('🧹 Running cleanup...');
  await cleanupTestNotifications();
  console.log('✅ Cleanup completed');
}

// CLI handling
const command = process.argv[2];

if (command === 'cleanup') {
  cleanup();
} else {
  runTests();
}

module.exports = {
  testAppointmentNotification,
  testCancellationNotification,
  testReminderNotification,
  testMessageNotification,
  testUrgentNotification,
  getNotificationStats,
  markNotificationsAsRead,
  cleanupTestNotifications
}; 