
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
import { Eye, EyeOff, Lock, Mail, ShieldCheck, BarChart3, TrendingUp, Users, Zap, CheckCircle, Star, Loader2, FileSpreadsheet, Calculator, PieChart, Calendar, Settings, Download, Bell, Database } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle, signInWithMicrosoft, user } = useAuth();
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

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-400" />,
      title: "Relatórios em Tempo Real",
      description: "Visualize suas finanças com gráficos dinâmicos e relatórios atualizados instantaneamente."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-400" />,
      title: "Análise de Tendências",
      description: "Identifique padrões e oportunidades com nossa IA avançada de análise financeira."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
      title: "Segurança Máxima",
      description: "Seus dados protegidos com criptografia de nível bancário e backup automático."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Integração Automática",
      description: "Conecte suas contas e planilhas automaticamente, sem trabalho manual."
    }
  ];

  const benefits = [
    "Redução de 80% no tempo de preparação de relatórios",
    "Visibilidade completa do fluxo de caixa",
    "Alertas inteligentes para anomalias financeiras",
    "Exportação para Excel e PDF com um clique"
  ];

  // Platform tools and functionalities
  const platformTools = [
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
      title: "Planilhas Inteligentes",
      description: "Conecte e sincronize automaticamente suas planilhas do Google Sheets e Excel"
    },
    {
      icon: <Calculator className="w-6 h-6 text-blue-500" />,
      title: "Calculadora Financeira",
      description: "Ferramentas avançadas para cálculos de ROI, juros compostos e projeções"
    },
    {
      icon: <PieChart className="w-6 h-6 text-purple-500" />,
      title: "Dashboard Interativo",
      description: "Gráficos e métricas em tempo real com análise de tendências automatizada"
    },
    {
      icon: <Calendar className="w-6 h-6 text-orange-500" />,
      title: "Planejamento Mensal",
      description: "Organize orçamentos e metas com cronogramas personalizáveis"
    },
    {
      icon: <Settings className="w-6 h-6 text-gray-500" />,
      title: "Automação de Processos",
      description: "Configure fluxos automáticos para relatórios e notificações"
    },
    {
      icon: <Download className="w-6 h-6 text-indigo-500" />,
      title: "Exportação Avançada",
      description: "Exporte dados em múltiplos formatos: Excel, PDF, CSV com formatação personalizada"
    }
  ];

  // Software screenshots data
  const softwareScreenshots = [
    {
      title: "Dashboard Principal",
      description: "Interface principal com visão geral completa dos seus dados financeiros, gráficos interativos e métricas em tempo real.",
      image: "/screenshots/dashboard-principal.jpg",
      features: ["Gráficos em tempo real", "Métricas personalizáveis", "Filtros avançados"]
    },
    {
      title: "Análise de Dados",
      description: "Ferramenta de análise avançada com IA integrada para identificar padrões e oportunidades de crescimento.",
      image: "/screenshots/analise-dados.jpg",
      features: ["IA para análise", "Previsões automáticas", "Relatórios detalhados"]
    },
    {
      title: "Integração com Planilhas",
      description: "Conecte automaticamente suas planilhas existentes e mantenha todos os dados sincronizados em tempo real.",
      image: "/screenshots/integracao-planilhas.jpg",
      features: ["Sincronização automática", "Múltiplos formatos", "Backup seguro"]
    }
  ];

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

      {/* Header */}
      <header className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
              alt="Logo" 
              className="h-8 w-auto"
            />
            <span className="text-white font-bold text-xl">FinanceControl</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Hero Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Controle financeiro
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> inteligente</span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Transforme a gestão financeira da sua empresa com relatórios em tempo real, 
              análises inteligentes e segurança de nível bancário.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 text-slate-200"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* Platform Tools */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            {platformTools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  {tool.icon}
                  <h3 className="text-sm font-semibold text-white">{tool.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Auth Form */}
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
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Tudo que você precisa para crescer
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Ferramentas poderosas que automatizam sua gestão financeira
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Software Screenshots Section */}
      <section className="relative z-10 py-20 px-6 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Veja o sistema em ação
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Interface intuitiva e poderosa que facilita sua gestão financeira
            </p>
          </motion.div>

          <div className="space-y-16">
            {softwareScreenshots.map((screenshot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.2, duration: 0.8 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
              >
                {/* Screenshot */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                    <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                      <img 
                        src={screenshot.image}
                        alt={screenshot.title}
                        className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-2xl"
                      />
                      <div className="absolute top-8 left-8 right-8">
                        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 bg-red-500 rounded-full" />
                              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                              <div className="w-3 h-3 bg-green-500 rounde d-full" />
                            </div>
                            <div className="text-slate-300 text-sm font-medium ml-4">
                              FinanceControl - {screenshot.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {screenshot.title}
                    </h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {screenshot.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {screenshot.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-slate-200">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 px-6 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <img 
              src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
              alt="Logo" 
              className="h-6 w-auto"
            />
            <span>© 2024 FinanceControl. Todos os direitos reservados.</span>
          </div>
          <div className="text-xs text-slate-500">
            Protegido por Supabase • SSL Certificado
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
