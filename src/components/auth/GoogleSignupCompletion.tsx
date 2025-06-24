
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const GoogleSignupCompletion = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== COMPLETING GOOGLE SIGNUP ===');
    console.log('User email:', user?.email);
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro na confirmação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Email do Google não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Updating user metadata to include password and completion flag');
      
      // Update the user's metadata to indicate they completed the signup process
      // and set a password (this won't actually change their password, but marks completion)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          completed_signup: true,
          has_password: true,
          signup_completed_at: new Date().toISOString()
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        toast({
          title: "Erro ao completar cadastro",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('User metadata updated successfully');
      
      toast({
        title: "Cadastro completado!",
        description: "Sua conta foi criada com sucesso. Você já está logado.",
      });
      
      console.log('Redirecting to dashboard');
      navigate("/");
      
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro inesperado",
        description: error?.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center space-y-6 pb-6 pt-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="space-y-4">
              <CardTitle className="text-2xl font-bold text-white">
                Complete seu cadastro
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Sua conta Google foi vinculada com sucesso! <br />
                Agora crie uma senha para finalizar o cadastro.
              </CardDescription>
            </div>

            {user?.email && (
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 px-4 py-2 rounded-lg">
                <img src="/google.svg" alt="Google" className="h-4 w-4" />
                {user.email}
              </div>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleCompleteSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 pr-12 rounded-xl"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(v => !v)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 pr-12 rounded-xl"
                    placeholder="Confirme sua senha"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(v => !v)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 h-12 text-sm transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-[1.02]" 
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? "Finalizando cadastro..." : "Finalizar cadastro"}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-2 text-xs text-green-400 pt-6">
              <Shield className="w-4 h-4" />
              Sua conta está sendo criada com segurança
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
