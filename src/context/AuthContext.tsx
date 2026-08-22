import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authService, LoginParams, SignupParams } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  login: (params: LoginParams) => Promise<any>;
  signup: (params: SignupParams) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Restore active session on mount / page refresh
    authService.getSession().then((activeSession) => {
      setSession(activeSession);
      setUser(activeSession?.user || null);
      setLoading(false);
    });

    // Listen for real-time auth changes
    const subscription = authService.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const login = async (params: LoginParams) => {
    const data = await authService.signIn(params);
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return data;
  };

  const signup = async (params: SignupParams) => {
    const data = await authService.signUp(params);
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return data;
  };

  const logout = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
