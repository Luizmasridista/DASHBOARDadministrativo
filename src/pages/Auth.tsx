
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

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth page: User state changed:', user);
    if (user) {
      console.log('Auth page: User is authenticated, redirecting to home');
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Auth page: Sign in form submitted');
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Auth page: Sign in error:', error);
        toast({
          title: "Erro ao fazer login",
          description: error.message || "Erro desconhecido ao fazer login",
          variant: "destructive",
        });
      } else {
        console.log('Auth page: Sign in successful');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
        navigate("/");
      }
    } catch (err) {
      console.error('Auth page: Sign in exception:', err);
      toast({
        title: "Erro ao fazer login",
        description: "Erro inesperado ao fazer login",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Auth page: Sign up form submitted for:', email);
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        console.error('Auth page: Sign up error:', error);
        toast({
          title: "Erro ao criar conta",
          description: error.message || "Erro desconhecido ao criar conta",
          variant: "destructive",
        });
      } else {
        console.log('Auth page: Sign up successful');
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
    } catch (err) {
      console.error('Auth page: Sign up exception:', err);
      toast({
        title: "Erro ao criar conta",
        description: "Erro inesperado ao criar conta",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  console.log('Auth page: Rendering with state:', { email, loading, user: user?.email });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-sm border-slate-700 shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
              <img 
                src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
                alt="Logo da Empresa" 
                className="h-16 w-auto"
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-light text-white">
              Dashboard Financeiro
            </CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Entre na sua conta ou crie uma nova para começar
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border border-slate-600">
              <TabsTrigger 
                value="signin" 
                className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 mt-6" 
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-200 font-medium">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-200 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 mt-6" 
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
