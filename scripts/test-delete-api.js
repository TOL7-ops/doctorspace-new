// Test script for DELETE API endpoint debugging
console.log('🔍 Testing DELETE API Endpoint...');

// Test 1: Test with a real notification ID
async function testWithRealNotification() {
  console.log('📋 Test 1: Testing with real notification ID...');
  
  try {
    // First, get existing notifications
    const getResponse = await fetch('/api/notifications');
    if (getResponse.ok) {
      const result = await getResponse.json();
      console.log('📝 Current notifications:', result);
      
      if (result.data && result.data.length > 0) {
        const realNotificationId = result.data[0].id;
        console.log('🗑️ Testing with real notification ID:', realNotificationId);
        
        const deleteResponse = await fetch(`/api/notifications?id=${realNotificationId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('🗑️ Delete response status:', deleteResponse.status);
        const deleteResult = await deleteResponse.json();
        console.log('🗑️ Delete result:', deleteResult);
        
        if (deleteResponse.ok) {
          console.log('✅ Real notification deletion: SUCCESS');
        } else {
          console.log('❌ Real notification deletion: FAILED', deleteResult);
        }
      } else {
        console.log('ℹ️ No notifications available for testing');
      }
    } else {
      console.log('❌ Failed to fetch notifications:', getResponse.status);
    }
  } catch (error) {
    console.log('❌ Real notification test: ERROR', error);
  }
}

// Test 2: Test clear all functionality
async function testClearAll() {
  console.log('🧹 Test 2: Testing clear all functionality...');
  
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
      console.log('✅ Clear all: SUCCESS');
    } else {
      console.log('❌ Clear all: FAILED', result);
    }
  } catch (error) {
    console.log('❌ Clear all test: ERROR', error);
  }
}

// Test 3: Test with invalid ID
async function testWithInvalidId() {
  console.log('🚫 Test 3: Testing with invalid ID...');
  
  try {
    const response = await fetch('/api/notifications?id=invalid-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🚫 Invalid ID response status:', response.status);
    const result = await response.json();
    console.log('🚫 Invalid ID result:', result);

    if (response.ok) {
      console.log('✅ Invalid ID deletion: SUCCESS (should not happen)');
    } else {
      console.log('ℹ️ Invalid ID deletion: Expected failure', result);
    }
  } catch (error) {
    console.log('❌ Invalid ID test: ERROR', error);
  }
}

// Test 4: Test without authentication
async function testWithoutAuth() {
  console.log('🔐 Test 4: Testing without authentication...');
  
  try {
    // Create a new request without cookies
    const response = await fetch('/api/notifications?id=test-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit', // Don't send cookies
    });

    console.log('🔐 No auth response status:', response.status);
    const result = await response.json();
    console.log('🔐 No auth result:', result);

    if (response.status === 401) {
      console.log('✅ No auth test: Expected 401 (authentication required)');
    } else {
      console.log('❌ No auth test: Unexpected response', result);
    }
  } catch (error) {
    console.log('❌ No auth test: ERROR', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting DELETE API Tests...\n');
  
  await testWithRealNotification();
  console.log('');
  await testClearAll();
  console.log('');
  await testWithInvalidId();
  console.log('');
  await testWithoutAuth();
  
  console.log('\n🎯 Test Summary:');
  console.log('1. Check server console for detailed logs');
  console.log('2. Look for specific error messages');
  console.log('3. Verify RLS policies are working');
  console.log('4. Check if authentication is working properly');
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('This script should be run in the browser console');
} 