# Signup Error Troubleshooting Guide

## 🚨 **Error: "Database error saving new user"**

This error occurs when Supabase's authentication service encounters a database-level issue during user creation. Here's how to systematically debug and fix it.

## 🔍 **Step-by-Step Debugging**

### 1. **Check Supabase Dashboard Logs**

**Postgres Logs:**
1. Go to your Supabase dashboard
2. Navigate to **Logs > Postgres logs**
3. Look for errors around the time of signup attempts
4. Search for keywords: "trigger", "patients", "constraint", "permission"

**Auth Logs:**
1. Go to **Logs > Auth logs**
2. Check for authentication errors
3. Look for failed signup attempts

### 2. **Common Causes & Solutions**

#### **A. Trigger Function Errors**
```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Check trigger function
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

**Solution:** Run the migration `20240326000001_fix_trigger_errors.sql`

#### **B. RLS Policy Conflicts**
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'patients';
```

**Solution:** Ensure insert policies allow authenticated users

#### **C. Constraint Violations**
```sql
-- Check table constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'patients';
```

**Solution:** Verify foreign key and unique constraints

#### **D. Permission Issues**
```sql
-- Check table permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'patients';
```

**Solution:** Ensure proper permissions for auth users

### 3. **Database Structure Verification**

#### **Patients Table Structure**
```sql
-- Expected structure
CREATE TABLE patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### **Required RLS Policies**
```sql
-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Insert policy
CREATE POLICY "Users can insert their own profile"
ON patients FOR INSERT
WITH CHECK (auth.uid() = id);

-- Select policy
CREATE POLICY "Public profiles are viewable by everyone"
ON patients FOR SELECT
USING (true);
```

### 4. **Trigger Function Verification**

#### **Expected Trigger Function**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.patients (
        id, 
        full_name, 
        phone_number, 
        date_of_birth
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', 'Not provided'),
        COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE)
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating patient profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. **Environment Variables**

Ensure these are set in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 6. **Testing Steps**

#### **A. Test Database Connection**
```javascript
// Test script
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, serviceKey);

// Test basic connection
const { data, error } = await supabase
  .from('patients')
  .select('count')
  .limit(1);
```

#### **B. Test Trigger Function**
```sql
-- Manual test
SELECT public.create_patient_profile_manual(
  '00000000-0000-0000-0000-000000000000',
  'Test User',
  '1234567890',
  '1990-01-01'
);
```

#### **C. Test Signup Flow**
1. Use a simple email/password combination
2. Check browser console for errors
3. Monitor Supabase logs in real-time

### 7. **Quick Fixes**

#### **A. Apply Migrations**
```bash
# Apply all migrations
supabase db push

# Or apply specific migration
supabase db push --include-all
```

#### **B. Reset Database (Development Only)**
```bash
# Reset to clean state
supabase db reset
```

#### **C. Manual Profile Creation**
```javascript
// If trigger fails, manually create profile
const { data, error } = await supabase
  .rpc('create_patient_profile_manual', {
    user_id: userId,
    user_full_name: fullName,
    user_phone: phoneNumber,
    user_dob: dateOfBirth
  });
```

### 8. **Prevention Measures**

#### **A. Better Error Handling**
```javascript
// In signup form
try {
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone_number: phone || 'Not provided',
        date_of_birth: dateOfBirth,
      },
    },
  });

  if (result.error) {
    console.error('Signup error details:', result.error);
    // Handle specific error types
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

#### **B. Fallback Profile Creation**
```javascript
// If trigger fails, create profile manually
if (result.data.user) {
  try {
    await createUserProfile(result.data.user.id, {
      full_name: name,
      phone_number: phone || 'Not provided',
      date_of_birth: dateOfBirth
    });
  } catch (profileError) {
    console.error('Profile creation failed:', profileError);
    // Continue with signup but log the issue
  }
}
```

### 9. **Monitoring & Alerts**

#### **A. Set up Log Monitoring**
- Monitor Postgres logs for trigger errors
- Set up alerts for failed signups
- Track profile creation success rate

#### **B. Health Checks**
```javascript
// Regular health check
const healthCheck = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Database health check failed:', error);
    // Send alert
  }
};
```

## 🎯 **Summary**

The "Database error saving new user" error is typically caused by:
1. **Trigger function failures** (most common)
2. **RLS policy conflicts**
3. **Constraint violations**
4. **Permission issues**
5. **Data type mismatches**

**Immediate Actions:**
1. ✅ Check Supabase dashboard logs
2. ✅ Apply the trigger fix migration
3. ✅ Verify environment variables
4. ✅ Test with simple signup data
5. ✅ Monitor for recurring issues

**Long-term Prevention:**
1. ✅ Implement comprehensive error handling
2. ✅ Add fallback profile creation
3. ✅ Set up monitoring and alerts
4. ✅ Regular database health checks
5. ✅ Document all database changes 