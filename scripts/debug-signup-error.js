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

async function debugSignupError() {
  console.log('🔍 Debugging Supabase Signup Error...\n');

  try {
    // 1. Check database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check patients table structure
    console.log('\n2. Checking patients table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'patients' })
      .catch(() => ({ data: null, error: 'Function not available' }));

    if (tableError) {
      console.log('⚠️  Could not get table info via RPC, checking manually...');
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'patients')
        .eq('table_schema', 'public');

      if (columnsError) {
        console.error('❌ Error checking table structure:', columnsError);
      } else {
        console.log('✅ Patients table structure:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${col.column_default ? `default: ${col.column_default}` : ''}`);
        });
      }
    } else {
      console.log('✅ Table structure retrieved via RPC');
    }

    // 3. Check RLS policies
    console.log('\n3. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('schemaname, tablename, policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'patients')
      .eq('schemaname', 'public');

    if (policiesError) {
      console.log('⚠️  Could not check policies directly, but table should have RLS enabled');
    } else {
      console.log(`✅ Found ${policies?.length || 0} RLS policies for patients table:`);
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
      });
    }

    // 4. Check triggers
    console.log('\n4. Checking database triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_statement')
      .eq('event_object_table', 'users')
      .eq('event_object_schema', 'auth');

    if (triggersError) {
      console.error('❌ Error checking triggers:', triggersError);
    } else {
      console.log(`✅ Found ${triggers?.length || 0} triggers on auth.users:`);
      triggers?.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation}`);
      });
    }

    // 5. Check for any existing auth users
    console.log('\n5. Checking existing auth users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching auth users:', usersError);
    } else {
      console.log(`✅ Found ${users?.users?.length || 0} auth users`);
      if (users?.users?.length > 0) {
        console.log('   Sample users:');
        users.users.slice(0, 3).forEach(user => {
          console.log(`   - ${user.email} (${user.id}) - Created: ${user.created_at}`);
        });
      }
    }

    // 6. Check for any existing patients
    console.log('\n6. Checking existing patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, full_name, created_at')
      .limit(5);

    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError);
    } else {
      console.log(`✅ Found ${patients?.length || 0} patients`);
      if (patients?.length > 0) {
        console.log('   Sample patients:');
        patients.forEach(patient => {
          console.log(`   - ${patient.full_name} (${patient.id}) - Created: ${patient.created_at}`);
        });
      }
    }

    // 7. Test trigger function manually
    console.log('\n7. Testing trigger function...');
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { data: triggerTest, error: triggerTestError } = await supabase
      .rpc('handle_new_user_test', { 
        user_id: testUserId,
        user_metadata: {
          full_name: 'Test User',
          phone_number: '1234567890',
          date_of_birth: '1990-01-01'
        }
      })
      .catch(() => ({ data: null, error: 'Function not available' }));

    if (triggerTestError) {
      console.log('⚠️  Could not test trigger function directly');
    } else {
      console.log('✅ Trigger function test completed');
    }

    // 8. Check for any recent errors in logs
    console.log('\n8. Checking for recent database errors...');
    console.log('📝 To check Supabase logs:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Logs > Postgres logs');
    console.log('   3. Look for errors around the time of signup attempts');
    console.log('   4. Also check Logs > Auth logs for authentication errors');

    console.log('\n🔧 Common issues and solutions:');
    console.log('1. Trigger function errors: Check if handle_new_user() function exists and works');
    console.log('2. RLS policy conflicts: Ensure insert policies allow authenticated users');
    console.log('3. Constraint violations: Check for unique constraints or foreign key issues');
    console.log('4. Permission issues: Verify database user has proper permissions');
    console.log('5. Data type mismatches: Ensure metadata fields match expected types');

    console.log('\n📋 Next steps:');
    console.log('1. Check Supabase dashboard logs for specific error messages');
    console.log('2. Run the migration: supabase db push');
    console.log('3. Test signup with a simple email/password combination');
    console.log('4. Check if the trigger function is working correctly');

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

// Run the debug script
debugSignupError(); 