
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
  needsPasswordCreation: boolean;
  setNeedsPasswordCreation: (value: boolean) => void;
  checkUserPasswordStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPasswordCreation, setNeedsPasswordCreation] = useState(false);

  const checkUserPasswordStatus = async () => {
    if (!user) return;

    console.log('=== CHECKING PASSWORD STATUS ===');
    console.log('User provider:', user.app_metadata?.provider);
    
    // Se não é usuário do Google, não precisa criar senha
    if (user.app_metadata?.provider !== 'google') {
      console.log('Not a Google user, no password needed');
      setNeedsPasswordCreation(false);
      return;
    }

    try {
      // Usa a função do banco para verificar se tem senha
      const { data: hasPassword, error } = await supabase.rpc('check_user_has_password');
      
      if (error) {
        console.error('Error checking password status:', error);
        // Em caso de erro, assume que precisa criar senha por segurança
        setNeedsPasswordCreation(true);
        return;
      }

      console.log('Database says user has password:', hasPassword);
      
      // Se é usuário Google e não tem senha, precisa criar
      const needsPassword = !hasPassword;
      console.log('User needs to create password:', needsPassword);
      setNeedsPasswordCreation(needsPassword);
      
    } catch (error) {
      console.error('Unexpected error checking password:', error);
      setNeedsPasswordCreation(true);
    }
    
    console.log('=== END PASSWORD CHECK ===');
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
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, will check password status');
          // Não chamamos checkUserPasswordStatus aqui para evitar loops
          // Vamos chamar depois que o estado for atualizado
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, resetting flags');
          setNeedsPasswordCreation(false);
        }
        
        setLoading(false);
        console.log('=== END AUTH STATE CHANGE ===');
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== INITIAL SESSION CHECK ===');
      console.log('Initial session exists:', !!session);
      console.log('Initial user exists:', !!session?.user);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('=== END INITIAL SESSION CHECK ===');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separar useEffect para verificar senha depois que o user estiver definido
  useEffect(() => {
    if (user && !loading) {
      checkUserPasswordStatus();
    }
  }, [user, loading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
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
    
    try {
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
    needsPasswordCreation,
    setNeedsPasswordCreation,
    checkUserPasswordStatus,
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
