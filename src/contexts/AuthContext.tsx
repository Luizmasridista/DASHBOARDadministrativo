
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for:', email);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log('AuthProvider: Sign in result:', { error, data });
      
      return { error };
    } catch (err) {
      console.error('AuthProvider: Sign in error:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign up for:', email);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('AuthProvider: Using redirect URL:', redirectUrl);
      
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      console.log('AuthProvider: Sign up result:', { error, data });
      
      if (error) {
        console.error('AuthProvider: Sign up error:', error);
        return { error };
      } else {
        console.log('AuthProvider: Sign up successful, user created:', data.user);
        console.log('AuthProvider: Session created:', data.session);
        
        // Se não há sessão, significa que precisa confirmar email
        const needsConfirmation = !data.session;
        console.log('AuthProvider: Needs email confirmation:', needsConfirmation);
        
        return { error: null, needsConfirmation };
      }
    } catch (err) {
      console.error('AuthProvider: Sign up exception:', err);
      return { error: err };
    }
  };

  const resendConfirmation = async (email: string) => {
    console.log('AuthProvider: Resending confirmation email for:', email);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      console.log('AuthProvider: Resend confirmation result:', { error });
      return { error };
    } catch (err) {
      console.error('AuthProvider: Resend confirmation error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('AuthProvider: Attempting sign out');
    
    try {
      const { error } = await supabase.auth.signOut();
      console.log('AuthProvider: Sign out result:', { error });
    } catch (err) {
      console.error('AuthProvider: Sign out error:', err);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resendConfirmation,
  };

  console.log('AuthProvider: Current state:', { 
    user: user?.email, 
    hasSession: !!session, 
    loading 
  });

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
