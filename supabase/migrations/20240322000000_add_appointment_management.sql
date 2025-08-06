-- Add appointment ratings table
CREATE TABLE IF NOT EXISTS appointment_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(appointment_id, patient_id)
);

-- Add appointment cancellation reasons table
CREATE TABLE IF NOT EXISTS appointment_cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  cancelled_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add appointment rescheduling history table
CREATE TABLE IF NOT EXISTS appointment_reschedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  rescheduled_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_date DATE NOT NULL,
  old_start_time TIME NOT NULL,
  new_date DATE NOT NULL,
  new_start_time TIME NOT NULL,
  reason TEXT,
  rescheduled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_appointment_ratings_appointment_id ON appointment_ratings(appointment_id);
CREATE INDEX idx_appointment_ratings_doctor_id ON appointment_ratings(doctor_id);
CREATE INDEX idx_appointment_cancellations_appointment_id ON appointment_cancellations(appointment_id);
CREATE INDEX idx_appointment_reschedules_appointment_id ON appointment_reschedules(appointment_id);

-- Enable RLS
ALTER TABLE appointment_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reschedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointment_ratings
CREATE POLICY "Users can view their own ratings" ON appointment_ratings
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can create ratings for their appointments" ON appointment_ratings
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their own ratings" ON appointment_ratings
  FOR UPDATE USING (auth.uid() = patient_id);

-- Create RLS policies for appointment_cancellations
CREATE POLICY "Users can view cancellations for their appointments" ON appointment_cancellations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_cancellations.appointment_id 
      AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Users can create cancellations for their appointments" ON appointment_cancellations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_cancellations.appointment_id 
      AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );

-- Create RLS policies for appointment_reschedules
CREATE POLICY "Users can view reschedules for their appointments" ON appointment_reschedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_reschedules.appointment_id 
      AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Users can create reschedules for their appointments" ON appointment_reschedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_reschedules.appointment_id 
      AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_appointment_ratings_updated_at
  BEFORE UPDATE ON appointment_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if appointment can be cancelled (within 24 hours)
CREATE OR REPLACE FUNCTION can_cancel_appointment(appointment_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  appointment_date DATE;
  appointment_time TIME;
  current_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT date, start_time INTO appointment_date, appointment_time
  FROM appointments
  WHERE id = appointment_uuid;
  
  current_time := TIMEZONE('utc', NOW());
  
  -- Can cancel if appointment is more than 24 hours away
  RETURN (appointment_date || ' ' || appointment_time)::TIMESTAMP > current_time + INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to check if appointment can be rescheduled (within 24 hours)
CREATE OR REPLACE FUNCTION can_reschedule_appointment(appointment_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  appointment_date DATE;
  appointment_time TIME;
  current_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT date, start_time INTO appointment_date, appointment_time
  FROM appointments
  WHERE id = appointment_uuid;
  
  current_time := TIMEZONE('utc', NOW());
  
  -- Can reschedule if appointment is more than 24 hours away
  RETURN (appointment_date || ' ' || appointment_time)::TIMESTAMP > current_time + INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql; 