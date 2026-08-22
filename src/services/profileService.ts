import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Profile } from '../types/database';

export const profileService = {
  /**
   * Fetch user profile by ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('profiles' as any) as any)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Profile fetch error:', error.message);
      return null;
    }

    return data as Profile;
  },

  /**
   * Create or update user profile
   */
  async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('profiles' as any) as any)
      .upsert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data as Profile;
  },
};
