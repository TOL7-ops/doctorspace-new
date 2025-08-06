-- Fix PostgREST schema cache issue for metadata column
-- This migration ensures the metadata column exists and helps refresh PostgREST cache

-- First, ensure all the enhanced notification columns exist
DO $$
BEGIN
  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'metadata'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN metadata JSONB DEFAULT '{}';
    RAISE NOTICE 'Added metadata column to notifications table';
  ELSE
    RAISE NOTICE 'Metadata column already exists in notifications table';
  END IF;

  -- Add notification_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'notification_type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN notification_type TEXT DEFAULT 'system';
    RAISE NOTICE 'Added notification_type column to notifications table';
  ELSE
    RAISE NOTICE 'Notification_type column already exists in notifications table';
  END IF;

  -- Add priority column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'priority'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN priority TEXT DEFAULT 'low';
    RAISE NOTICE 'Added priority column to notifications table';
  ELSE
    RAISE NOTICE 'Priority column already exists in notifications table';
  END IF;

  -- Add expires_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'expires_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added expires_at column to notifications table';
  ELSE
    RAISE NOTICE 'Expires_at column already exists in notifications table';
  END IF;

  -- Add action_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'action_url'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN action_url TEXT;
    RAISE NOTICE 'Added action_url column to notifications table';
  ELSE
    RAISE NOTICE 'Action_url column already exists in notifications table';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON public.notifications USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

-- Create a function to reload PostgREST schema cache (if possible)
CREATE OR REPLACE FUNCTION reload_postgrest_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function attempts to trigger a schema cache reload
  -- Note: This may not work in all Supabase environments
  PERFORM pg_notify('postgrest', 'schema_reload');
  
  -- Alternative: Force a schema change notification
  NOTIFY postgrest_schema_reload;
  
  RAISE NOTICE 'PostgREST schema cache reload requested';
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION reload_postgrest_cache() TO anon;
GRANT EXECUTE ON FUNCTION reload_postgrest_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION reload_postgrest_cache() TO service_role;

-- Update existing notifications to have proper metadata
UPDATE public.notifications 
SET metadata = '{}'::jsonb
WHERE metadata IS NULL;

-- Update existing notifications to have proper notification_type
UPDATE public.notifications 
SET notification_type = 'system'
WHERE notification_type IS NULL;

-- Update existing notifications to have proper priority
UPDATE public.notifications 
SET priority = 'low'
WHERE priority IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.notifications.metadata IS 'Additional data in JSON format for enhanced notification features';
COMMENT ON COLUMN public.notifications.notification_type IS 'Type of notification: system, appointment, message, reminder';
COMMENT ON COLUMN public.notifications.priority IS 'Priority level: low, medium, high';
COMMENT ON COLUMN public.notifications.expires_at IS 'When the notification expires (optional)';
COMMENT ON COLUMN public.notifications.action_url IS 'URL to navigate to when notification is clicked (optional)';

-- Create a test function to verify metadata column works
CREATE OR REPLACE FUNCTION test_metadata_column()
RETURNS TABLE(
  column_exists BOOLEAN,
  column_type TEXT,
  test_result TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_notification_id UUID;
BEGIN
  -- Check if metadata column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'metadata'
    AND table_schema = 'public'
  ) INTO column_exists;
  
  -- Get column type
  SELECT data_type INTO column_type
  FROM information_schema.columns 
  WHERE table_name = 'notifications' 
  AND column_name = 'metadata'
  AND table_schema = 'public';
  
  -- Test inserting with metadata
  IF column_exists THEN
    BEGIN
      INSERT INTO public.notifications (
        user_id, 
        title, 
        message, 
        metadata
      ) VALUES (
        auth.uid(), 
        'Test Metadata', 
        'Testing metadata column functionality', 
        '{"test": true, "timestamp": "2024-01-01T00:00:00Z"}'::jsonb
      ) RETURNING id INTO test_notification_id;
      
      -- Clean up test notification
      DELETE FROM public.notifications WHERE id = test_notification_id;
      
      test_result := 'SUCCESS: Metadata column works correctly';
    EXCEPTION WHEN OTHERS THEN
      test_result := 'ERROR: ' || SQLERRM;
    END;
  ELSE
    test_result := 'ERROR: Metadata column does not exist';
  END IF;
  
  RETURN NEXT;
END;
$$;

-- Grant execute permission on test function
GRANT EXECUTE ON FUNCTION test_metadata_column() TO anon;
GRANT EXECUTE ON FUNCTION test_metadata_column() TO authenticated;
GRANT EXECUTE ON FUNCTION test_metadata_column() TO service_role;

-- Add RLS policies for new columns if they don't exist
DO $$
BEGIN
  -- Policy for metadata column access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can access metadata column'
  ) THEN
    CREATE POLICY "Users can access metadata column"
      ON public.notifications FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$; 