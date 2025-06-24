
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignupCompletion } from "@/components/auth/GoogleSignupCompletion";

const CompleteGoogleSignup = () => {
  const { user, isNewGoogleUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se não é um novo usuário do Google ou não está logado, redireciona
    if (!user || !isNewGoogleUser) {
      navigate("/auth");
    }
  }, [user, isNewGoogleUser, navigate]);

  // Se não é um novo usuário do Google, não renderiza nada
  if (!user || !isNewGoogleUser) {
    return null;
  }

  return <GoogleSignupCompletion />;
};

export default CompleteGoogleSignup;
