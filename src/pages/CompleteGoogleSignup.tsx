
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignupCompletion } from "@/components/auth/GoogleSignupCompletion";

const CompleteGoogleSignup = () => {
  const { user, isNewGoogleUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== COMPLETE GOOGLE SIGNUP PAGE ===');
    console.log('User exists:', !!user);
    console.log('Is new Google user:', isNewGoogleUser);
    console.log('User provider:', user?.app_metadata?.provider);
    console.log('User completed signup before:', user?.user_metadata?.completed_signup);
    
    // Se não é um novo usuário do Google ou não está logado, redireciona
    if (!user || !isNewGoogleUser) {
      console.log('Redirecting to auth - not a new Google user or no user');
      navigate("/auth");
    } else {
      console.log('Showing Google signup completion form');
    }
  }, [user, isNewGoogleUser, navigate]);

  // Se não é um novo usuário do Google, não renderiza nada
  if (!user || !isNewGoogleUser) {
    return null;
  }

  return <GoogleSignupCompletion />;
};

export default CompleteGoogleSignup;
