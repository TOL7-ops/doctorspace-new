-- Add missing RLS policies for appointment management
-- This migration adds INSERT, UPDATE, and DELETE policies for appointments

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Patients can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can delete their own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their assigned appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;

-- INSERT policies
CREATE POLICY "Patients can insert their own appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- UPDATE policies
CREATE POLICY "Patients can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update their assigned appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Admins can update all appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- DELETE policies
CREATE POLICY "Patients can delete their own appointments"
  ON appointments FOR DELETE
  USING (auth.uid() = patient_id);

CREATE POLICY "Admins can delete all appointments"
  ON appointments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add policies for doctors to manage their appointments
CREATE POLICY "Doctors can view their assigned appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = doctor_id);

-- Add policies for notifications table (if not already present)
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id); 