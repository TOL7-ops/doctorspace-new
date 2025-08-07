const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignupFlow() {
  console.log('🧪 Testing signup flow...\n');

  try {
    // Test 1: Check if patients table exists and has correct structure
    console.log('1. Checking patients table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'patients')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Error checking table structure:', tableError);
      return;
    }

    console.log('✅ Patients table structure:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test 2: Check RLS policies
    console.log('\n2. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'patients' })
      .catch(() => ({ data: null, error: 'Function not available' }));

    if (policiesError) {
      console.log('⚠️  Could not check policies directly, but table should have RLS enabled');
    } else {
      console.log('✅ RLS policies found:', policies?.length || 0);
    }

    // Test 3: Check if trigger exists
    console.log('\n3. Checking auth trigger...');
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation')
      .eq('event_object_table', 'users')
      .eq('event_object_schema', 'auth');

    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError);
    } else {
      const authTrigger = triggers.find(t => t.trigger_name === 'on_auth_user_created');
      if (authTrigger) {
        console.log('✅ Auth trigger found:', authTrigger.trigger_name);
      } else {
        console.log('❌ Auth trigger not found');
      }
    }

    // Test 4: Check existing patients
    console.log('\n4. Checking existing patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, full_name, created_at')
      .limit(5);

    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError);
    } else {
      console.log(`✅ Found ${patients?.length || 0} patients`);
      patients?.forEach(patient => {
        console.log(`   - ${patient.full_name} (${patient.id})`);
      });
    }

    // Test 5: Check auth users
    console.log('\n5. Checking auth users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching auth users:', usersError);
    } else {
      console.log(`✅ Found ${users?.users?.length || 0} auth users`);
      users?.users?.slice(0, 3).forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }

    console.log('\n✅ Signup flow test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the migration: supabase db push');
    console.log('2. Test the signup form in the browser');
    console.log('3. Check the logs for any errors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSignupFlow(); 