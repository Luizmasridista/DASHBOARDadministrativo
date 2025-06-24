
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Use the current page URL without any localhost references
    const currentUrl = window.location.href;
    const redirectUrl = currentUrl.includes('localhost') ? currentUrl : `${window.location.origin}/`;
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
    console.log('Attempting Google login...');
    
    // Get the current URL and ensure it's not localhost
    const currentOrigin = window.location.origin;
    const currentUrl = window.location.href;
    
    // If we're on localhost, don't use it - use the current page URL instead
    let redirectUrl;
    if (currentOrigin.includes('localhost')) {
      // If somehow we're on localhost, redirect to root
      redirectUrl = currentUrl;
    } else {
      // Use the current origin
      redirectUrl = `${currentOrigin}/`;
    }
    
    console.log('Google login redirect URL:', redirectUrl);
    console.log('Current origin:', currentOrigin);
    console.log('Current URL:', currentUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    console.log('Google login result:', { error });
    return { error };
  };

  const signInWithMicrosoft = async () => {
    // Use current origin for redirect, avoiding localhost
    const currentOrigin = window.location.origin;
    const redirectUrl = currentOrigin.includes('localhost') ? window.location.href : `${currentOrigin}/`;
    
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
