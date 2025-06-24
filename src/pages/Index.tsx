
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { user, loading, isNewGoogleUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index - Auth state:', { user: !!user, loading, isNewGoogleUser });
    
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to auth');
        navigate("/auth");
      } else if (isNewGoogleUser) {
        console.log('New Google user, redirecting to complete signup');
        navigate("/complete-google-signup");
      }
    }
  }, [user, loading, isNewGoogleUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || isNewGoogleUser) {
    return null;
  }

  return <Dashboard />;
};

export default Index;
