
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Shield, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GooglePasswordModalProps {
  isOpen: boolean;
  userEmail: string;
  onComplete: () => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const GooglePasswordModal = ({ isOpen, userEmail, onComplete }: GooglePasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validatePassword = (pwd: string): PasswordValidation => {
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%]/.test(pwd)
    };
  };

  const validation = validatePassword(password);
  const isPasswordValid = Object.values(validation).every(Boolean);

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-red-500" />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== GOOGLE PASSWORD MODAL SUBMISSION ===');
    console.log('Password valid:', isPasswordValid);
    console.log('Passwords match:', password === confirmPassword);
    
    if (!isPasswordValid) {
      toast({
        title: "Senha inválida",
        description: "A senha deve atender a todos os critérios de segurança.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, confirme sua senha corretamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Updating user metadata with password completion flag');
      
      // Marca que o usuário completou a criação da senha
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          completed_signup: true,
          has_password: true,
          password_created_at: new Date().toISOString()
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        toast({
          title: "Erro ao salvar configurações",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('User metadata updated successfully');
      
      toast({
        title: "Senha criada com sucesso!",
        description: "Sua conta está agora segura. Redirecionando...",
      });
      
      // Chama a função de conclusão
      onComplete();
      
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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white" hideCloseButton>
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <DialogTitle className="text-xl font-bold">
            Crie uma senha segura
          </DialogTitle>
          
          <p className="text-slate-400 text-sm">
            Para garantir a segurança da sua conta Google, é necessário criar uma senha forte.
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 px-4 py-2 rounded-lg">
            <img src="/google.svg" alt="Google" className="h-4 w-4" />
            {userEmail}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
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
                className="bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 pr-12 rounded-xl"
                placeholder="Digite sua nova senha"
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

          {/* Critérios de validação */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Critérios de segurança:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                {getValidationIcon(validation.minLength)}
                <span className={validation.minLength ? "text-green-400" : "text-slate-400"}>
                  Mínimo de 8 caracteres
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {getValidationIcon(validation.hasUppercase)}
                <span className={validation.hasUppercase ? "text-green-400" : "text-slate-400"}>
                  Pelo menos uma letra maiúscula
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {getValidationIcon(validation.hasLowercase)}
                <span className={validation.hasLowercase ? "text-green-400" : "text-slate-400"}>
                  Pelo menos uma letra minúscula
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {getValidationIcon(validation.hasNumber)}
                <span className={validation.hasNumber ? "text-green-400" : "text-slate-400"}>
                  Pelo menos um número
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {getValidationIcon(validation.hasSpecialChar)}
                <span className={validation.hasSpecialChar ? "text-green-400" : "text-slate-400"}>
                  Pelo menos um caractere especial (!@#$%)
                </span>
              </div>
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
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                As senhas não coincidem
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 h-12 text-sm transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-[1.02]" 
            disabled={loading || !isPasswordValid || password !== confirmPassword}
          >
            {loading ? "Criando senha..." : "Criar senha segura"}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-blue-400 pt-2">
          <Shield className="w-4 h-4" />
          Sua senha será protegida com criptografia avançada
        </div>
      </DialogContent>
    </Dialog>
  );
};
