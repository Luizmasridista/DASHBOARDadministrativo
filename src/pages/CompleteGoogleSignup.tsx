
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignupCompletion } from "@/components/auth/GoogleSignupCompletion";

const CompleteGoogleSignup = () => {
  const { user, needsPasswordCreation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== COMPLETE GOOGLE SIGNUP PAGE ===');
    console.log('User exists:', !!user);
    console.log('Needs password creation:', needsPasswordCreation);
    console.log('User provider:', user?.app_metadata?.provider);
    console.log('User completed signup before:', user?.user_metadata?.completed_signup);
    console.log('User has password:', user?.user_metadata?.has_password);
    
    // Se o usuário precisa criar senha, redireciona para a home (onde o modal aparecerá)
    if (user && needsPasswordCreation) {
      console.log('User needs password creation, redirecting to home for modal');
      navigate("/");
      return;
    }
    
    // Se não está logado, redireciona para auth
    if (!user) {
      console.log('No user found, redirecting to auth');
      navigate("/auth");
      return;
    }
    
    // Se é usuário Google mas não precisa criar senha, redireciona para home
    if (user && user.app_metadata?.provider === 'google' && !needsPasswordCreation) {
      console.log('Google user ready, redirecting to home');
      navigate("/");
      return;
    }
    
    console.log('Showing Google signup completion form');
  }, [user, needsPasswordCreation, navigate]);

  // Se não tem usuário ou precisa criar senha, não renderiza nada (vai redirecionar)
  if (!user || needsPasswordCreation) {
    return null;
  }

  // Se chegou aqui, é um usuário Google que ainda não completou o cadastro
  return <GoogleSignupCompletion />;
};

export default CompleteGoogleSignup;
