import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Flame, Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nome_completo: "",
    email: "",
    password: "",
    whatsapp: "",
    cidade: "",
    estado: "",
  });

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bem-vindo de volta!" });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.nome_completo || !registerForm.whatsapp) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome_completo: registerForm.nome_completo,
          whatsapp: registerForm.whatsapp,
          cidade: registerForm.cidade,
          estado: registerForm.estado,
        },
      },
    });
    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar o cadastro." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-2xl font-bold">O Catireiro</span>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="glass rounded-xl p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold mb-1">Bem-vindo de volta</h2>
                <p className="text-sm text-muted-foreground">Entre para continuar negociando</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="login-email" className="text-xs">E-mail</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="seu@email.com" className="pl-10" value={loginForm.email} onChange={(e) => setLoginForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-xs">Senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" value={loginForm.password} onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))} required />
                  </div>
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="glass rounded-xl p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold mb-1">Crie sua conta</h2>
                <p className="text-sm text-muted-foreground">Comece a negociar na catira</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reg-name" className="text-xs">Nome completo</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-name" placeholder="Seu nome completo" className="pl-10" value={registerForm.nome_completo} onChange={(e) => setRegisterForm(p => ({ ...p, nome_completo: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email" className="text-xs">E-mail</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-email" type="email" placeholder="seu@email.com" className="pl-10" value={registerForm.email} onChange={(e) => setRegisterForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-password" className="text-xs">Senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10" minLength={6} value={registerForm.password} onChange={(e) => setRegisterForm(p => ({ ...p, password: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-whatsapp" className="text-xs">WhatsApp</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-whatsapp" placeholder="(11) 99999-9999" className="pl-10" value={registerForm.whatsapp} onChange={(e) => setRegisterForm(p => ({ ...p, whatsapp: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reg-cidade" className="text-xs">Cidade</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="reg-cidade" placeholder="Sua cidade" className="pl-10" value={registerForm.cidade} onChange={(e) => setRegisterForm(p => ({ ...p, cidade: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-estado" className="text-xs">Estado</Label>
                    <Input id="reg-estado" placeholder="UF" className="mt-1" maxLength={2} value={registerForm.estado} onChange={(e) => setRegisterForm(p => ({ ...p, estado: e.target.value.toUpperCase() }))} />
                  </div>
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={loading}>
                  {loading ? "Criando..." : "Criar conta"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
