// Test script for DELETE API endpoint
console.log('🧪 Testing DELETE API endpoint...');

// Test 1: Test with real notification
async function testWithRealNotification() {
  console.log('✅ Test 1: Testing with real notification...');
  
  try {
    const response = await fetch('/api/notifications?id=test-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Real notification response status:', response.status);
    const result = await response.json();
    console.log('✅ Real notification result:', result);

    if (response.ok) {
      console.log('✅ Real notification test: Success');
    } else {
      console.log('❌ Real notification test: Failed', response.status, result);
    }
  } catch (error) {
    console.log('❌ Real notification test: ERROR', error);
  }
}

// Test 2: Test clear all functionality
async function testClearAll() {
  console.log('🗑️ Test 2: Testing clear all functionality...');
  
  try {
    const response = await fetch('/api/notifications?clearAll=true', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🗑️ Clear all response status:', response.status);
    const result = await response.json();
    console.log('🗑️ Clear all result:', result);

    if (response.ok) {
      console.log('✅ Clear all test: Success');
    } else {
      console.log('❌ Clear all test: Failed', response.status, result);
    }
  } catch (error) {
    console.log('❌ Clear all test: ERROR', error);
  }
}

// Test 4: Test without authentication
async function testWithoutAuth() {
  console.log('🔒 Test 4: Testing without authentication...');
  
  try {
    const response = await fetch('/api/notifications?id=test-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔒 No auth response status:', response.status);
    const result = await response.json();
    console.log('🔒 No auth result:', result);

    if (response.status === 401) {
      console.log('✅ No auth test: Expected 401 (Unauthorized)');
    } else if (response.ok) {
      console.log('❌ No auth test: Unexpected success (should require auth)');
    } else {
      console.log('❌ No auth test: Unexpected error status', response.status, result);
    }
  } catch (error) {
    console.log('❌ No auth test: ERROR', error);
  }
}

// Run tests
console.log('🚀 Starting DELETE API Tests...\n');

testWithRealNotification();
testClearAll();
testWithoutAuth(); 