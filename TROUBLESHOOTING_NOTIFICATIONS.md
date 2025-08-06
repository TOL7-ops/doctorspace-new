# Notification System Troubleshooting Guide

## Issue: Notifications Not Working

If you're experiencing issues with the notification system, follow this step-by-step troubleshooting guide.

## 🔍 Step 1: Check Database Setup

### 1.1 Verify Notifications Table Exists

Run the setup script to ensure the notifications table exists:

```bash
cd Doctorspace-master
node scripts/setup-notifications.js
```

**Expected Output:**
```
🚀 Starting notifications setup...
🔧 Setting up notifications table...
✅ Notifications table already exists
🧪 Testing notification creation...
✅ Test notification created successfully
✅ Notifications setup completed successfully!
```

### 1.2 Manual Database Check

If the setup script fails, manually check your database:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run this query:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notifications'
);
```

**Expected Result:** `true`

## 🔍 Step 2: Check Environment Variables

### 2.1 Verify Supabase Credentials

Ensure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2.2 Test Database Connection

Create a simple test script to verify the connection:

```javascript
// test-connection.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
    } else {
      console.log('✅ Connection successful');
    }
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();
```

## 🔍 Step 3: Check Application Logs

### 3.1 Browser Console

1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Try to cancel an appointment
4. Look for error messages

**Common Errors:**
- `column "notification_type" does not exist` → Database migration not applied
- `relation "notifications" does not exist` → Table not created
- `permission denied` → RLS policies not set up

### 3.2 Network Tab

1. Go to the Network tab in developer tools
2. Try to cancel an appointment
3. Look for failed requests to Supabase

## 🔍 Step 4: Test Notification Functions

### 4.1 Manual Test

Run the test script to verify notification functions:

```bash
cd Doctorspace-master
node scripts/test-notifications.js
```

**Expected Output:**
```
🚀 Starting notification system tests...
🧪 Testing appointment notification...
✅ Appointment notification created: [id]
🧪 Testing cancellation notification...
✅ Cancellation notification created: [id]
✅ All tests completed successfully!
```

### 4.2 API Test

Test the notification API directly:

```bash
curl -X POST http://localhost:3000/api/notifications/reminders
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Scheduled reminders processed successfully"
}
```

## 🔍 Step 5: Fix Common Issues

### Issue 1: "Table notifications does not exist"

**Solution:**
```bash
# Run the setup script
node scripts/setup-notifications.js

# Or manually create the table in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Issue 2: "Column notification_type does not exist"

**Solution:**
The enhanced notification fields haven't been added. The system will fall back to basic notifications automatically, but you can add the enhanced fields:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'low',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
```

### Issue 3: "Permission denied"

**Solution:**
Set up Row Level Security policies:

```sql
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
```

### Issue 4: "Function createCancellationNotification is not defined"

**Solution:**
Check that the notification functions are properly imported:

```typescript
// In appointment-management.ts
import { 
  createNotification, 
  createCancellationNotification, 
  createRescheduleNotification 
} from '@/lib/notifications'
```

## 🔍 Step 6: Verify Real-time Subscriptions

### 6.1 Check Subscription Setup

In your browser console, look for these messages:
- `✅ Real-time subscription established`
- `🔔 New notification received`

### 6.2 Test Real-time Updates

1. Open two browser windows
2. Log in as the same user in both
3. Cancel an appointment in one window
4. Check if the notification appears in the other window

## 🔍 Step 7: Debug Mode

Enable debug logging by adding this to your browser console:

```javascript
localStorage.setItem('notification-debug', 'true');
```

Then refresh the page and check the console for detailed logs.

## 🔍 Step 8: Common Fixes

### Fix 1: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Fix 2: Clear Browser Cache

1. Open developer tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Check Supabase Status

1. Go to https://status.supabase.com/
2. Check if there are any service disruptions

### Fix 4: Verify User Authentication

Ensure the user is properly authenticated:

```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

## 🔍 Step 9: Advanced Debugging

### 9.1 Database Logs

Check Supabase logs:
1. Go to your Supabase dashboard
2. Navigate to Logs
3. Look for errors related to notifications

### 9.2 Function Debugging

Add debug logs to your notification functions:

```typescript
export async function createCancellationNotification(...args) {
  console.log('🔍 Creating cancellation notification with args:', args);
  try {
    // ... existing code
    console.log('✅ Cancellation notification created successfully');
  } catch (error) {
    console.error('❌ Failed to create cancellation notification:', error);
    throw error;
  }
}
```

## 🔍 Step 10: Get Help

If you're still experiencing issues:

1. **Check the logs** in browser console and Supabase dashboard
2. **Run the test scripts** to isolate the issue
3. **Verify your setup** using the setup script
4. **Check the documentation** in `NOTIFICATION_SYSTEM.md`

### Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| `relation "notifications" does not exist` | Run `node scripts/setup-notifications.js` |
| `column "notification_type" does not exist` | Add enhanced fields or use basic notifications |
| `permission denied` | Set up RLS policies |
| `function does not exist` | Check imports and function definitions |
| `network error` | Check Supabase URL and API key |

---

**Need more help?** Check the main documentation in `NOTIFICATION_SYSTEM.md` or create an issue with the specific error message and steps to reproduce. 