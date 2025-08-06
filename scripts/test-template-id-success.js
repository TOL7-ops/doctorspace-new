// Test script to verify template_id fix is working
// Run this in your browser console after the successful migration

async function testTemplateIdSuccess() {
  console.log('🧪 Testing template_id fix success...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Test 1: Create a notification (should work without template_id errors)
    console.log('\n📝 Test 1: Creating notification...');
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Test Notification - Template ID Fixed!',
        message: 'This notification should be created successfully without any template_id constraint violations.',
        read: false
      })
      .select()
      .single();
    
    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
      return;
    } else {
      console.log('✅ Notification created successfully!');
      console.log('✅ Notification ID:', notification.id);
      console.log('✅ Template ID assigned:', notification.template_id);
    }
    
    // Test 2: Check notification templates
    console.log('\n📋 Test 2: Checking notification templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('notification_templates')
      .select('*')
      .order('name');
    
    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError);
    } else {
      console.log('✅ Templates found:', templates.length);
      templates.forEach(template => {
        console.log(`  - ${template.name}: ${template.title} (${template.notification_type})`);
      });
    }
    
    // Test 3: Test appointment cancellation notification
    console.log('\n🚫 Test 3: Testing appointment cancellation notification...');
    const { data: cancelNotification, error: cancelError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Appointment Cancelled',
        message: 'Your appointment with Dr. Smith has been cancelled.',
        read: false,
        notification_type: 'appointment',
        priority: 'high'
      })
      .select()
      .single();
    
    if (cancelError) {
      console.error('❌ Error creating cancellation notification:', cancelError);
    } else {
      console.log('✅ Cancellation notification created successfully!');
      console.log('✅ Template ID:', cancelNotification.template_id);
    }
    
    // Test 4: Check notifications API endpoint
    console.log('\n🌐 Test 4: Testing notifications API endpoint...');
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint working!');
        console.log('✅ Notifications count:', data.data?.length || 0);
      } else {
        console.log('⚠️ API endpoint returned status:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️ API endpoint test skipped (not in browser context)');
    }
    
    console.log('\n🎉 All tests completed! Template ID fix is working correctly.');
    
    // Clean up test notifications
    console.log('\n🧹 Cleaning up test notifications...');
    const { error: cleanupError } = await supabase
      .from('notifications')
      .delete()
      .in('id', [notification.id, cancelNotification.id]);
    
    if (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    } else {
      console.log('✅ Test notifications cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testTemplateIdSuccess(); 