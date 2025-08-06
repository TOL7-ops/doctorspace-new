-- Immediate fix for template_id constraint issue
-- This migration handles existing notification_templates table structure

-- First, let's check what columns exist in notification_templates
-- and add the missing ones safely

-- Add missing columns to notification_templates if they don't exist
DO $$
BEGIN
  -- Add title_template column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_templates' 
    AND column_name = 'title_template'
  ) THEN
    ALTER TABLE public.notification_templates ADD COLUMN title_template TEXT;
  END IF;

  -- Add message_template column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_templates' 
    AND column_name = 'message_template'
  ) THEN
    ALTER TABLE public.notification_templates ADD COLUMN message_template TEXT;
  END IF;

  -- Add notification_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_templates' 
    AND column_name = 'notification_type'
  ) THEN
    ALTER TABLE public.notification_templates ADD COLUMN notification_type TEXT DEFAULT 'system';
  END IF;

  -- Add priority column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_templates' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.notification_templates ADD COLUMN priority TEXT DEFAULT 'low';
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_templates' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.notification_templates ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add template_id column to notifications table if it doesn't exist
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL;

-- Create index for template_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON public.notifications(template_id);

-- Insert or update default templates
INSERT INTO public.notification_templates (name, title_template, message_template, notification_type, priority, is_active) VALUES
  ('system_alert', 'System Alert', '{message}', 'system', 'low', true)
ON CONFLICT (name) DO UPDATE SET
  title_template = COALESCE(EXCLUDED.title_template, notification_templates.title_template),
  message_template = COALESCE(EXCLUDED.message_template, notification_templates.message_template),
  notification_type = COALESCE(EXCLUDED.notification_type, notification_templates.notification_type),
  priority = COALESCE(EXCLUDED.priority, notification_templates.priority),
  is_active = COALESCE(EXCLUDED.is_active, notification_templates.is_active);

-- Update existing notifications to use the system_alert template
UPDATE public.notifications 
SET template_id = (
  SELECT id FROM public.notification_templates 
  WHERE name = 'system_alert' 
  LIMIT 1
)
WHERE template_id IS NULL;

-- Enable RLS on notification_templates if not already enabled
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_templates' 
    AND policyname = 'Allow read access to notification templates'
  ) THEN
    CREATE POLICY "Allow read access to notification templates"
      ON public.notification_templates FOR SELECT
      USING (true);
  END IF;
END $$; 