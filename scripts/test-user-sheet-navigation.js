// Test script for UserSheet navigation functionality
console.log('🧭 Testing UserSheet Navigation...');

// Test 1: Check if navigation handlers are properly set up
function testNavigationHandlers() {
  console.log('📋 Test 1: Checking navigation handlers...');
  
  // Check if UserSheet component is rendered
  const userButtons = document.querySelectorAll('button[aria-label="User profile"]');
  console.log('👤 Found user profile buttons:', userButtons.length);
  
  if (userButtons.length === 0) {
    console.log('❌ No user profile buttons found');
    return false;
  }
  
  console.log('✅ User profile button found');
  return true;
}

// Test 2: Test Messages navigation
function testMessagesNavigation() {
  console.log('📧 Test 2: Testing Messages navigation...');
  
  const userButton = document.querySelector('button[aria-label="User profile"]');
  if (!userButton) {
    console.log('❌ User button not found');
    return false;
  }
  
  // Click to open sheet
  userButton.click();
  
  setTimeout(() => {
    // Look for Messages button
    const messagesButton = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent?.includes('Messages')
    );
    
    if (messagesButton) {
      console.log('✅ Messages button found');
      
      // Store current URL
      const currentUrl = window.location.href;
      console.log('📍 Current URL:', currentUrl);
      
      // Click Messages button
      messagesButton.click();
      
      // Check if navigation occurred
      setTimeout(() => {
        const newUrl = window.location.href;
        console.log('📍 New URL:', newUrl);
        
        if (newUrl.includes('/dashboard/inbox')) {
          console.log('✅ Messages navigation successful - redirected to inbox');
        } else if (newUrl !== currentUrl) {
          console.log('✅ Messages navigation successful - URL changed');
        } else {
          console.log('❌ Messages navigation failed - URL unchanged');
        }
      }, 500);
      
    } else {
      console.log('❌ Messages button not found in sheet');
    }
  }, 200);
  
  return true;
}

// Test 3: Test Appointments navigation
function testAppointmentsNavigation() {
  console.log('📅 Test 3: Testing Appointments navigation...');
  
  // Navigate back to dashboard first
  if (!window.location.href.includes('/dashboard')) {
    console.log('🔄 Navigating back to dashboard...');
    window.history.back();
  }
  
  setTimeout(() => {
    const userButton = document.querySelector('button[aria-label="User profile"]');
    if (!userButton) {
      console.log('❌ User button not found');
      return false;
    }
    
    // Click to open sheet
    userButton.click();
    
    setTimeout(() => {
      // Look for Appointments button
      const appointmentsButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.includes('Appointments')
      );
      
      if (appointmentsButton) {
        console.log('✅ Appointments button found');
        
        // Store current URL
        const currentUrl = window.location.href;
        console.log('📍 Current URL:', currentUrl);
        
        // Click Appointments button
        appointmentsButton.click();
        
        // Check if navigation occurred
        setTimeout(() => {
          const newUrl = window.location.href;
          console.log('📍 New URL:', newUrl);
          
          if (newUrl.includes('/dashboard/appointments')) {
            console.log('✅ Appointments navigation successful - redirected to appointments');
          } else if (newUrl !== currentUrl) {
            console.log('✅ Appointments navigation successful - URL changed');
          } else {
            console.log('❌ Appointments navigation failed - URL unchanged');
          }
        }, 500);
        
      } else {
        console.log('❌ Appointments button not found in sheet');
      }
    }, 200);
  }, 1000);
  
  return true;
}

// Test 4: Check console logs for navigation events
function checkNavigationLogs() {
  console.log('📝 Test 4: Checking for navigation logs...');
  
  console.log('🔍 Look for these logs in the console:');
  console.log('  - "📧 Navigating to messages/inbox"');
  console.log('  - "📅 Navigating to appointments"');
  console.log('  - "Navigating to messages/inbox..."');
  console.log('  - "Navigating to appointments..."');
}

// Test 5: Verify page content after navigation
function verifyPageContent() {
  console.log('📄 Test 5: Verifying page content after navigation...');
  
  const currentUrl = window.location.href;
  console.log('📍 Current URL:', currentUrl);
  
  if (currentUrl.includes('/dashboard/inbox')) {
    console.log('📧 Currently on inbox page');
    
    // Check for inbox-specific elements
    const inboxElements = document.querySelectorAll('[data-testid*="inbox"], [class*="inbox"]');
    console.log('📧 Found inbox elements:', inboxElements.length);
    
    if (inboxElements.length > 0) {
      console.log('✅ Inbox page content verified');
    } else {
      console.log('⚠️ Inbox page content not immediately visible');
    }
    
  } else if (currentUrl.includes('/dashboard/appointments')) {
    console.log('📅 Currently on appointments page');
    
    // Check for appointments-specific elements
    const appointmentElements = document.querySelectorAll('[data-testid*="appointment"], [class*="appointment"]');
    console.log('📅 Found appointment elements:', appointmentElements.length);
    
    if (appointmentElements.length > 0) {
      console.log('✅ Appointments page content verified');
    } else {
      console.log('⚠️ Appointments page content not immediately visible');
    }
    
  } else {
    console.log('🏠 Currently on dashboard or other page');
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting UserSheet Navigation Tests...\n');
  
  const test1 = testNavigationHandlers();
  console.log('');
  
  if (test1) {
    testMessagesNavigation();
    console.log('');
    
    // Wait a bit before testing appointments
    setTimeout(() => {
      testAppointmentsNavigation();
      console.log('');
      
      setTimeout(() => {
        verifyPageContent();
        console.log('');
        checkNavigationLogs();
        
        console.log('\n🎯 Test Summary:');
        console.log('1. Check browser console for navigation logs');
        console.log('2. Verify Messages button navigates to /dashboard/inbox');
        console.log('3. Verify Appointments button navigates to /dashboard/appointments');
        console.log('4. Confirm page content loads properly after navigation');
        console.log('5. Test that sheet closes after navigation');
      }, 2000);
    }, 2000);
  } else {
    console.log('❌ Cannot run navigation tests - UserSheet not found');
  }
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('This script should be run in the browser console');
} 