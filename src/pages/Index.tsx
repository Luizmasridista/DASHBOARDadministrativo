
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import { GooglePasswordModal } from "@/components/auth/GooglePasswordModal";

const Index = () => {
  const { user, loading, needsPasswordCreation, setNeedsPasswordCreation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index - Auth state:', { 
      user: !!user, 
      loading, 
      needsPasswordCreation,
      userProvider: user?.app_metadata?.provider
    });
    
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to auth');
        navigate("/auth");
      } else if (needsPasswordCreation) {
        console.log('User needs to create password, showing modal');
        // Modal será mostrado, usuário fica nesta página
      } else {
        console.log('User authenticated and ready, showing dashboard');
      }
    }
  }, [user, loading, needsPasswordCreation, navigate]);

  const handlePasswordCreationComplete = async () => {
    console.log('Password creation completed, updating flags');
    setNeedsPasswordCreation(false);
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

  // Se o usuário precisa criar senha, mostra o modal SOBRE o dashboard
  // Isso bloqueia totalmente o acesso até que a senha seja criada
  return (
    <>
      <Dashboard />
      {needsPasswordCreation && user.email && (
        <GooglePasswordModal
          isOpen={needsPasswordCreation}
          userEmail={user.email}
          onComplete={handlePasswordCreationComplete}
        />
      )}
    </>
  );
};

export default Index;
