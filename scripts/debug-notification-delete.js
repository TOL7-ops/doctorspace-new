// Debug script for notification deletion issues
console.log('🔍 Debugging Notification Deletion...');

// Test 1: Check if we can delete a single notification
async function testDeleteSingleNotification() {
  console.log('📋 Testing single notification deletion...');
  
  try {
    // First, let's see what notifications exist
    const getResponse = await fetch('/api/notifications');
    if (getResponse.ok) {
      const notifications = await getResponse.json();
      console.log('📝 Current notifications:', notifications);
      
      if (notifications.data && notifications.data.length > 0) {
        const firstNotification = notifications.data[0];
        console.log('🗑️ Attempting to delete notification:', firstNotification.id);
        
        const deleteResponse = await fetch(`/api/notifications?id=${firstNotification.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('🗑️ Delete response status:', deleteResponse.status);
        const deleteResult = await deleteResponse.json();
        console.log('🗑️ Delete result:', deleteResult);
        
        if (deleteResponse.ok) {
          console.log('✅ Single notification deletion: SUCCESS');
        } else {
          console.log('❌ Single notification deletion: FAILED', deleteResult);
        }
      } else {
        console.log('ℹ️ No notifications to delete');
      }
    } else {
      console.log('❌ Failed to fetch notifications:', getResponse.status);
    }
  } catch (error) {
    console.log('❌ Single notification deletion: ERROR', error);
  }
}

// Test 2: Check if we can clear all notifications
async function testClearAllNotifications() {
  console.log('🧹 Testing clear all notifications...');
  
  try {
    const response = await fetch('/api/notifications?clearAll=true', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🧹 Clear all response status:', response.status);
    const result = await response.json();
    console.log('🧹 Clear all result:', result);

    if (response.ok) {
      console.log('✅ Clear all notifications: SUCCESS');
    } else {
      console.log('❌ Clear all notifications: FAILED', result);
    }
  } catch (error) {
    console.log('❌ Clear all notifications: ERROR', error);
  }
}

// Test 3: Check Supabase client directly
async function testSupabaseDirect() {
  console.log('🔧 Testing Supabase client directly...');
  
  try {
    if (typeof window !== 'undefined' && window.supabase) {
      const { data: { user } } = await window.supabase.auth.getUser();
      console.log('👤 Current user:', user?.id);
      
      if (user) {
        // Try to delete a notification directly
        const { data, error } = await window.supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id)
          .limit(1);
        
        console.log('🔧 Supabase delete result:', { data, error });
        
        if (error) {
          console.log('❌ Supabase delete error:', error);
        } else {
          console.log('✅ Supabase delete success');
        }
      }
    } else {
      console.log('ℹ️ Supabase client not available in browser');
    }
  } catch (error) {
    console.log('❌ Supabase direct test: ERROR', error);
  }
}

// Run all tests
async function runDebugTests() {
  console.log('🚀 Starting Debug Tests...\n');
  
  await testDeleteSingleNotification();
  console.log('');
  await testClearAllNotifications();
  console.log('');
  await testSupabaseDirect();
  
  console.log('\n🎯 Debug Summary:');
  console.log('1. Check browser console for detailed logs');
  console.log('2. Look for RLS policy errors in Supabase logs');
  console.log('3. Verify user authentication is working');
  console.log('4. Check if real-time subscriptions are active');
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runDebugTests();
} else {
  console.log('This script should be run in the browser console');
} 