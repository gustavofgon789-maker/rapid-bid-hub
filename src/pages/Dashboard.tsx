import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone,
  Gavel,
  Plus,
  Eye,
  User,
  MapPin,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Anuncio = Tables<"anuncios">;
type Lance = Tables<"lances">;

interface AnuncioWithLances extends Anuncio {
  lances: Lance[];
}

interface LanceWithAnuncio extends Lance {
  anuncios: Anuncio & { profiles?: { nome_completo: string; cidade: string; estado: string } | null };
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [meusAnuncios, setMeusAnuncios] = useState<AnuncioWithLances[]>([]);
  const [meusLances, setMeusLances] = useState<LanceWithAnuncio[]>([]);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(profileData);

      // Fetch my listings with their bids
      const { data: anunciosData } = await supabase
        .from("anuncios")
        .select("*, lances(*)")
        .eq("vendedor_id", user.id)
        .order("created_at", { ascending: false });
      setMeusAnuncios((anunciosData as AnuncioWithLances[]) ?? []);

      // Fetch my bids with the listing info
      const { data: lancesData } = await supabase
        .from("lances")
        .select("*, anuncios(*, profiles!anuncios_vendedor_id_fkey(nome_completo, cidade, estado))")
        .eq("comprador_id", user.id)
        .order("created_at", { ascending: false });
      setMeusLances((lancesData as unknown as LanceWithAnuncio[]) ?? []);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 flex justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    ativo: { label: "Ativo", className: "bg-primary/20 text-primary border-primary/30" },
    aguardando_escolha: { label: "Escolha Obrigatória", className: "bg-accent/20 text-accent border-accent/30" },
    finalizado: { label: "Finalizado", className: "bg-muted text-muted-foreground border-border" },
  };

  const lanceStatusConfig: Record<string, { label: string; className: string }> = {
    pendente: { label: "Pendente", className: "bg-accent/20 text-accent border-accent/30" },
    aceito: { label: "Aceito!", className: "bg-primary/20 text-primary border-primary/30" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Meu Painel</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Olá, <span className="text-foreground font-medium">{profile?.nome_completo || "Usuário"}</span>
              {profile?.cidade && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.cidade}, {profile.estado}
                </span>
              )}
            </p>
          </div>
          <Button asChild>
            <Link to="/novo-anuncio">
              <Plus className="w-4 h-4 mr-2" /> Novo Anúncio
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="anuncios">
          <TabsList className="mb-6">
            <TabsTrigger value="anuncios" className="gap-2">
              <Megaphone className="w-4 h-4" /> Meus Anúncios
              {meusAnuncios.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {meusAnuncios.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="lances" className="gap-2">
              <Gavel className="w-4 h-4" /> Minhas Propostas
              {meusLances.length > 0 && (
                <span className="ml-1 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                  {meusLances.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Seller Dashboard */}
          <TabsContent value="anuncios">
            {meusAnuncios.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Nenhum anúncio ainda</h3>
                <p className="text-muted-foreground text-sm mb-4">Crie seu primeiro anúncio e comece a receber propostas!</p>
                <Button asChild>
                  <Link to="/novo-anuncio"><Plus className="w-4 h-4 mr-2" /> Criar Anúncio</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {meusAnuncios.map((anuncio) => {
                  const maxLance = anuncio.lances.length > 0
                    ? Math.max(...anuncio.lances.map(l => l.valor))
                    : null;
                  const aceito = anuncio.lances.find(l => l.status === "aceito");
                  const st = statusConfig[anuncio.status] ?? statusConfig.ativo;

                  return (
                    <div key={anuncio.id} className="glass rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className={st.className}>{st.label}</Badge>
                            <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                              {anuncio.categoria}
                            </Badge>
                          </div>
                          <Link to={`/anuncio/${anuncio.id}`} className="font-display font-semibold text-lg hover:text-primary transition-colors">
                            {anuncio.titulo}
                          </Link>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" /> Min: {formatCurrency(anuncio.preco_minimo)}
                            </span>
                            {maxLance && (
                              <span className="flex items-center gap-1 text-primary">
                                <TrendingUp className="w-3.5 h-3.5" /> Maior: {formatCurrency(maxLance)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Gavel className="w-3.5 h-3.5" /> {anuncio.lances.length} lance{anuncio.lances.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <CountdownTimer endDate={new Date(anuncio.data_fim)} compact />
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link to={`/anuncio/${anuncio.id}`}>
                              <Eye className="w-3.5 h-3.5 mr-1" /> Ver Lances
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Quick lance list */}
                      {anuncio.lances.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Lances Recebidos
                          </p>
                          {anuncio.lances
                            .sort((a, b) => b.valor - a.valor)
                            .slice(0, 3)
                            .map((lance) => (
                              <div key={lance.id} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="font-medium">{formatCurrency(lance.valor)}</span>
                                </span>
                                {lance.status === "aceito" ? (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Aceito
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                                    <Clock className="w-3 h-3 mr-1" /> Pendente
                                  </Badge>
                                )}
                              </div>
                            ))}
                          {anuncio.lances.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{anuncio.lances.length - 3} mais...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Buyer Dashboard */}
          <TabsContent value="lances">
            {meusLances.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Nenhuma proposta ainda</h3>
                <p className="text-muted-foreground text-sm mb-4">Explore os anúncios e faça sua primeira oferta!</p>
                <Button asChild>
                  <Link to="/anuncios">Ver Anúncios</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {meusLances.map((lance) => {
                  const anuncio = lance.anuncios;
                  const lst = lanceStatusConfig[lance.status] ?? lanceStatusConfig.pendente;
                  const anuncioSt = statusConfig[anuncio.status] ?? statusConfig.ativo;

                  return (
                    <div key={lance.id} className="glass rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className={lst.className}>{lst.label}</Badge>
                            <Badge variant="outline" className={anuncioSt.className}>{anuncioSt.label}</Badge>
                            <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                              {anuncio.categoria}
                            </Badge>
                          </div>
                          <Link to={`/anuncio/${anuncio.id}`} className="font-display font-semibold text-lg hover:text-primary transition-colors">
                            {anuncio.titulo}
                          </Link>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>
                              Vendedor: <span className="text-foreground">{anuncio.profiles?.nome_completo ?? "—"}</span>
                            </span>
                            {anuncio.profiles?.cidade && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {anuncio.profiles.cidade}, {anuncio.profiles.estado}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground mb-1">Seu lance</p>
                          <p className="font-display font-bold text-xl text-primary">
                            {formatCurrency(lance.valor)}
                          </p>
                          <CountdownTimer endDate={new Date(anuncio.data_fim)} compact />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
