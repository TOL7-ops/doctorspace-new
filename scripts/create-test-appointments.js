#!/usr/bin/env node

/**
 * Script to create test appointments for testing cancel/reschedule functionality
 * This script can be run in the browser console to create test appointments
 */

console.log('📅 Create Test Appointments Script');
console.log('Copy and paste this into your browser console:\n');

const testScript = `
// Create test appointments
async function createTestAppointments() {
  console.log('🔍 Creating test appointments...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Get a doctor for the appointment
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('id, full_name, specialization')
      .limit(1);
    
    if (doctorError || !doctors || doctors.length === 0) {
      console.log('❌ No doctors found. Please add a doctor first.');
      return;
    }
    
    const doctor = doctors[0];
    console.log('✅ Using doctor:', doctor.full_name);
    
    // Get appointment type
    const { data: appointmentTypes, error: typeError } = await supabase
      .from('appointment_types')
      .select('id, name')
      .limit(1);
    
    if (typeError || !appointmentTypes || appointmentTypes.length === 0) {
      console.log('❌ No appointment types found. Please add appointment types first.');
      return;
    }
    
    const appointmentType = appointmentTypes[0];
    console.log('✅ Using appointment type:', appointmentType.name);
    
    // Create test appointments
    const testAppointments = [
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        start_time: '10:00:00',
        status: 'pending',
        notes: 'Test appointment for cancel/reschedule functionality'
      },
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        start_time: '14:00:00',
        status: 'confirmed',
        notes: 'Test confirmed appointment'
      }
    ];
    
    console.log('📝 Creating test appointments...');
    
    for (const appointment of testAppointments) {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create appointment:', error);
      } else {
        console.log('✅ Created appointment:', data.id, 'Status:', data.status, 'Date:', data.date);
      }
    }
    
    console.log('🎉 Test appointments created!');
    console.log('💡 Refresh the appointments page to see the new appointments with cancel/reschedule buttons');
    
  } catch (error) {
    console.error('❌ Error creating test appointments:', error);
  }
}

// Clear cancelled appointments (optional)
async function clearCancelledAppointments() {
  console.log('🧹 Clearing cancelled appointments...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('patient_id', user.id)
      .eq('status', 'cancelled');
    
    if (error) {
      console.error('❌ Error clearing cancelled appointments:', error);
    } else {
      console.log('✅ Cleared cancelled appointments');
      console.log('💡 Refresh the appointments page');
    }
    
  } catch (error) {
    console.error('❌ Error clearing appointments:', error);
  }
}

// Show current appointments
async function showCurrentAppointments() {
  console.log('📋 Current appointments:');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        start_time,
        status,
        doctor:doctors(full_name, specialization)
      `)
      .eq('patient_id', user.id)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching appointments:', error);
      return;
    }
    
    if (data.length === 0) {
      console.log('📭 No appointments found');
      return;
    }
    
    data.forEach((appointment, index) => {
      console.log(\`\${index + 1}. \${appointment.doctor?.full_name} - \${appointment.date} \${appointment.start_time} (\${appointment.status})\`);
    });
    
  } catch (error) {
    console.error('❌ Error showing appointments:', error);
  }
}

// Available functions
console.log('Available functions:');
console.log('1. createTestAppointments() - Create test appointments');
console.log('2. clearCancelledAppointments() - Clear cancelled appointments');
console.log('3. showCurrentAppointments() - Show current appointments');
`;

console.log(testScript);
console.log('\n📋 Instructions:');
console.log('1. Make sure you are logged into the application');
console.log('2. Open browser console (F12)');
console.log('3. Copy and paste the script above');
console.log('4. Run one of the functions:');
console.log('   - createTestAppointments() to create test appointments');
console.log('   - clearCancelledAppointments() to clear cancelled appointments');
console.log('   - showCurrentAppointments() to see current appointments');

module.exports = { testScript }; 