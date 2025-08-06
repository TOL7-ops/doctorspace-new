#!/usr/bin/env node

/**
 * Setup script for notifications table
 * This script ensures the notifications table exists with the basic structure
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupNotificationsTable() {
  console.log('🔧 Setting up notifications table...');

  try {
    // Check if notifications table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('❌ Notifications table does not exist. Creating it...');
      
      // Create the basic notifications table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          
          -- Enable RLS
          ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view their own notifications"
            ON public.notifications FOR SELECT
            USING (auth.uid() = user_id);
            
          CREATE POLICY "Users can update their own notifications"
            ON public.notifications FOR UPDATE
            USING (auth.uid() = user_id);
            
          CREATE POLICY "System can insert notifications"
            ON public.notifications FOR INSERT
            WITH CHECK (true);
        `
      });

      if (createError) {
        console.error('❌ Failed to create notifications table:', createError);
        return false;
      }

      console.log('✅ Notifications table created successfully');
    } else if (checkError) {
      console.error('❌ Error checking notifications table:', checkError);
      return false;
    } else {
      console.log('✅ Notifications table already exists');
    }

    // Test creating a notification
    console.log('🧪 Testing notification creation...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID for testing
    
    const { data: testNotification, error: testError } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        title: 'Test Notification',
        message: 'This is a test notification to verify the table structure.',
        read: false
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Failed to create test notification:', testError);
      return false;
    }

    console.log('✅ Test notification created successfully:', testNotification.id);

    // Clean up test notification
    await supabase
      .from('notifications')
      .delete()
      .eq('id', testNotification.id);

    console.log('✅ Test notification cleaned up');

    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

async function checkTableStructure() {
  console.log('🔍 Checking table structure...');

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error checking table structure:', error);
      return false;
    }

    console.log('✅ Table structure is valid');
    return true;

  } catch (error) {
    console.error('❌ Failed to check table structure:', error);
    return false;
  }
}

async function createSampleNotifications() {
  console.log('📝 Creating sample notifications...');

  try {
    // Get a real user ID from the database
    const { data: users, error: userError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('⚠️  No users found. Skipping sample notifications.');
      return;
    }

    const userId = users[0].id;

    // Create sample notifications
    const sampleNotifications = [
      {
        user_id: userId,
        title: 'Welcome to DoctorSpace',
        message: 'Welcome to DoctorSpace! Your account has been successfully created.',
        read: false
      },
      {
        user_id: userId,
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Smith has been confirmed for tomorrow at 10:00 AM.',
        read: false
      },
      {
        user_id: userId,
        title: 'Appointment Reminder',
        message: 'Reminder: You have an appointment with Dr. Johnson in 2 hours.',
        read: false
      }
    ];

    const { data, error } = await supabase
      .from('notifications')
      .insert(sampleNotifications)
      .select();

    if (error) {
      console.error('❌ Failed to create sample notifications:', error);
      return;
    }

    console.log(`✅ Created ${data.length} sample notifications`);

  } catch (error) {
    console.error('❌ Failed to create sample notifications:', error);
  }
}

async function main() {
  console.log('🚀 Starting notifications setup...\n');

  // Check if Supabase credentials are set
  if (supabaseUrl === 'your-supabase-url' || supabaseKey === 'your-supabase-anon-key') {
    console.log('❌ Please set your Supabase credentials:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
    return;
  }

  const setupSuccess = await setupNotificationsTable();
  
  if (!setupSuccess) {
    console.log('❌ Setup failed. Please check your database connection.');
    return;
  }

  const structureValid = await checkTableStructure();
  
  if (!structureValid) {
    console.log('❌ Table structure is invalid.');
    return;
  }

  await createSampleNotifications();

  console.log('\n✅ Notifications setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Test the notification system in your application');
  console.log('   2. Run the enhanced migration if you want additional features');
  console.log('   3. Configure notification preferences');
}

// Run the setup
main().catch(console.error);

module.exports = {
  setupNotificationsTable,
  checkTableStructure,
  createSampleNotifications
}; 