-- Fix for template_id constraint issue - handles actual table structure with body column
-- This migration works with the existing notification_templates table structure

-- First, let's check what columns actually exist and add only what's needed

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

-- Add unique constraint on name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notification_templates' 
    AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%name%'
  ) THEN
    ALTER TABLE public.notification_templates ADD CONSTRAINT notification_templates_name_unique UNIQUE (name);
  END IF;
END $$;

-- Add template_id column to notifications table if it doesn't exist
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL;

-- Create index for template_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON public.notifications(template_id);

-- Insert default templates safely using the actual table structure with body column
DO $$
BEGIN
  -- Insert system_alert template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.notification_templates WHERE name = 'system_alert'
  ) THEN
    INSERT INTO public.notification_templates (name, title, body, title_template, message_template, notification_type, priority, is_active) 
    VALUES ('system_alert', 'System Alert', 'System notification message', 'System Alert', '{message}', 'system', 'low', true);
  END IF;
  
  -- Insert appointment_confirmed template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.notification_templates WHERE name = 'appointment_confirmed'
  ) THEN
    INSERT INTO public.notification_templates (name, title, body, title_template, message_template, notification_type, priority, is_active) 
    VALUES ('appointment_confirmed', 'Appointment Confirmed', 'Your appointment has been confirmed', 'Appointment Confirmed', 'Your appointment with {doctor_name} has been confirmed for {date} at {time}. Please arrive 10 minutes early.', 'appointment', 'medium', true);
  END IF;
  
  -- Insert appointment_reminder template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.notification_templates WHERE name = 'appointment_reminder'
  ) THEN
    INSERT INTO public.notification_templates (name, title, body, title_template, message_template, notification_type, priority, is_active) 
    VALUES ('appointment_reminder', 'Appointment Reminder', 'Reminder for your upcoming appointment', 'Appointment Reminder', 'Reminder: You have an appointment with {doctor_name} on {date} at {time}.', 'appointment', 'medium', true);
  END IF;
  
  -- Insert appointment_cancelled template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.notification_templates WHERE name = 'appointment_cancelled'
  ) THEN
    INSERT INTO public.notification_templates (name, title, body, title_template, message_template, notification_type, priority, is_active) 
    VALUES ('appointment_cancelled', 'Appointment Cancelled', 'Your appointment has been cancelled', 'Appointment Cancelled', 'Your appointment with {doctor_name} on {date} at {time} has been cancelled.', 'appointment', 'high', true);
  END IF;
  
  -- Insert appointment_rescheduled template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.notification_templates WHERE name = 'appointment_rescheduled'
  ) THEN
    INSERT INTO public.notification_templates (name, title, body, title_template, message_template, notification_type, priority, is_active) 
    VALUES ('appointment_rescheduled', 'Appointment Rescheduled', 'Your appointment has been rescheduled', 'Appointment Rescheduled', 'Your appointment with {doctor_name} has been rescheduled to {new_date} at {new_time}.', 'appointment', 'medium', true);
  END IF;
  
  -- Insert new_message template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.notification_templates WHERE name = 'new_message'
  ) THEN
    INSERT INTO public.notification_templates (name, title, body, title_template, message_template, notification_type, priority, is_active) 
    VALUES ('new_message', 'New Message', 'You have received a new message', 'New Message', 'You have received a new message from {sender_name}.', 'message', 'low', true);
  END IF;
  
  -- Insert urgent_reminder template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.notification_templates WHERE name = 'urgent_reminder'
  ) THEN
    INSERT INTO public.notification_templates (name, title, body, title_template, message_template, notification_type, priority, is_active) 
    VALUES ('urgent_reminder', 'URGENT: Appointment Reminder', 'Urgent reminder for your appointment', 'URGENT: Appointment Reminder', 'URGENT: Your appointment with {doctor_name} is in {hours} hour(s) at {time}. Please confirm your attendance.', 'appointment', 'high', true);
  END IF;
END $$;

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

-- Add comments
COMMENT ON TABLE public.notification_templates IS 'Templates for creating consistent notifications';
COMMENT ON COLUMN public.notification_templates.title IS 'Default title for this template';
COMMENT ON COLUMN public.notification_templates.body IS 'Default body/message for this template';
COMMENT ON COLUMN public.notification_templates.title_template IS 'Template for notification title with placeholders';
COMMENT ON COLUMN public.notification_templates.message_template IS 'Template for notification message with placeholders';
COMMENT ON COLUMN public.notifications.template_id IS 'Reference to the notification template used for this notification'; 