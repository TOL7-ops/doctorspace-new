#!/usr/bin/env node

/**
 * Test Script for Notification System
 * Tests the complete notification functionality
 */

console.log('🔔 Notification System Test Script');
console.log('Copy and paste this into your browser console:\n');

const notificationTestScript = `
// Test the notification system
async function testNotificationSystem() {
  console.log('🧪 Testing notification system...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Test 1: Create test notifications
    console.log('📝 Creating test notifications...');
    
    const testNotifications = [
      {
        user_id: user.id,
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Smith has been confirmed for tomorrow at 10:00 AM.',
        read: false
      },
      {
        user_id: user.id,
        title: 'Appointment Reminder',
        message: 'Reminder: You have an upcoming appointment in 2 hours.',
        read: false
      },
      {
        user_id: user.id,
        title: 'Appointment Cancelled',
        message: 'Your appointment with Dr. Johnson has been cancelled. Please reschedule.',
        read: false
      },
      {
        user_id: user.id,
        title: 'New Message',
        message: 'You have received a new message from your doctor.',
        read: true
      },
      {
        user_id: user.id,
        title: 'System Update',
        message: 'The DoctorSpace app has been updated with new features.',
        read: false
      }
    ];
    
    for (const notification of testNotifications) {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create notification:', error);
      } else {
        console.log('✅ Created notification:', data.title);
      }
    }
    
    console.log('🎉 Test notifications created!');
    console.log('💡 Check the notification bell in the header to see the notifications');
    
  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  }
}

// Test API endpoints
async function testNotificationAPI() {
  console.log('🌐 Testing notification API endpoints...');
  
  try {
    // Test GET /api/notifications
    console.log('📡 Testing GET /api/notifications...');
    const getResponse = await fetch('/api/notifications');
    const getData = await getResponse.json();
    
    console.log('GET Response Status:', getResponse.status);
    console.log('GET Response Data:', getData);
    
    if (getResponse.ok) {
      console.log('✅ GET /api/notifications working correctly');
      console.log('📊 Found', getData.data?.length || 0, 'notifications');
      console.log('📊 Unread count:', getData.stats?.unread || 0);
    } else {
      console.log('❌ GET /api/notifications failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Test mark as read functionality
async function testMarkAsRead() {
  console.log('✅ Testing mark as read functionality...');
  
  try {
    // Get first unread notification
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('read', false)
      .limit(1);
    
    if (notifications && notifications.length > 0) {
      const notificationId = notifications[0].id;
      
      console.log('📝 Marking notification as read:', notificationId);
      
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: notificationId,
          read: true
        })
      });
      
      const data = await response.json();
      console.log('PUT Response Status:', response.status);
      console.log('PUT Response Data:', data);
      
      if (response.ok) {
        console.log('✅ Mark as read working correctly');
      } else {
        console.log('❌ Mark as read failed');
      }
    } else {
      console.log('ℹ️ No unread notifications to test with');
    }
    
  } catch (error) {
    console.error('❌ Error testing mark as read:', error);
  }
}

// Test mark all as read functionality
async function testMarkAllAsRead() {
  console.log('✅ Testing mark all as read functionality...');
  
  try {
    const response = await fetch('/api/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        markAllRead: true
      })
    });
    
    const data = await response.json();
    console.log('PUT (mark all) Response Status:', response.status);
    console.log('PUT (mark all) Response Data:', data);
    
    if (response.ok) {
      console.log('✅ Mark all as read working correctly');
    } else {
      console.log('❌ Mark all as read failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing mark all as read:', error);
  }
}

// Test delete functionality
async function testDeleteNotification() {
  console.log('🗑️ Testing delete notification functionality...');
  
  try {
    // Get first notification
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
    
    if (notifications && notifications.length > 0) {
      const notificationId = notifications[0].id;
      
      console.log('🗑️ Deleting notification:', notificationId);
      
      const response = await fetch(\`/api/notifications?id=\${notificationId}\`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      console.log('DELETE Response Status:', response.status);
      console.log('DELETE Response Data:', data);
      
      if (response.ok) {
        console.log('✅ Delete notification working correctly');
      } else {
        console.log('❌ Delete notification failed');
      }
    } else {
      console.log('ℹ️ No notifications to delete');
    }
    
  } catch (error) {
    console.error('❌ Error testing delete:', error);
  }
}

// Clear all test notifications
async function clearTestNotifications() {
  console.log('🧹 Clearing all test notifications...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error('❌ Error clearing notifications:', error);
    } else {
      console.log('✅ Cleared all notifications');
      console.log('💡 Refresh the page to see the changes');
    }
    
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  }
}

// Show current notifications
async function showCurrentNotifications() {
  console.log('📋 Current notifications:');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return;
    }
    
    if (data.length === 0) {
      console.log('📭 No notifications found');
      return;
    }
    
    data.forEach((notification, index) => {
      console.log(\`\${index + 1}. [\${notification.read ? 'READ' : 'UNREAD'}] \${notification.title}\`);
      console.log(\`    Message: \${notification.message}\`);
      console.log(\`    Created: \${new Date(notification.created_at).toLocaleString()}\`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error showing notifications:', error);
  }
}

// Available functions
console.log('Available functions:');
console.log('1. testNotificationSystem() - Create test notifications');
console.log('2. testNotificationAPI() - Test API endpoints');
console.log('3. testMarkAsRead() - Test mark as read');
console.log('4. testMarkAllAsRead() - Test mark all as read');
console.log('5. testDeleteNotification() - Test delete notification');
console.log('6. clearTestNotifications() - Clear all notifications');
console.log('7. showCurrentNotifications() - Show current notifications');
`;

console.log(notificationTestScript);
console.log('\n📋 Instructions:');
console.log('1. Make sure you are logged into the application');
console.log('2. Open browser console (F12)');
console.log('3. Copy and paste the script above');
console.log('4. Run one of the functions:');
console.log('   - testNotificationSystem() to create test notifications');
console.log('   - testNotificationAPI() to test API endpoints');
console.log('   - testMarkAsRead() to test mark as read functionality');
console.log('   - testMarkAllAsRead() to test mark all as read');
console.log('   - testDeleteNotification() to test delete functionality');
console.log('   - clearTestNotifications() to clear all notifications');
console.log('   - showCurrentNotifications() to see current notifications');

module.exports = { notificationTestScript }; 