
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900 to-slate-900" />
      </div>
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md z-10 relative"
        >
          <Card className="bg-slate-800/95 backdrop-blur-sm border-slate-700/50 shadow-2xl">
            <div className="absolute top-4 right-4 z-10">
              <ThemeToggle />
            </div>
            
            <CardHeader className="text-center space-y-6 pb-6">
              {/* Logo Section */}
              <div className="flex justify-center">
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl px-8 py-4 border border-slate-600/50">
                  <img 
                    src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
                    alt="Logo da Empresa" 
                    className="h-12 w-auto"
                  />
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="space-y-3">
                <CardTitle className="text-2xl font-semibold text-white leading-tight">
                  Controle financeiro fácil e<br />seguro para sua empresa
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm leading-relaxed">
                  Acesse relatórios em tempo real, segurança de dados<br />garantida, suporte dedicado.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all text-white font-medium text-sm"
                >
                  <img src="/google.svg" alt="Google" className="h-5 w-5" />
                  Entrar com Google
                </button>
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all text-white font-medium text-sm"
                >
                  <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" />
                  Entrar com Microsoft
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-600/50" />
                <span className="text-xs text-slate-500 font-medium">ou</span>
                <div className="flex-1 h-px bg-slate-600/50" />
              </div>

              {/* Tabs for Login/Signup */}
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border border-slate-600/50 p-1">
                  <TabsTrigger 
                    value="signin" 
                    className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-sm font-medium"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-sm font-medium"
                  >
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-5">
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
                        aria-invalid={!!emailError}
                        aria-describedby="email-error"
                        className={`bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                        placeholder="seu@email.com"
                      />
                      <AnimatePresence>
                        {emailError && (
                          <motion.div
                            id="email-error"
                            className="text-red-400 text-xs flex items-center gap-1 mt-1"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            role="alert"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                          aria-invalid={!!passwordError}
                          aria-describedby="password-error"
                          className={`bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 pr-12 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                          placeholder="••••••••"
                        />
                        <button 
                          type="button" 
                          tabIndex={-1} 
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} 
                          onClick={() => setShowPassword(v => !v)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {passwordError && (
                          <motion.div
                            id="password-error"
                            className="text-red-400 text-xs flex items-center gap-1 mt-1"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            role="alert"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {passwordError}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex justify-end mt-2">
                        <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          Esqueceu a senha?
                        </a>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 h-12 text-sm transition-all duration-200 shadow-lg" 
                      disabled={loading || !!emailError || !!passwordError}
                    >
                      {loading ? "Entrando..." : "Acessar minha conta"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-5">
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
                        aria-invalid={!!emailError}
                        aria-describedby="signup-email-error"
                        className={`bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                        placeholder="seu@email.com"
                      />
                      <AnimatePresence>
                        {emailError && (
                          <motion.div
                            id="signup-email-error"
                            className="text-red-400 text-xs flex items-center gap-1 mt-1"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            role="alert"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {emailError}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                        aria-invalid={!!passwordError}
                        aria-describedby="signup-password-error"
                        className={`bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                        placeholder="••••••••"
                      />
                      <AnimatePresence>
                        {passwordError && (
                          <motion.div
                            id="signup-password-error"
                            className="text-red-400 text-xs flex items-center gap-1 mt-1"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            role="alert"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {passwordError}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 h-12 text-sm transition-all duration-200 shadow-lg" 
                      disabled={loading || !!emailError || !!passwordError}
                    >
                      {loading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Social Proof Section */}
              <div className="mt-8 space-y-4 text-center">
                <div className="flex justify-center gap-6">
                  <img src="/client1.svg" alt="Cliente 1" className="h-6 opacity-60" />
                  <img src="/client2.svg" alt="Cliente 2" className="h-6 opacity-60" />
                  <img src="/client3.svg" alt="Cliente 3" className="h-6 opacity-60" />
                </div>
                <div className="text-xs text-slate-500">
                  +500 empresas confiam • Protegido por Supabase
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  Seus dados estão seguros conosco
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Auth;
