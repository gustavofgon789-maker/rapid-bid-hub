import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import BidModal from "@/components/BidModal";
import AcceptBidModal from "@/components/AcceptBidModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Tag,
  AlertTriangle,
  Gavel,
  TrendingUp,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Anuncio = Tables<"anuncios">;
type Lance = Tables<"lances">;
type Profile = Tables<"profiles">;

interface LanceWithProfile extends Lance {
  profiles?: Profile | null;
}

const AnuncioDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [vendedor, setVendedor] = useState<Profile | null>(null);
  const [lances, setLances] = useState<LanceWithProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedLance, setSelectedLance] = useState<LanceWithProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      if (!id) return;

      const { data: anuncioData } = await supabase
        .from("anuncios")
        .select("*")
        .eq("id", id)
        .single();

      if (!anuncioData) {
        navigate("/anuncios");
        return;
      }
      setAnuncio(anuncioData);

      const { data: vendedorData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", anuncioData.vendedor_id)
        .single();
      setVendedor(vendedorData);

      await fetchLances();
      setLoading(false);
    };

    const fetchLances = async () => {
      const { data: lancesData } = await supabase
        .from("lances")
        .select("*, profiles!lances_comprador_id_fkey(*)")
        .eq("anuncio_id", id!)
        .order("valor", { ascending: false });
      setLances((lancesData as LanceWithProfile[]) ?? []);
    };

    fetchData();

    // Realtime subscription for bids
    const channel = supabase
      .channel(`lances-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lances", filter: `anuncio_id=eq.${id}` },
        async () => {
          const { data } = await supabase
            .from("lances")
            .select("*, profiles!lances_comprador_id_fkey(*)")
            .eq("anuncio_id", id!)
            .order("valor", { ascending: false });
          setLances((data as LanceWithProfile[]) ?? []);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, navigate]);

  const isVendedor = currentUserId === anuncio?.vendedor_id;
  const isExpired = anuncio ? new Date(anuncio.data_fim) <= new Date() : false;
  const maxLance = lances.length > 0 ? lances[0].valor : null;
  const aceito = lances.find((l) => l.status === "aceito");

  const handleBidSuccess = async () => {
    setBidModalOpen(false);
    const { data } = await supabase
      .from("lances")
      .select("*, profiles!lances_comprador_id_fkey(*)")
      .eq("anuncio_id", id!)
      .order("valor", { ascending: false });
    setLances((data as LanceWithProfile[]) ?? []);
  };

  const handleAcceptBid = (lance: LanceWithProfile) => {
    setSelectedLance(lance);
    setAcceptModalOpen(true);
  };

  const handleAcceptConfirm = async () => {
    if (!selectedLance || !anuncio) return;

    await supabase
      .from("lances")
      .update({ status: "aceito" })
      .eq("id", selectedLance.id);

    await supabase
      .from("anuncios")
      .update({ status: "finalizado" })
      .eq("id", anuncio.id);

    // Redirect to WhatsApp
    const phone = selectedLance.profiles?.whatsapp?.replace(/\D/g, "") ?? "";
    const msg = encodeURIComponent(
      `Olá, vi seu lance no O Catireiro e aceitei sua oferta pelo ${anuncio.titulo}!`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${msg}`, "_blank");

    setAcceptModalOpen(false);
    // Refresh
    const { data: updated } = await supabase.from("anuncios").select("*").eq("id", anuncio.id).single();
    if (updated) setAnuncio(updated);
    const { data: lancesData } = await supabase
      .from("lances")
      .select("*, profiles!lances_comprador_id_fkey(*)")
      .eq("anuncio_id", anuncio.id)
      .order("valor", { ascending: false });
    setLances((lancesData as LanceWithProfile[]) ?? []);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 flex justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!anuncio) return null;

  const statusConfig: Record<string, { label: string; className: string }> = {
    ativo: { label: "Ativo", className: "bg-primary/20 text-primary border-primary/30" },
    aguardando_escolha: { label: "Escolha Obrigatória", className: "bg-accent/20 text-accent border-accent/30 animate-pulse-urgency" },
    finalizado: { label: "Finalizado", className: "bg-muted text-muted-foreground border-border" },
  };

  const status = statusConfig[anuncio.status] ?? statusConfig.ativo;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      <Tag className="w-3 h-3 mr-1" />
                      {anuncio.categoria}
                    </Badge>
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">{anuncio.titulo}</h1>
                </div>
              </div>

              {anuncio.descricao && (
                <p className="text-muted-foreground leading-relaxed">{anuncio.descricao}</p>
              )}

              {anuncio.motivo_urgencia && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Motivo da Urgência</span>
                    <p className="text-sm text-foreground mt-0.5">{anuncio.motivo_urgencia}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Preço Mínimo
                  </span>
                  <span className="font-display font-bold text-primary">{formatCurrency(anuncio.preco_minimo)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Maior Lance
                  </span>
                  <span className="font-display font-bold text-primary">
                    {maxLance ? formatCurrency(maxLance) : "—"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gavel className="w-3 h-3" /> Lances
                  </span>
                  <span className="font-display font-bold">{lances.length}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Duração
                  </span>
                  <span className="font-display font-bold">{anuncio.duracao_dias} dias</span>
                </div>
              </div>
            </div>

            {/* Bids list */}
            <div className="glass rounded-xl p-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" /> Lances Recebidos
              </h2>

              {lances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum lance ainda. Seja o primeiro!
                </p>
              ) : (
                <div className="space-y-3">
                  {lances.map((lance, i) => (
                    <div
                      key={lance.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        lance.status === "aceito"
                          ? "bg-primary/10 border-primary/30"
                          : i === 0
                          ? "bg-accent/5 border-accent/20"
                          : "bg-card/50 border-border/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {lance.profiles?.nome_completo ?? "Comprador"}
                            {lance.comprador_id === currentUserId && (
                              <span className="text-xs text-primary ml-1.5">(Você)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lance.profiles?.cidade}{lance.profiles?.estado ? `, ${lance.profiles.estado}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-display font-bold text-lg">
                            {formatCurrency(lance.valor)}
                          </span>
                          {lance.status === "aceito" && (
                            <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">Aceito</Badge>
                          )}
                          {i === 0 && lance.status !== "aceito" && (
                            <Badge variant="outline" className="ml-2 border-accent/30 text-accent text-[10px]">
                              Maior
                            </Badge>
                          )}
                        </div>

                        {isVendedor && anuncio.status !== "finalizado" && lance.status !== "aceito" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => handleAcceptBid(lance)}
                          >
                            Aceitar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Timer */}
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tempo Restante</h3>
              <CountdownTimer endDate={new Date(anuncio.data_fim)} />
            </div>

            {/* Vendedor info */}
            {vendedor && (
              <div className="glass rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendedor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{vendedor.nome_completo}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {vendedor.cidade}, {vendedor.estado}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  ⭐ Reputação: <span className="font-semibold text-foreground">{vendedor.reputacao}</span>
                </div>
              </div>
            )}

            {/* Bid button */}
            {!isVendedor && anuncio.status !== "finalizado" && !aceito && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  if (!currentUserId) {
                    navigate("/auth");
                    return;
                  }
                  setBidModalOpen(true);
                }}
              >
                <Gavel className="w-4 h-4 mr-2" /> Dar Lance
              </Button>
            )}

            {aceito && (
              <div className="glass rounded-xl p-5 text-center space-y-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">Proposta Aceita</Badge>
                <p className="text-sm text-muted-foreground">
                  Este anúncio foi finalizado.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modals */}
      {anuncio && (
        <BidModal
          open={bidModalOpen}
          onOpenChange={setBidModalOpen}
          anuncio={anuncio}
          currentMax={maxLance}
          userId={currentUserId!}
          onSuccess={handleBidSuccess}
        />
      )}

      {selectedLance && (
        <AcceptBidModal
          open={acceptModalOpen}
          onOpenChange={setAcceptModalOpen}
          lance={selectedLance}
          anuncioTitulo={anuncio.titulo}
          onConfirm={handleAcceptConfirm}
        />
      )}
    </div>
  );
};

export default AnuncioDetalhe;
