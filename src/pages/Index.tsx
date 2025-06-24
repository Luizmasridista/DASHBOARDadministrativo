
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import { GooglePasswordModal } from "@/components/auth/GooglePasswordModal";

const Index = () => {
  const { user, loading, isNewGoogleUser, needsPasswordCreation, setNeedsPasswordCreation, setIsNewGoogleUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index - Auth state:', { 
      user: !!user, 
      loading, 
      isNewGoogleUser,
      needsPasswordCreation,
      userProvider: user?.app_metadata?.provider,
      userCreatedAt: user?.created_at,
      userLastSignIn: user?.last_sign_in_at,
      hasPassword: user?.user_metadata?.has_password
    });
    
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to auth');
        navigate("/auth");
      } else if (isNewGoogleUser && !needsPasswordCreation) {
        console.log('New Google user but already has password, redirecting to complete signup');
        navigate("/complete-google-signup");
      } else if (!needsPasswordCreation) {
        console.log('User authenticated and has password, showing dashboard');
      } else {
        console.log('User needs to create password, showing modal');
      }
    }
  }, [user, loading, isNewGoogleUser, needsPasswordCreation, navigate]);

  const handlePasswordCreationComplete = () => {
    console.log('Password creation completed, updating flags');
    setNeedsPasswordCreation(false);
    setIsNewGoogleUser(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se o usuário precisa criar senha, mostra o modal
  if (needsPasswordCreation && user.email) {
    return (
      <>
        <Dashboard />
        <GooglePasswordModal
          isOpen={needsPasswordCreation}
          userEmail={user.email}
          onComplete={handlePasswordCreationComplete}
        />
      </>
    );
  }

  // Se é um novo usuário do Google mas não precisa criar senha, redireciona
  if (isNewGoogleUser) {
    return null;
  }

  return <Dashboard />;
};

export default Index;
