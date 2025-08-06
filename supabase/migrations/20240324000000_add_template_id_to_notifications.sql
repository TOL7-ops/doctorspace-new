-- Add template_id column to notifications table
-- This migration adds support for notification templates

-- First, create a notification_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  notification_type TEXT DEFAULT 'system',
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to existing notification_templates table if they don't exist
ALTER TABLE public.notification_templates 
ADD COLUMN IF NOT EXISTS title_template TEXT,
ADD COLUMN IF NOT EXISTS message_template TEXT,
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'low',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add constraint for priority if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'notification_templates_priority_check'
  ) THEN
    ALTER TABLE public.notification_templates 
    ADD CONSTRAINT notification_templates_priority_check 
    CHECK (priority IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Add template_id column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL;

-- Create index for template_id
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON public.notifications(template_id);

-- Insert default notification templates (only if they don't exist)
INSERT INTO public.notification_templates (name, title_template, message_template, notification_type, priority) VALUES
  ('appointment_confirmed', 'Appointment Confirmed', 'Your appointment with {doctor_name} has been confirmed for {date} at {time}. Please arrive 10 minutes early.', 'appointment', 'medium'),
  ('appointment_reminder', 'Appointment Reminder', 'Reminder: You have an appointment with {doctor_name} on {date} at {time}.', 'appointment', 'medium'),
  ('appointment_cancelled', 'Appointment Cancelled', 'Your appointment with {doctor_name} on {date} at {time} has been cancelled.', 'appointment', 'high'),
  ('appointment_rescheduled', 'Appointment Rescheduled', 'Your appointment with {doctor_name} has been rescheduled to {new_date} at {new_time}.', 'appointment', 'medium'),
  ('new_message', 'New Message', 'You have received a new message from {sender_name}.', 'message', 'low'),
  ('system_alert', 'System Alert', '{message}', 'system', 'low'),
  ('urgent_reminder', 'URGENT: Appointment Reminder', 'URGENT: Your appointment with {doctor_name} is in {hours} hour(s) at {time}. Please confirm your attendance.', 'appointment', 'high')
ON CONFLICT (name) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  notification_type = EXCLUDED.notification_type,
  priority = EXCLUDED.priority,
  is_active = true;

-- Update existing notifications to use default template
UPDATE public.notifications 
SET template_id = (
  SELECT id FROM public.notification_templates 
  WHERE name = 'system_alert' 
  LIMIT 1
)
WHERE template_id IS NULL;

-- Enable RLS on notification_templates
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to notification templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Allow insert access to notification templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Allow update access to notification templates" ON public.notification_templates;

-- Create RLS policies for notification_templates
CREATE POLICY "Allow read access to notification templates"
  ON public.notification_templates FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to notification templates"
  ON public.notification_templates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update access to notification templates"
  ON public.notification_templates FOR UPDATE
  USING (true);

-- Add trigger to update updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_notification_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_notification_templates_updated_at
      BEFORE UPDATE ON public.notification_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE public.notification_templates IS 'Templates for creating consistent notifications';
COMMENT ON COLUMN public.notification_templates.title_template IS 'Template for notification title with placeholders';
COMMENT ON COLUMN public.notification_templates.message_template IS 'Template for notification message with placeholders';
COMMENT ON COLUMN public.notifications.template_id IS 'Reference to the notification template used for this notification'; 