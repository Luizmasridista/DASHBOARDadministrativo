import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthHeroContent } from "@/components/auth/AuthHeroContent";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthFeatures } from "@/components/auth/AuthFeatures";
import { AuthScreenshots } from "@/components/auth/AuthScreenshots";
import { AuthFooter } from "@/components/auth/AuthFooter";
import axios from "axios";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Lógica para tratar o retorno do Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setLoading(true);
      setError("");
      axios.post("http://localhost:8080/auth", { code })
        .then(res => {
          // Salva sessão mock
          localStorage.setItem("sessionToken", res.data.sessionToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          // Redireciona para o dashboard
          window.location.href = "/";
        })
        .catch(err => {
          setError("Erro ao autenticar com Google. Tente novamente.");
        })
        .finally(() => setLoading(false));
    }
  }, []);

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
        {loading ? (
          <div className="text-white text-lg">Autenticando com Google...</div>
        ) : error ? (
          <div className="text-red-400 text-lg mb-4">{error}</div>
        ) : (
          <AuthForm />
        )}
      </div>

      <AuthFeatures />
      <AuthScreenshots />
      <AuthFooter />
    </div>
  );
};

export default Auth;
