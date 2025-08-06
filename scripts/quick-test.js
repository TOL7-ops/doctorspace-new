#!/usr/bin/env node

/**
 * Quick test script to verify notification system
 * This script can be run in the browser console to test notifications
 */

console.log('🧪 Quick Notification Test Script');
console.log('Copy and paste this into your browser console:');

const testScript = `
// Test notification system
async function testNotifications() {
  console.log('🔍 Testing notification system...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ No user logged in');
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Create a test notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        read: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to create notification:', error);
      return;
    }
    
    console.log('✅ Test notification created:', data.id);
    
    // Check if notification appears in the list
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Failed to fetch notifications:', fetchError);
      return;
    }
    
    console.log('📋 Current notifications:', notifications.length);
    notifications.forEach((n, i) => {
      console.log(\`  \${i + 1}. \${n.title}: \${n.message}\`);
    });
    
    // Clean up test notification
    await supabase
      .from('notifications')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Test notification cleaned up');
    console.log('🎉 Notification system is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotifications();
`;

console.log(testScript);
console.log('\n📋 Instructions:');
console.log('1. Open your browser console (F12)');
console.log('2. Copy and paste the script above');
console.log('3. Press Enter to run the test');
console.log('4. Check the results');

module.exports = { testScript }; 