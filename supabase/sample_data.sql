-- Insert sample users (doctors)
INSERT INTO users (id, email, role) VALUES
  ('d1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'dr.smith@hospital.com', 'doctor'),
  ('e2c34d56-789a-5b1c-c2d3-4e5f6a7b8c9d', 'dr.jones@hospital.com', 'doctor'),
  ('f3d45e67-89ab-6c2d-d3e4-5f6a7b8c9d0e', 'dr.wilson@hospital.com', 'doctor'),
  ('g4e56f78-9abc-7d3e-e4f5-6a7b8c9d0e1f', 'dr.brown@hospital.com', 'doctor');

-- Insert sample doctors
INSERT INTO doctors (id, full_name, specialization, qualification, years_of_experience, available_days, available_hours, image_url) VALUES
  ('d1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'Dr. John Smith', 'Cardiology', 'MD, FACC', 15, 
   ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
   ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
   'https://example.com/dr-smith.jpg'),
  
  ('e2c34d56-789a-5b1c-c2d3-4e5f6a7b8c9d', 'Dr. Sarah Jones', 'Pediatrics', 'MD, FAAP', 12,
   ARRAY['Monday', 'Tuesday', 'Thursday', 'Friday'],
   ARRAY['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
   'https://example.com/dr-jones.jpg'),
  
  ('f3d45e67-89ab-6c2d-d3e4-5f6a7b8c9d0e', 'Dr. Michael Wilson', 'Orthopedics', 'MD, FAAOS', 18,
   ARRAY['Monday', 'Wednesday', 'Friday'],
   ARRAY['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
   'https://example.com/dr-wilson.jpg'),
  
  ('g4e56f78-9abc-7d3e-e4f5-6a7b8c9d0e1f', 'Dr. Emily Brown', 'Dermatology', 'MD, FAAD', 10,
   ARRAY['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
   ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
   'https://example.com/dr-brown.jpg');

-- Insert sample appointment types
INSERT INTO appointment_types (id, name, duration, description) VALUES
  ('at1', 'General Checkup', 30, 'Regular medical examination and health assessment'),
  ('at2', 'Specialist Consultation', 45, 'In-depth consultation with a specialist'),
  ('at3', 'Follow-up Visit', 20, 'Follow-up appointment to review progress'),
  ('at4', 'Emergency Consultation', 60, 'Urgent medical consultation'),
  ('at5', 'Vaccination', 15, 'Routine vaccination appointment');

-- Insert sample admin user
INSERT INTO users (id, email, role) VALUES
  ('a1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'admin@hospital.com', 'admin');

-- Insert sample patient user
INSERT INTO users (id, email, role) VALUES
  ('p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'patient@example.com', 'patient');

-- Insert sample patient
INSERT INTO patients (id, full_name, phone_number, date_of_birth) VALUES
  ('p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'John Doe', '+1234567890', '1990-01-15');

-- Insert sample appointment
INSERT INTO appointments (
  id,
  patient_id,
  doctor_id,
  appointment_type_id,
  date,
  start_time,
  status,
  notes
) VALUES (
  'ap1',
  'p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c',
  'd1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c',
  'at1',
  CURRENT_DATE + INTERVAL '1 day',
  '09:00',
  'pending',
  'First time visit'
); 

-- Insert sample messages
INSERT INTO messages (sender_id, recipient_id, sender_name, content) VALUES
  ('d1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'Dr. John Smith', 'Your test results are ready. Please schedule a follow-up appointment.'),
  ('e2c34d56-789a-5b1c-c2d3-4e5f6a7b8c9d', 'p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'Dr. Sarah Jones', 'Just checking in - how are you feeling after your last visit?'),
  ('f3d45e67-89ab-6c2d-d3e4-5f6a7b8c9d0e', 'p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'Dr. Michael Wilson', 'Your prescription has been renewed and sent to your pharmacy.');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message) VALUES
  ('p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'Appointment Reminder', 'You have an appointment with Dr. Smith tomorrow at 10:00 AM'),
  ('p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'New Message', 'Dr. Jones sent you a message about your recent visit'),
  ('p1b23c45-6789-4a0b-b1c2-3d4e5f6a7b8c', 'Prescription Ready', 'Your prescription is ready for pickup at your local pharmacy'); 