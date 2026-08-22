import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { profileService } from './profileService';

export interface LoginParams {
  email: string;
  password?: string;
}

export interface SignupParams {
  fullName: string;
  email: string;
  password?: string;
}

export const authService = {
  /**
   * Signs up a new user with Supabase Auth
   */
  async signUp(params: SignupParams) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are not configured.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password || 'VyuhaSecure2026!',
      options: {
        data: {
          full_name: params.fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.user?.id) {
      try {
        await profileService.upsertProfile({
          id: data.user.id,
          full_name: params.fullName,
          role: 'Supply Chain Manager',
        });
      } catch (profileErr) {
        console.warn('DB user profile creation warning:', profileErr);
      }
    }

    return data;
  },

  /**
   * Signs in an existing user with Supabase Auth
   */
  async signIn(params: LoginParams) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password || 'VyuhaSecure2026!',
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Signs out current user
   */
  async signOut() {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Retrieves active session
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  },

  /**
   * Retrieves current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },

  /**
   * Listens for auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return authListener.subscription;
  },
};
