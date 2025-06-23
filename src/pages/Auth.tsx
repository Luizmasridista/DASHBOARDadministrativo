
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slower" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slower" />
      </div>
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md z-10 relative"
        >
          <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden">
            <div className="absolute top-6 right-6 z-10">
              <ThemeToggle />
            </div>
            
            <CardHeader className="text-center space-y-8 pb-8 pt-8">
              {/* Logo Section */}
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="bg-slate-700/60 backdrop-blur-sm rounded-2xl px-10 py-5 border border-slate-600/30 shadow-xl">
                  <img 
                    src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
                    alt="Logo da Empresa" 
                    className="h-12 w-auto"
                  />
                </div>
              </motion.div>
              
              {/* Title and Description */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <CardTitle className="text-2xl font-bold text-white leading-snug">
                  Controle financeiro fácil e<br />seguro para sua empresa
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Acesse relatórios em tempo real, segurança de dados<br />garantida, suporte dedicado.
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-8">
              {/* Social Login Buttons */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl border border-slate-600/40 bg-slate-700/40 hover:bg-slate-700/60 transition-all duration-200 text-white font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <img src="/google.svg" alt="Google" className="h-5 w-5" />
                  Entrar com Google
                </button>
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl border border-slate-600/40 bg-slate-700/40 hover:bg-slate-700/60 transition-all duration-200 text-white font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" />
                  Entrar com Microsoft
                </button>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
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

                <TabsContent value="signin" className="mt-8">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-3">
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
                        className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 rounded-xl ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                        placeholder="seu@email.com"
                      />
                      <AnimatePresence>
                        {emailError && (
                          <motion.div
                            id="email-error"
                            className="text-red-400 text-xs flex items-center gap-1.5 mt-2"
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
                    
                    <div className="space-y-3">
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
                          className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 pr-12 rounded-xl ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                          placeholder="••••••••"
                        />
                        <button 
                          type="button" 
                          tabIndex={-1} 
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} 
                          onClick={() => setShowPassword(v => !v)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {passwordError && (
                          <motion.div
                            id="password-error"
                            className="text-red-400 text-xs flex items-center gap-1.5 mt-2"
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
                      <div className="flex justify-end mt-3">
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
                      {loading ? "Entrando..." : "Acessar minha conta"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-8">
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-3">
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
                        className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 rounded-xl ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                        placeholder="seu@email.com"
                      />
                      <AnimatePresence>
                        {emailError && (
                          <motion.div
                            id="signup-email-error"
                            className="text-red-400 text-xs flex items-center gap-1.5 mt-2"
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
                    <div className="space-y-3">
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
                        className={`bg-slate-700/60 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 h-12 rounded-xl ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                        placeholder="••••••••"
                      />
                      <AnimatePresence>
                        {passwordError && (
                          <motion.div
                            id="signup-password-error"
                            className="text-red-400 text-xs flex items-center gap-1.5 mt-2"
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
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 h-12 text-sm transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-[1.02]" 
                      disabled={loading || !!emailError || !!passwordError}
                    >
                      {loading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Social Proof Section */}
              <motion.div 
                className="mt-10 space-y-5 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="flex justify-center gap-8">
                  <img src="/client1.svg" alt="Cliente 1" className="h-6 opacity-50 hover:opacity-70 transition-opacity" />
                  <img src="/client2.svg" alt="Cliente 2" className="h-6 opacity-50 hover:opacity-70 transition-opacity" />
                  <img src="/client3.svg" alt="Cliente 3" className="h-6 opacity-50 hover:opacity-70 transition-opacity" />
                </div>
                <div className="text-xs text-slate-500">
                  +500 empresas confiam • Protegido por Supabase
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  Seus dados estão seguros conosco
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Auth;
