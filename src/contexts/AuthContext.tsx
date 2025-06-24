
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithMicrosoft: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isNewGoogleUser: boolean;
  setIsNewGoogleUser: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);

  const checkIfNewGoogleUser = (user: User): boolean => {
    console.log('=== CHECKING NEW GOOGLE USER ===');
    console.log('User provider:', user?.app_metadata?.provider);
    console.log('User created_at:', user?.created_at);
    console.log('User last_sign_in_at:', user?.last_sign_in_at);
    console.log('User email_confirmed_at:', user?.email_confirmed_at);
    console.log('User phone_confirmed_at:', user?.phone_confirmed_at);
    
    // Check if this is a Google user
    if (user?.app_metadata?.provider !== 'google') {
      console.log('Not a Google user, returning false');
      return false;
    }

    // More robust check for new Google users
    // If created_at and last_sign_in_at are very close (within 10 seconds), it's likely a new user
    const createdAt = new Date(user.created_at);
    const lastSignIn = new Date(user.last_sign_in_at || user.created_at);
    const timeDifference = Math.abs(lastSignIn.getTime() - createdAt.getTime());
    const isVeryRecentUser = timeDifference < 10000; // 10 seconds
    
    console.log('Time difference (ms):', timeDifference);
    console.log('Is very recent user:', isVeryRecentUser);
    
    // Additional check: if email is not confirmed for Google users, they might be new
    const emailNotConfirmed = !user.email_confirmed_at;
    console.log('Email not confirmed:', emailNotConfirmed);
    
    // Check if user has user_metadata indicating they completed signup before
    const hasCompletedSignup = user.user_metadata?.completed_signup === true;
    console.log('Has completed signup:', hasCompletedSignup);
    
    const result = isVeryRecentUser && !hasCompletedSignup;
    console.log('Final result - is new Google user:', result);
    console.log('=== END CHECK ===');
    
    return result;
  };

  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session exists:', !!session);
        console.log('User exists:', !!session?.user);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking if new Google user');
          const isNewGoogle = checkIfNewGoogleUser(session.user);
          setIsNewGoogleUser(isNewGoogle);
          
          if (isNewGoogle) {
            console.log('New Google user detected - will redirect to completion');
          } else {
            console.log('Existing user or not Google - proceeding normally');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, resetting new Google user flag');
          setIsNewGoogleUser(false);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('=== END AUTH STATE CHANGE ===');
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== INITIAL SESSION CHECK ===');
      console.log('Initial session exists:', !!session);
      console.log('Initial user exists:', !!session?.user);
      
      if (session?.user) {
        const isNewGoogle = checkIfNewGoogleUser(session.user);
        setIsNewGoogleUser(isNewGoogle);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('=== END INITIAL SESSION CHECK ===');
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Always use the Lovable domain for redirect
    const redirectUrl = 'https://dashkaizen-financeiro.lovable.app/';
    console.log('Sign up redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    console.log('=== GOOGLE LOGIN DEBUG START ===');
    console.log('Current location:', window.location);
    console.log('User agent:', navigator.userAgent);
    
    try {
      // Try the most basic Google OAuth call first
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://dashkaizen-financeiro.lovable.app/',
        }
      });
      
      console.log('Supabase OAuth response:', { data, error });
      
      if (error) {
        console.error('Supabase OAuth error details:', {
          message: error.message,
          status: error.status,
          details: error
        });
      }
      
      return { error };
      
    } catch (err) {
      console.error('Unexpected error during Google login:', err);
      return { error: err };
    } finally {
      console.log('=== GOOGLE LOGIN DEBUG END ===');
    }
  };

  const signInWithMicrosoft = async () => {
    // Always use the Lovable domain for redirect
    const redirectUrl = 'https://dashkaizen-financeiro.lovable.app/';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsNewGoogleUser(false);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithMicrosoft,
    signOut,
    isNewGoogleUser,
    setIsNewGoogleUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
