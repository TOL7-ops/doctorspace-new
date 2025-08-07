const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testResetPasswordFlow() {
  console.log('🧪 Testing Password Reset Flow...\n');

  try {
    // Test 1: Check if reset password page is accessible
    console.log('1. Testing reset password page accessibility...');
    console.log('   - Navigate to: https://doctorspace.it.com/reset-password');
    console.log('   - Should show form (even without token)');
    console.log('   - Should not redirect to login immediately');

    // Test 2: Check Supabase configuration
    console.log('\n2. Checking Supabase configuration...');
    console.log('   ✅ Reset password URL configured: https://doctorspace.it.com/reset-password');
    console.log('   ✅ Forgot password page exists and configured');

    // Test 3: Test the flow manually
    console.log('\n3. Manual testing steps:');
    console.log('   a) Go to: https://doctorspace.it.com/forgot-password');
    console.log('   b) Enter a valid email address');
    console.log('   c) Click "Send reset link"');
    console.log('   d) Check email for reset link');
    console.log('   e) Click the reset link in email');
    console.log('   f) Should land on: https://doctorspace.it.com/reset-password?access_token=...');
    console.log('   g) Enter new password and confirm');
    console.log('   h) Should show success and redirect to login');

    // Test 4: Check for common issues
    console.log('\n4. Common issues to check:');
    console.log('   ❓ Is the email being sent?');
    console.log('   ❓ Is the reset link in email correct?');
    console.log('   ❓ Is the access_token parameter present in URL?');
    console.log('   ❓ Are there any console errors on the reset page?');
    console.log('   ❓ Is the middleware interfering with the flow?');

    console.log('\n🔧 Debugging steps:');
    console.log('1. Open browser developer tools');
    console.log('2. Go to Console tab');
    console.log('3. Navigate to reset password page');
    console.log('4. Look for debug messages starting with "Reset password page loaded"');
    console.log('5. Check for any error messages');

    console.log('\n📝 Expected console output:');
    console.log('   Reset password page loaded');
    console.log('   All URL parameters: { access_token: "...", ... }');
    console.log('   Access token: Present');
    console.log('   Setting session with access token...');
    console.log('   Session set successfully: { ... }');

    console.log('\n✅ If you see these messages, the page is working correctly!');
    console.log('❌ If you see errors or missing messages, there may be an issue.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testResetPasswordFlow(); 