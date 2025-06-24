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
  needsPasswordCreation: boolean;
  setNeedsPasswordCreation: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
  const [needsPasswordCreation, setNeedsPasswordCreation] = useState(false);

  const checkIfNewGoogleUser = (user: User): boolean => {
    console.log('=== CHECKING NEW GOOGLE USER ===');
    console.log('User provider:', user?.app_metadata?.provider);
    console.log('User created_at:', user?.created_at);
    console.log('User last_sign_in_at:', user?.last_sign_in_at);
    console.log('User completed_signup:', user?.user_metadata?.completed_signup);
    console.log('User has_password:', user?.user_metadata?.has_password);
    
    // Check if this is a Google user
    if (user?.app_metadata?.provider !== 'google') {
      console.log('Not a Google user, returning false');
      return false;
    }

    // Check if user has already completed password creation
    const hasCompletedSignup = user.user_metadata?.completed_signup === true;
    const hasPassword = user.user_metadata?.has_password === true;
    
    if (hasCompletedSignup && hasPassword) {
      console.log('User already has password, returning false');
      return false;
    }

    // More robust check for new Google users
    const createdAt = new Date(user.created_at);
    const lastSignIn = new Date(user.last_sign_in_at || user.created_at);
    const timeDifference = Math.abs(lastSignIn.getTime() - createdAt.getTime());
    const isVeryRecentUser = timeDifference < 10000; // 10 seconds
    
    console.log('Time difference (ms):', timeDifference);
    console.log('Is very recent user:', isVeryRecentUser);
    console.log('Has completed signup:', hasCompletedSignup);
    console.log('Has password:', hasPassword);
    
    const result = isVeryRecentUser || (!hasCompletedSignup || !hasPassword);
    console.log('Final result - is new Google user:', result);
    console.log('=== END CHECK ===');
    
    return result;
  };

  const checkIfNeedsPasswordCreation = (user: User): boolean => {
    console.log('=== CHECKING PASSWORD CREATION NEED ===');
    
    if (user?.app_metadata?.provider !== 'google') {
      console.log('Not a Google user, no password needed');
      return false;
    }

    const hasPassword = user.user_metadata?.has_password === true;
    const hasCompletedSignup = user.user_metadata?.completed_signup === true;
    
    console.log('Has password:', hasPassword);
    console.log('Has completed signup:', hasCompletedSignup);
    
    const needsPassword = !hasPassword || !hasCompletedSignup;
    console.log('Needs password creation:', needsPassword);
    console.log('=== END PASSWORD CHECK ===');
    
    return needsPassword;
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
          console.log('User signed in, checking status');
          const isNewGoogle = checkIfNewGoogleUser(session.user);
          const needsPassword = checkIfNeedsPasswordCreation(session.user);
          
          setIsNewGoogleUser(isNewGoogle);
          setNeedsPasswordCreation(needsPassword);
          
          if (needsPassword) {
            console.log('User needs to create password - showing modal');
          } else {
            console.log('User authentication complete - proceeding normally');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, resetting flags');
          setIsNewGoogleUser(false);
          setNeedsPasswordCreation(false);
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
        const needsPassword = checkIfNeedsPasswordCreation(session.user);
        
        setIsNewGoogleUser(isNewGoogle);
        setNeedsPasswordCreation(needsPassword);
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
    setNeedsPasswordCreation(false);
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
    needsPasswordCreation,
    setNeedsPasswordCreation,
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
