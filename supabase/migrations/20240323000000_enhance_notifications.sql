-- Enhance notifications table with additional fields
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Create function to automatically clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired notifications (runs every hour)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-notifications', '0 * * * *', 'SELECT cleanup_expired_notifications();');

-- Create function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(user_id_param UUID)
RETURNS TABLE(
  total_count BIGINT,
  unread_count BIGINT,
  high_priority_count BIGINT,
  appointment_count BIGINT,
  message_count BIGINT,
  system_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE NOT read) as unread_count,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
    COUNT(*) FILTER (WHERE notification_type = 'appointment') as appointment_count,
    COUNT(*) FILTER (WHERE notification_type = 'message') as message_count,
    COUNT(*) FILTER (WHERE notification_type = 'system') as system_count
  FROM public.notifications
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark notifications as read by type
CREATE OR REPLACE FUNCTION mark_notifications_read_by_type(
  user_id_param UUID,
  notification_type_param TEXT
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = user_id_param 
    AND notification_type = notification_type_param
    AND NOT read;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get upcoming appointment reminders
CREATE OR REPLACE FUNCTION get_upcoming_appointment_reminders()
RETURNS TABLE(
  appointment_id UUID,
  patient_id UUID,
  doctor_id UUID,
  appointment_date DATE,
  appointment_time TIME,
  doctor_name TEXT,
  patient_name TEXT,
  hours_until_appointment NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    a.patient_id,
    a.doctor_id,
    a.date as appointment_date,
    a.start_time as appointment_time,
    d.full_name as doctor_name,
    p.full_name as patient_name,
    EXTRACT(EPOCH FROM (a.date::timestamp + a.start_time::time - NOW())) / 3600 as hours_until_appointment
  FROM public.appointments a
  JOIN public.doctors d ON a.doctor_id = d.id
  JOIN public.patients p ON a.patient_id = p.id
  WHERE a.status = 'confirmed'
    AND a.date >= CURRENT_DATE
    AND a.date <= CURRENT_DATE + INTERVAL '2 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = a.patient_id
        AND n.notification_type = 'appointment_reminder'
        AND n.metadata->>'appointment_id' = a.id::text
        AND n.created_at > NOW() - INTERVAL '12 hours'
    )
  ORDER BY a.date, a.start_time;
END;
$$ LANGUAGE plpgsql;

-- Update existing notifications to have proper types
UPDATE public.notifications 
SET notification_type = CASE 
  WHEN title ILIKE '%appointment%' THEN 'appointment'
  WHEN title ILIKE '%message%' THEN 'message'
  ELSE 'system'
END,
priority = CASE 
  WHEN title ILIKE '%urgent%' OR title ILIKE '%cancelled%' THEN 'high'
  WHEN title ILIKE '%reminder%' OR title ILIKE '%upcoming%' THEN 'medium'
  ELSE 'low'
END
WHERE notification_type = 'system';

-- Add comments to the table
COMMENT ON TABLE public.notifications IS 'Enhanced notifications table with support for different types, priorities, and metadata';
COMMENT ON COLUMN public.notifications.notification_type IS 'Type of notification: appointment, message, system, reminder';
COMMENT ON COLUMN public.notifications.priority IS 'Priority level: low, medium, high';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional data in JSON format';
COMMENT ON COLUMN public.notifications.expires_at IS 'When the notification expires and can be automatically deleted';
COMMENT ON COLUMN public.notifications.action_url IS 'URL to navigate to when notification is clicked'; 