
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignupCompletion } from "@/components/auth/GoogleSignupCompletion";

const CompleteGoogleSignup = () => {
  const { user, isNewGoogleUser, needsPasswordCreation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== COMPLETE GOOGLE SIGNUP PAGE ===');
    console.log('User exists:', !!user);
    console.log('Is new Google user:', isNewGoogleUser);
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
    
    // Se não é um novo usuário do Google ou não está logado, redireciona
    if (!user || !isNewGoogleUser) {
      console.log('Redirecting to auth - not a new Google user or no user');
      navigate("/auth");
    } else {
      console.log('Showing Google signup completion form');
    }
  }, [user, isNewGoogleUser, needsPasswordCreation, navigate]);

  // Se não é um novo usuário do Google ou precisa criar senha, não renderiza nada
  if (!user || !isNewGoogleUser || needsPasswordCreation) {
    return null;
  }

  return <GoogleSignupCompletion />;
};

export default CompleteGoogleSignup;
