
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";

export const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
      navigate("/");
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });
    }
    
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
    setSocialLoading(provider);
    
    try {
      let result;
      if (provider === 'google') {
        result = await signInWithGoogle();
      } else {
        result = await signInWithMicrosoft();
      }
      
      if (result?.error) {
        toast({
          title: "Erro ao fazer login",
          description: `Erro ao conectar com ${provider === 'google' ? 'Google' : 'Microsoft'}: ${result.error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: `Conectado com ${provider === 'google' ? 'Google' : 'Microsoft'}.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: error?.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const validateEmail = (value: string) => {
    if (!value) return "O email é obrigatório.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "Email inválido.";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "A senha é obrigatória.";
    if (value.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center space-y-6 pb-6 pt-8">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <CardTitle className="text-2xl font-bold text-white">
              Comece agora gratuitamente
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Teste por 14 dias sem compromisso
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          {/* Social Login Buttons */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <button 
              type="button" 
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl border border-slate-600/40 bg-slate-700/40 hover:bg-slate-700/60 transition-all duration-200 text-white font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <img src="/google.svg" alt="Google" className="h-5 w-5" />
              )}
              {socialLoading === 'google' ? 'Conectando...' : 'Entrar com Google'}
            </button>
            
            <button 
              type="button" 
              onClick={() => handleSocialLogin('microsoft')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl border border-slate-600/40 bg-slate-700/40 hover:bg-slate-700/60 transition-all duration-200 text-white font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {socialLoading === 'microsoft' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" />
              )}
              {socialLoading === 'microsoft' ? 'Conectando...' : 'Entrar com Microsoft'}
            </button>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
            <span className="text-xs text-slate-500 font-medium px-2">ou</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
          </div>

          {/* Tabs for Login/Signup */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/60 border border-slate-600/40 p-1.5 rounded-xl">
              <TabsTrigger 
                value="signin" 
                className="text-slate-300 data-[state=active]:bg-slate-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg text-sm font-medium rounded-lg transition-all duration-200"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="text-slate-300 data-[state=active]:bg-slate-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg text-sm font-medium rounded-lg transition-all duration-200"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(validateEmail(e.target.value));
                    }}
                    required
                    className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 rounded-xl ${emailError ? 'border-red-500' : ''}`}
                    placeholder="seu@email.com"
                  />
                  <AnimatePresence>
                    {emailError && (
                      <motion.div
                        className="text-red-400 text-xs flex items-center gap-1.5"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        {emailError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(validatePassword(e.target.value));
                      }}
                      required
                      className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 pr-12 rounded-xl ${passwordError ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(v => !v)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {passwordError && (
                      <motion.div
                        className="text-red-400 text-xs flex items-center gap-1.5"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        {passwordError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-end">
                    <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      Esqueceu a senha?
                    </a>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 h-12 text-sm transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-[1.02]" 
                  disabled={loading || !!emailError || !!passwordError}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    "Acessar minha conta"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-300 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(validateEmail(e.target.value));
                    }}
                    required
                    className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 rounded-xl ${emailError ? 'border-red-500' : ''}`}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-300 text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(validatePassword(e.target.value));
                    }}
                    required
                    minLength={6}
                    className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 rounded-xl ${passwordError ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 h-12 text-sm transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-[1.02]" 
                  disabled={loading || !!emailError || !!passwordError}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando conta...
                    </div>
                  ) : (
                    "Criar conta gratuita"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-2 text-xs text-green-400 pt-4">
            <ShieldCheck className="w-4 h-4" />
            Seus dados estão seguros conosco
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
