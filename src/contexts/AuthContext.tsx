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

    console.log('=== DETAILED PASSWORD CHECK ===');
    console.log('User ID:', user.id);
    console.log('User email:', user.email);
    console.log('User provider:', user.app_metadata?.provider);
    console.log('User providers (all):', user.app_metadata?.providers);
    console.log('User metadata:', user.user_metadata);
    console.log('User email confirmed:', user.email_confirmed_at);
    console.log('User created at:', user.created_at);

    // Se não é usuário do Google, não precisa criar senha
    if (user.app_metadata?.provider !== 'google') {
      console.log('Not a Google user, no password needed');
      setNeedsPasswordCreation(false);
      return;
    }

    // Verificação mais específica para usuários Google
    const isGoogleUser = user.app_metadata?.providers?.includes('google') || 
                        user.app_metadata?.provider === 'google';
    
    console.log('Is Google user?', isGoogleUser);

    if (!isGoogleUser) {
      console.log('Not confirmed as Google user, no password needed');
      setNeedsPasswordCreation(false);
      return;
    }

    try {
      // Usa a função do banco para verificar se tem senha
      const { data: hasPassword, error } = await supabase.rpc('check_user_has_password');
      
      console.log('Database password check result:', hasPassword);
      console.log('Database password check error:', error);

      if (error) {
        console.error('Error checking password status:', error);
        // Para usuários Google, se houver erro, assumimos que precisa criar senha
        console.log('Error occurred, assuming Google user needs password');
        setNeedsPasswordCreation(true);
        return;
      }

      // Verificação adicional: se é usuário Google recém-criado (menos de 5 minutos)
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      console.log('User created at:', userCreatedAt);
      console.log('Current time:', now);
      console.log('Minutes since creation:', minutesDiff);

      // Se é usuário Google recém-criado E não tem senha, definitivamente precisa criar
      const isRecentGoogleUser = minutesDiff < 5;
      console.log('Is recent Google user (< 5 min)?', isRecentGoogleUser);

      if (isRecentGoogleUser && !hasPassword) {
        console.log('Recent Google user without password - NEEDS PASSWORD');
        setNeedsPasswordCreation(true);
        return;
      }

      // Se não é recente, mas ainda não tem senha, também precisa criar
      if (!hasPassword) {
        console.log('Google user without password - NEEDS PASSWORD');
        setNeedsPasswordCreation(true);
        return;
      }

      console.log('Google user already has password - NO NEED');
      setNeedsPasswordCreation(false);
      
    } catch (error) {
      console.error('Unexpected error checking password:', error);
      // Em caso de erro para usuários Google, assumimos que precisa criar senha
      setNeedsPasswordCreation(true);
    }
    
    console.log('Final needsPasswordCreation state:', needsPasswordCreation);
    console.log('=== END DETAILED PASSWORD CHECK ===');
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
        
        if (session?.user) {
          console.log('User provider from session:', session.user.app_metadata?.provider);
          console.log('User email from session:', session.user.email);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, will check password status after state update');
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
      
      if (session?.user) {
        console.log('Initial user provider:', session.user.app_metadata?.provider);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('=== END INITIAL SESSION CHECK ===');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar senha depois que o user estiver definido
  useEffect(() => {
    if (user && !loading) {
      console.log('User state updated, triggering password check...');
      // Pequeno delay para garantir que tudo está estabilizado
      setTimeout(() => {
        checkUserPasswordStatus();
      }, 1000);
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
