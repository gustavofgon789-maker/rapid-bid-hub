import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Flame, Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nome_completo: "",
    email: "",
    password: "",
    whatsapp: "",
    cidade: "",
    estado: "",
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>

        {/* Logo */}
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
            <div className="glass rounded-xl p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold mb-1">Bem-vindo de volta</h2>
                <p className="text-sm text-muted-foreground">Entre para continuar negociando</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="login-email" className="text-xs">E-mail</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-xs">Senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  Entrar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <div className="glass rounded-xl p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold mb-1">Crie sua conta</h2>
                <p className="text-sm text-muted-foreground">Comece a negociar na catira</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reg-name" className="text-xs">Nome completo</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      placeholder="Seu nome completo"
                      className="pl-10"
                      value={registerForm.nome_completo}
                      onChange={(e) => setRegisterForm(p => ({ ...p, nome_completo: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email" className="text-xs">E-mail</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-password" className="text-xs">Senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-whatsapp" className="text-xs">WhatsApp</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-whatsapp"
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      value={registerForm.whatsapp}
                      onChange={(e) => setRegisterForm(p => ({ ...p, whatsapp: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reg-cidade" className="text-xs">Cidade</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-cidade"
                        placeholder="Sua cidade"
                        className="pl-10"
                        value={registerForm.cidade}
                        onChange={(e) => setRegisterForm(p => ({ ...p, cidade: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-estado" className="text-xs">Estado</Label>
                    <Input
                      id="reg-estado"
                      placeholder="UF"
                      className="mt-1"
                      maxLength={2}
                      value={registerForm.estado}
                      onChange={(e) => setRegisterForm(p => ({ ...p, estado: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  Criar conta
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
