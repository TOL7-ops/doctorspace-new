import { supabase } from './supabase';

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

// Function to create or update user profile (client-side)
export async function createUserProfile(userId: string, profileData: {
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  medical_history?: string;
}) {
  const { data, error } = await supabase
    .from('patients')
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
}

// Function to ensure user profile exists (client-side)
export async function ensureUserProfile(userId: string) {
  const { data: existingProfile } = await supabase
    .from('patients')
    .select('*')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    // Create a default profile if none exists
    return await createUserProfile(userId, {
      full_name: 'Unknown User',
      phone_number: 'Not provided',
      date_of_birth: new Date().toISOString().split('T')[0]
    });
  }

  return existingProfile;
} 