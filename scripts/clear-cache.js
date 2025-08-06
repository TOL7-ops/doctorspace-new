// Script to help debug the notification sheet issue
console.log('🔧 Debug script loaded');

// Check if components are available
console.log('Checking component availability...');

// Test if Sheet components are available
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment');
  
  // Check if the test sheet button is visible
  setTimeout(() => {
    const testButton = document.querySelector('button:contains("Test Sheet")');
    if (testButton) {
      console.log('✅ Test Sheet button found');
    } else {
      console.log('❌ Test Sheet button not found');
    }
    
    // Check if the bell icon is visible
    const bellIcon = document.querySelector('[aria-label*="Notifications"]');
    if (bellIcon) {
      console.log('✅ Bell icon found');
    } else {
      console.log('❌ Bell icon not found');
    }
    
    // Check for any console errors
    console.log('🔍 Checking for console errors...');
  }, 2000);
} else {
  console.log('❌ Not running in browser environment');
}

// Instructions for manual testing
console.log(`
🧪 Manual Testing Instructions:
1. Look for a "Test Sheet" button in the header
2. Click it to see if the Sheet component works
3. Look for the bell icon next to it
4. Click the bell icon to test the NotificationsSheet
5. Check browser console for any errors
6. Try hard refresh (Ctrl+Shift+R) if components don't appear
`); 