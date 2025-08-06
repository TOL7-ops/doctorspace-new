#!/usr/bin/env node

/**
 * Test script for the notifications API endpoint
 * This script tests the /api/notifications endpoint
 */

console.log('🧪 Testing Notifications API Endpoint');
console.log('Make sure your development server is running (npm run dev)');
console.log('Then run this test in your browser console:\n');

const testScript = `
// Test the notifications API endpoint
async function testNotificationsAPI() {
  console.log('🔍 Testing /api/notifications endpoint...');
  
  try {
    // Test GET request
    console.log('📡 Testing GET /api/notifications...');
    const getResponse = await fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET Response status:', getResponse.status);
    console.log('GET Response ok:', getResponse.ok);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET Response data:', getData);
    } else {
      const errorText = await getResponse.text();
      console.error('❌ GET Error:', errorText);
    }
    
    // Test POST request (create a test notification)
    console.log('\\n📡 Testing POST /api/notifications...');
    const postResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'API Test Notification',
        message: 'This is a test notification created via the API.',
        notification_type: 'system',
        priority: 'low'
      })
    });
    
    console.log('POST Response status:', postResponse.status);
    console.log('POST Response ok:', postResponse.ok);
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST Response data:', postData);
      
      // Test PUT request (mark as read)
      if (postData.data && postData.data.id) {
        console.log('\\n📡 Testing PUT /api/notifications...');
        const putResponse = await fetch('/api/notifications', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: postData.data.id,
            read: true
          })
        });
        
        console.log('PUT Response status:', putResponse.status);
        console.log('PUT Response ok:', putResponse.ok);
        
        if (putResponse.ok) {
          const putData = await putResponse.json();
          console.log('✅ PUT Response data:', putData);
          
          // Test DELETE request
          console.log('\\n📡 Testing DELETE /api/notifications...');
          const deleteResponse = await fetch(\`/api/notifications?id=\${postData.data.id}\`, {
            method: 'DELETE'
          });
          
          console.log('DELETE Response status:', deleteResponse.status);
          console.log('DELETE Response ok:', deleteResponse.ok);
          
          if (deleteResponse.ok) {
            const deleteData = await deleteResponse.json();
            console.log('✅ DELETE Response data:', deleteData);
          } else {
            const errorText = await deleteResponse.text();
            console.error('❌ DELETE Error:', errorText);
          }
        } else {
          const errorText = await putResponse.text();
          console.error('❌ PUT Error:', errorText);
        }
      }
    } else {
      const errorText = await postResponse.text();
      console.error('❌ POST Error:', errorText);
    }
    
    console.log('\\n🎉 API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationsAPI();
`;

console.log(testScript);
console.log('\n📋 Instructions:');
console.log('1. Make sure your development server is running (npm run dev)');
console.log('2. Open your browser and go to http://localhost:3000');
console.log('3. Open the browser console (F12)');
console.log('4. Copy and paste the script above');
console.log('5. Press Enter to run the test');
console.log('6. Check the results in the console');

module.exports = { testScript }; 