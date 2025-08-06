#!/usr/bin/env node

/**
 * Enhanced Test Script for Appointment Lifecycle Testing
 * Creates appointments with different statuses to test all features
 */

console.log('🎯 Enhanced Appointment Lifecycle Test Script');
console.log('Copy and paste this into your browser console:\n');

const enhancedTestScript = `
// Enhanced test appointments with different statuses
async function createEnhancedTestAppointments() {
  console.log('🔍 Creating enhanced test appointments...');
  
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
    
    // Create test appointments with different statuses
    const testAppointments = [
      // Upcoming appointments
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        start_time: '10:00:00',
        status: 'pending',
        notes: 'Test pending appointment for reschedule/cancel testing'
      },
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        start_time: '14:00:00',
        status: 'confirmed',
        notes: 'Test confirmed appointment for reschedule/cancel testing'
      },
      // Past completed appointments
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        start_time: '09:00:00',
        status: 'completed',
        notes: 'Test completed appointment for rating testing'
      },
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
        start_time: '15:00:00',
        status: 'completed',
        notes: 'Another completed appointment for rating testing'
      },
      // Cancelled appointments
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        start_time: '11:00:00',
        status: 'cancelled',
        notes: 'Test cancelled appointment for rebooking testing'
      },
      {
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_type_id: appointmentType.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
        start_time: '16:00:00',
        status: 'cancelled',
        notes: 'Another cancelled appointment for rebooking testing'
      }
    ];
    
    console.log('📝 Creating enhanced test appointments...');
    
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
    
    console.log('🎉 Enhanced test appointments created!');
    console.log('📋 Summary:');
    console.log('   - 2 Pending appointments (Upcoming tab)');
    console.log('   - 2 Confirmed appointments (Upcoming tab)');
    console.log('   - 2 Completed appointments (Past tab)');
    console.log('   - 2 Cancelled appointments (Cancelled tab)');
    console.log('💡 Refresh the appointments page to see all the new features!');
    
  } catch (error) {
    console.error('❌ Error creating enhanced test appointments:', error);
  }
}

// Clear all test appointments
async function clearAllTestAppointments() {
  console.log('🧹 Clearing all test appointments...');
  
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
      .like('notes', '%Test%');
    
    if (error) {
      console.error('❌ Error clearing test appointments:', error);
    } else {
      console.log('✅ Cleared all test appointments');
      console.log('💡 Refresh the appointments page');
    }
    
  } catch (error) {
    console.error('❌ Error clearing appointments:', error);
  }
}

// Show current appointments by status
async function showAppointmentsByStatus() {
  console.log('📋 Current appointments by status:');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .select(\`
        id,
        date,
        start_time,
        status,
        notes,
        doctor:doctors(full_name, specialization)
      \`)
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
    
    // Group by status
    const grouped = data.reduce((acc, appointment) => {
      if (!acc[appointment.status]) {
        acc[appointment.status] = [];
      }
      acc[appointment.status].push(appointment);
      return acc;
    }, {});
    
    Object.entries(grouped).forEach(([status, appointments]) => {
      console.log(\`\\n📌 \${status.toUpperCase()} (\${appointments.length}):\`);
      appointments.forEach((appointment, index) => {
        console.log(\`   \${index + 1}. \${appointment.doctor?.full_name} - \${appointment.date} \${appointment.start_time}\`);
        if (appointment.notes) {
          console.log(\`      Notes: \${appointment.notes}\`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error showing appointments:', error);
  }
}

// Test specific features
async function testSpecificFeatures() {
  console.log('🧪 Testing specific features...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ Please log in first');
      return;
    }
    
    // Test 1: Create a pending appointment for cancel/reschedule testing
    const { data: doctors } = await supabase.from('doctors').select('id').limit(1);
    const { data: appointmentTypes } = await supabase.from('appointment_types').select('id').limit(1);
    
    if (doctors && appointmentTypes) {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: doctors[0].id,
          appointment_type_id: appointmentTypes[0].id,
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '13:00:00',
          status: 'pending',
          notes: 'Test appointment for cancel/reschedule buttons'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create test appointment:', error);
      } else {
        console.log('✅ Created test appointment for cancel/reschedule testing');
        console.log('💡 Go to Upcoming tab to see the Cancel and Reschedule buttons');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing features:', error);
  }
}

// Available functions
console.log('Available functions:');
console.log('1. createEnhancedTestAppointments() - Create appointments with all statuses');
console.log('2. clearAllTestAppointments() - Clear all test appointments');
console.log('3. showAppointmentsByStatus() - Show current appointments grouped by status');
console.log('4. testSpecificFeatures() - Create specific test appointments for feature testing');
`;

console.log(enhancedTestScript);
console.log('\n📋 Instructions:');
console.log('1. Make sure you are logged into the application');
console.log('2. Open browser console (F12)');
console.log('3. Copy and paste the script above');
console.log('4. Run one of the functions:');
console.log('   - createEnhancedTestAppointments() to create all types of appointments');
console.log('   - clearAllTestAppointments() to clear test appointments');
console.log('   - showAppointmentsByStatus() to see current appointments');
console.log('   - testSpecificFeatures() to create specific test appointments');

module.exports = { enhancedTestScript }; 