import { createServerSupabase } from './supabase-server';
import type { User } from '@/types';

// Server-side function to get current user
export async function getCurrentUserServer() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('patients')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    console.error('No profile found for user:', user.id);
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    ...profile
  } as User;
} 