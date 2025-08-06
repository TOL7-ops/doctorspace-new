// Script to fix PostgREST schema cache issue
// This script helps resolve the "Could not find the 'metadata' column" error

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixPostgrestCache() {
  console.log('🔧 Fixing PostgREST schema cache...');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('💡 Make sure you have a .env.local file with these variables.');
    return;
  }
  
  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('✅ Connected to Supabase with admin privileges');
    
    // Method 1: Try to reload PostgREST schema cache via SQL
    console.log('\n📋 Method 1: Attempting to reload PostgREST schema cache...');
    
    const { error: reloadError } = await supabase.rpc('reload_schema_cache');
    
    if (reloadError) {
      console.log('⚠️ Could not reload schema cache via RPC:', reloadError.message);
      console.log('💡 This is normal if the function doesn\'t exist.');
    } else {
      console.log('✅ Schema cache reloaded successfully!');
    }
    
    // Method 2: Check if metadata column exists
    console.log('\n🔍 Method 2: Checking metadata column status...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'notifications')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
    } else {
      console.log('✅ Current notifications table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      const metadataColumn = columns.find(col => col.column_name === 'metadata');
      if (metadataColumn) {
        console.log('✅ Metadata column exists in database');
      } else {
        console.log('❌ Metadata column missing from database');
      }
    }
    
    // Method 3: Test creating a notification with metadata
    console.log('\n🧪 Method 3: Testing notification creation with metadata...');
    
    const { data: testUser } = await supabase.auth.admin.listUsers();
    if (testUser && testUser.users.length > 0) {
      const userId = testUser.users[0].id;
      
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Test Notification',
          message: 'Testing metadata column',
          metadata: { test: true, timestamp: new Date().toISOString() }
        })
        .select()
        .single();
      
      if (notificationError) {
        console.error('❌ Error creating test notification:', notificationError);
        console.log('🔍 This confirms the PostgREST cache issue');
      } else {
        console.log('✅ Test notification created successfully!');
        console.log('✅ Metadata stored:', notification.metadata);
        
        // Clean up test notification
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notification.id);
        console.log('🧹 Test notification cleaned up');
      }
    }
    
    console.log('\n📋 Manual Fix Instructions:');
    console.log('If the metadata column exists but PostgREST still can\'t find it:');
    console.log('');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Settings > API');
    console.log('3. Click "Regenerate" next to "API Keys"');
    console.log('4. Or try restarting your Supabase project');
    console.log('');
    console.log('Alternative: Wait 5-10 minutes for PostgREST to refresh its cache automatically');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixPostgrestCache(); 