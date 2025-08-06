#!/usr/bin/env node

/**
 * Test script for authentication and notifications API
 * This script helps debug the 401 authentication error
 */

console.log('🔐 Testing Authentication and Notifications API');
console.log('Copy and paste this into your browser console:\n');

const testScript = `
// Test authentication and notifications API
async function testAuthAndNotifications() {
  console.log('🔍 Testing authentication status...');
  
  try {
    // First, check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Authentication error:', userError);
      console.log('💡 You need to be logged in to access notifications');
      return;
    }
    
    if (!user) {
      console.log('❌ No user logged in');
      console.log('💡 Please log in first, then try again');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('User ID:', user.id);
    
    // Now test the notifications API
    console.log('\\n📡 Testing notifications API...');
    const response = await fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Notifications API working!');
      console.log('Data:', data);
      
      if (data.data && data.data.length > 0) {
        console.log('📋 Found', data.data.length, 'notifications');
        data.data.forEach((notification, index) => {
          console.log(\`  \${index + 1}. \${notification.title}: \${notification.message}\`);
        });
      } else {
        console.log('📭 No notifications found');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      
      if (response.status === 401) {
        console.log('💡 401 error suggests authentication issue on server side');
        console.log('💡 Check if the API route is using the correct auth method');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test authentication status only
async function checkAuthOnly() {
  console.log('🔐 Checking authentication status only...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Auth error:', error);
      return;
    }
    
    if (!user) {
      console.log('❌ Not logged in');
      console.log('💡 Please log in first');
      return;
    }
    
    console.log('✅ Logged in as:', user.email);
    console.log('User ID:', user.id);
    console.log('Session valid:', !!user.id);
    
  } catch (error) {
    console.error('❌ Auth check failed:', error);
  }
}

// Test notifications directly from Supabase
async function testDirectSupabase() {
  console.log('🔍 Testing direct Supabase notifications query...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Not authenticated');
      return;
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      return;
    }
    
    console.log('✅ Direct Supabase query successful');
    console.log('Found', data.length, 'notifications');
    
    if (data.length > 0) {
      data.forEach((notification, index) => {
        console.log(\`  \${index + 1}. \${notification.title}: \${notification.message}\`);
      });
    }
    
  } catch (error) {
    console.error('❌ Direct Supabase test failed:', error);
  }
}

// Run the tests
console.log('Choose a test to run:');
console.log('1. testAuthAndNotifications() - Full test');
console.log('2. checkAuthOnly() - Check auth only');
console.log('3. testDirectSupabase() - Test direct Supabase query');
`;

console.log(testScript);
console.log('\n📋 Instructions:');
console.log('1. Make sure you are logged into the application');
console.log('2. Open browser console (F12)');
console.log('3. Copy and paste the script above');
console.log('4. Run one of the test functions:');
console.log('   - testAuthAndNotifications() for full test');
console.log('   - checkAuthOnly() to check authentication');
console.log('   - testDirectSupabase() to test direct database access');

module.exports = { testScript }; 