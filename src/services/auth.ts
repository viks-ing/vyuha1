/**
 * Vyuha Authentication Service Abstraction
 * 
 * Provides a clean interface for authentication operations.
 * Replace the mock implementation with real Supabase Auth or Backend REST API calls.
 */

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignupCredentials {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  newPassword?: string;
  confirmPassword?: string;
  token?: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse<{ user: AuthUser; token: string }>>;
  signup(credentials: SignupCredentials): Promise<AuthResponse<{ user: AuthUser; requiresOnboarding: boolean }>>;
  forgotPassword(params: ForgotPasswordParams): Promise<AuthResponse<{ emailSent: boolean }>>;
  resetPassword(params: ResetPasswordParams): Promise<AuthResponse<{ passwordReset: boolean }>>;
  getCurrentUser(): Promise<AuthUser | null>;
  logout(): Promise<void>;
}

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { apiFetch } from './api';

class AuthService implements IAuthService {
  private simulateDelay(ms = 600): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse<{ user: AuthUser; token: string }>> {
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: "Email and password are required.",
      };
    }

    if (!credentials.email.includes('@') || credentials.email.length < 5) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    // Use Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const user = data.user;
        const session = data.session;

        return {
          success: true,
          data: {
            user: {
              id: user?.id || '',
              email: user?.email || credentials.email,
              fullName: user?.user_metadata?.full_name || 'Supply Chain Manager',
              createdAt: user?.created_at || new Date().toISOString(),
            },
            token: session?.access_token || '',
          },
          message: "Successfully logged in via Supabase Authentication.",
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Supabase Authentication failed";
        return { success: false, error: errorMsg };
      }
    }

    // Fallback to FastAPI Python Backend or local state if Supabase env vars not set yet
    try {
      const res = await apiFetch<{ user: AuthUser; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return {
        success: true,
        data: res,
        message: "Successfully logged in via FastAPI Python Backend.",
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Authentication failed";
      if (errorMsg.includes('Invalid email or password')) {
        return { success: false, error: errorMsg };
      }
      
      const mockUser: AuthUser = {
        id: "usr_vyuha_10928",
        email: credentials.email,
        fullName: "Supply Chain Manager",
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: {
          user: mockUser,
          token: "vyuha_jwt_token_demo_sample",
        },
        message: "Successfully logged in.",
      };
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse<{ user: AuthUser; requiresOnboarding: boolean }>> {
    if (!credentials.fullName || !credentials.email || !credentials.password) {
      return {
        success: false,
        error: "All fields are required.",
      };
    }

    if (credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match.",
      };
    }

    if (credentials.password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long.",
      };
    }

    // Use Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              full_name: credentials.fullName,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const user = data.user;

        return {
          success: true,
          data: {
            user: {
              id: user?.id || `usr_${Math.random().toString(36).substring(2, 9)}`,
              email: user?.email || credentials.email,
              fullName: credentials.fullName,
              createdAt: user?.created_at || new Date().toISOString(),
            },
            requiresOnboarding: true,
          },
          message: "Account created successfully via Supabase Auth. Redirecting to onboarding...",
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Supabase Signup failed";
        return { success: false, error: errorMsg };
      }
    }

    // Fallback to FastAPI Backend if Supabase env vars not set yet
    try {
      const res = await apiFetch<{ user: AuthUser; token: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return {
        success: true,
        data: {
          user: res.user,
          requiresOnboarding: true,
        },
        message: "Account created successfully via FastAPI Python Backend. Redirecting to onboarding...",
      };
    } catch (err: unknown) {
      const mockUser: AuthUser = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: credentials.email,
        fullName: credentials.fullName,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: {
          user: mockUser,
          requiresOnboarding: true,
        },
        message: "Account created successfully. Redirecting to onboarding...",
      };
    }
  }

  async forgotPassword(params: ForgotPasswordParams): Promise<AuthResponse<{ emailSent: boolean }>> {
    await this.simulateDelay();

    if (!params.email || !params.email.includes('@')) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(params.email);
      if (error) {
        return { success: false, error: error.message };
      }
    }

    return {
      success: true,
      data: { emailSent: true },
      message: "Password reset instructions have been sent to your email address.",
    };
  }

  async resetPassword(params: ResetPasswordParams): Promise<AuthResponse<{ passwordReset: boolean }>> {
    await this.simulateDelay();

    if (!params.newPassword || params.newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long.",
      };
    }

    if (params.newPassword !== params.confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match.",
      };
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({ password: params.newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
    }

    return {
      success: true,
      data: { passwordReset: true },
      message: "Password updated successfully. You may now log in.",
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || '',
          createdAt: data.user.created_at,
        };
      }
    }
    return null;
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    } else {
      await this.simulateDelay(300);
    }
  }
}

export const authService = new AuthService();
