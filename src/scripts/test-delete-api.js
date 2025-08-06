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

    if (response.status === 400) {
      console.log('✅ Invalid ID test: Expected 400 (Bad Request) - Invalid UUID format');
    } else if (response.status === 404) {
      console.log('✅ Invalid ID test: Expected 404 (Not Found) - Notification not found');
    } else if (response.ok) {
      console.log('❌ Invalid ID test: Unexpected success (should not happen)');
    } else {
      console.log('❌ Invalid ID test: Unexpected error status', response.status, result);
    }
  } catch (error) {
    console.log('❌ Invalid ID test: ERROR', error);
  }
}

// Test 5: Test with valid UUID format but non-existent ID
async function testWithNonExistentId() {
  console.log('👻 Test 5: Testing with valid UUID format but non-existent ID...');
  
  try {
    const fakeUuid = '12345678-1234-1234-1234-123456789abc';
    const response = await fetch(`/api/notifications?id=${fakeUuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('👻 Non-existent ID response status:', response.status);
    const result = await response.json();
    console.log('👻 Non-existent ID result:', result);

    if (response.status === 404) {
      console.log('✅ Non-existent ID test: Expected 404 (Not Found) - Notification not found');
    } else if (response.ok) {
      console.log('❌ Non-existent ID test: Unexpected success (should not happen)');
    } else {
      console.log('❌ Non-existent ID test: Unexpected error status', response.status, result);
    }
  } catch (error) {
    console.log('❌ Non-existent ID test: ERROR', error);
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
  console.log('');
  await testWithNonExistentId();
  
  console.log('\n🎯 Test Summary:');
  console.log('1. Check server console for detailed logs');
  console.log('2. Look for specific error messages');
  console.log('3. Verify RLS policies are working');
  console.log('4. Check if authentication is working properly');
  console.log('5. Invalid IDs should return 400, non-existent IDs should return 404');
} 