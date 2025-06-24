
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import { GooglePasswordModal } from "@/components/auth/GooglePasswordModal";

const Index = () => {
  const { user, loading, needsPasswordCreation, setNeedsPasswordCreation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 === INDEX PAGE STATE ===');
    console.log('🏠 User exists:', !!user);
    console.log('🏠 Loading:', loading);
    console.log('🏠 Needs password creation:', needsPasswordCreation);
    console.log('🏠 User provider:', user?.app_metadata?.provider);
    console.log('🏠 User email:', user?.email);
    console.log('🏠 User created at:', user?.created_at);
    
    if (!loading) {
      if (!user) {
        console.log('🏠 No user, redirecting to auth');
        navigate("/auth");
      } else if (needsPasswordCreation) {
        console.log('🏠 ✅ User needs to create password, modal will show');
      } else {
        console.log('🏠 User authenticated and ready, showing dashboard');
      }
    }
  }, [user, loading, needsPasswordCreation, navigate]);

  const handlePasswordCreationComplete = async () => {
    console.log('🏠 Password creation completed, updating flags');
    setNeedsPasswordCreation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  console.log('🏠 === INDEX RENDER DECISION ===');
  console.log('🏠 Will show modal?', needsPasswordCreation && !!user.email);
  console.log('🏠 User email for modal:', user.email);
  console.log('🏠 needsPasswordCreation flag:', needsPasswordCreation);

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
