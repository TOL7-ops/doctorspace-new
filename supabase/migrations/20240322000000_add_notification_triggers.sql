-- Create function to handle appointment notifications
CREATE OR REPLACE FUNCTION handle_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
  doctor_name TEXT;
  patient_name TEXT;
BEGIN
  -- Get doctor name
  SELECT full_name INTO doctor_name
  FROM doctors
  WHERE id = NEW.doctor_id;

  -- Get patient name
  SELECT full_name INTO patient_name
  FROM patients
  WHERE id = NEW.patient_id;

  -- Create notification for patient
  INSERT INTO notifications (user_id, title, message, read)
  VALUES (
    NEW.patient_id,
    'Appointment Confirmed',
    format('Your appointment with %s has been confirmed for %s at %s. Please arrive 10 minutes early.', 
           COALESCE(doctor_name, 'your doctor'), 
           NEW.date, 
           NEW.start_time),
    false
  );

  -- Create notification for doctor
  INSERT INTO notifications (user_id, title, message, read)
  VALUES (
    NEW.doctor_id,
    'New Appointment',
    format('New appointment with %s scheduled for %s at %s.', 
           COALESCE(patient_name, 'patient'), 
           NEW.date, 
           NEW.start_time),
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new appointments
DROP TRIGGER IF EXISTS appointment_notification_trigger ON appointments;
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_notification();

-- Create function to handle appointment status changes
CREATE OR REPLACE FUNCTION handle_appointment_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  doctor_name TEXT;
  patient_name TEXT;
BEGIN
  -- Only trigger on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get doctor name
  SELECT full_name INTO doctor_name
  FROM doctors
  WHERE id = NEW.doctor_id;

  -- Get patient name
  SELECT full_name INTO patient_name
  FROM patients
  WHERE id = NEW.patient_id;

  -- Create notification based on status change
  IF NEW.status = 'confirmed' THEN
    -- Notify patient
    INSERT INTO notifications (user_id, title, message, read)
    VALUES (
      NEW.patient_id,
      'Appointment Confirmed',
      format('Your appointment with %s on %s at %s has been confirmed.', 
             COALESCE(doctor_name, 'your doctor'), 
             NEW.date, 
             NEW.start_time),
      false
    );
  ELSIF NEW.status = 'cancelled' THEN
    -- Notify patient
    INSERT INTO notifications (user_id, title, message, read)
    VALUES (
      NEW.patient_id,
      'Appointment Cancelled',
      format('Your appointment with %s on %s at %s has been cancelled.', 
             COALESCE(doctor_name, 'your doctor'), 
             NEW.date, 
             NEW.start_time),
      false
    );
  ELSIF NEW.status = 'completed' THEN
    -- Notify patient
    INSERT INTO notifications (user_id, title, message, read)
    VALUES (
      NEW.patient_id,
      'Appointment Completed',
      format('Your appointment with %s on %s at %s has been completed. Thank you for choosing our services.', 
             COALESCE(doctor_name, 'your doctor'), 
             NEW.date, 
             NEW.start_time),
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment status changes
DROP TRIGGER IF EXISTS appointment_status_notification_trigger ON appointments;
CREATE TRIGGER appointment_status_notification_trigger
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_status_notification(); 