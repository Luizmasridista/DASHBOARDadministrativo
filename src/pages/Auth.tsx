
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthHeroContent } from "@/components/auth/AuthHeroContent";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthFeatures } from "@/components/auth/AuthFeatures";
import { AuthScreenshots } from "@/components/auth/AuthScreenshots";
import { AuthFooter } from "@/components/auth/AuthFooter";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slower" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slower" />
      </div>

      <AuthHeader />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">
        <AuthHeroContent />
        <AuthForm />
      </div>

      <AuthFeatures />
      <AuthScreenshots />
      <AuthFooter />
    </div>
  );
};

export default Auth;
