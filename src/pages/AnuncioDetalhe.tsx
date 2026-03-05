import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import BidModal from "@/components/BidModal";
import AcceptBidModal from "@/components/AcceptBidModal";
import ImageGallery from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, MapPin, Tag, AlertTriangle, Gavel, TrendingUp,
  User, Calendar, DollarSign, Trash2, Pencil, XCircle,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { anuncioStatusConfig, formatCurrency } from "@/lib/statusConfig";
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
  const [anuncioImages, setAnuncioImages] = useState<{ id: string; url: string }[]>([]);
  const { toast } = useToast();

  const fetchLances = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from("lances")
        .select("*, profiles!lances_comprador_id_fkey(*)")
        .eq("anuncio_id", id)
        .order("valor", { ascending: false });
      setLances((data as LanceWithProfile[]) ?? []);
    } catch (err) {
      console.error("Erro ao buscar propostas:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);

        if (!id) return;

        const { data: anuncioData, error: anuncioErr } = await supabase
          .from("anuncios")
          .select("*")
          .eq("id", id)
          .single();

        if (anuncioErr || !anuncioData) {
          navigate("/anuncios");
          return;
        }
        setAnuncio(anuncioData);

        const { data: imgData } = await supabase
          .from("anuncio_imagens")
          .select("id, url")
          .eq("anuncio_id", anuncioData.id)
          .order("ordem");
        setAnuncioImages(imgData ?? []);

        const { data: vendedorData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", anuncioData.vendedor_id)
          .single();
        setVendedor(vendedorData);

        await fetchLances();
      } catch (err) {
        console.error("Erro ao carregar anúncio:", err);
        toast({ title: "Erro ao carregar", description: "Tente novamente.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel(`lances-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lances", filter: `anuncio_id=eq.${id}` },
        () => fetchLances()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, navigate]);

  const isVendedor = currentUserId === anuncio?.vendedor_id;
  const maxLance = lances.length > 0 ? lances[0].valor : null;
  const aceito = lances.find((l) => l.status === "aceito");
  const isActive = anuncio?.status === "ativo" || anuncio?.status === "aguardando_escolha";

  const handleBidSuccess = async () => {
    setBidModalOpen(false);
    await fetchLances();
  };

  const handleDeleteLance = async (lanceId: string) => {
    try {
      const { error } = await supabase.from("lances").delete().eq("id", lanceId);
      if (error) {
        toast({ title: "Erro ao apagar proposta", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Proposta apagada com sucesso" });
        await fetchLances();
      }
    } catch (err) {
      console.error("Erro ao apagar proposta:", err);
      toast({ title: "Erro inesperado", variant: "destructive" });
    }
  };

  const handleAcceptBid = (lance: LanceWithProfile) => {
    setSelectedLance(lance);
    setAcceptModalOpen(true);
  };

  const handleCancelAnuncio = async () => {
    if (!anuncio || !currentUserId) return;
    try {
      if (lances.length > 0) {
        const uniqueBidders = [...new Set(lances.map(l => l.comprador_id))];
        await supabase.from("notificacoes").insert(
          uniqueBidders.map(bidderId => ({
            user_id: bidderId,
            titulo: "Anúncio cancelado",
            mensagem: `O anúncio "${anuncio.titulo}" foi cancelado pelo vendedor.`,
            tipo: "cancelamento",
          }))
        );
      }
      const { error } = await supabase
        .from("anuncios")
        .update({ status: "cancelado" as any })
        .eq("id", anuncio.id);
      if (error) {
        toast({ title: "Erro ao cancelar", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Anúncio cancelado", description: "Todos os interessados foram notificados." });
      const { data: updated } = await supabase.from("anuncios").select("*").eq("id", anuncio.id).single();
      if (updated) setAnuncio(updated);
    } catch (err) {
      console.error("Erro ao cancelar:", err);
      toast({ title: "Erro inesperado", variant: "destructive" });
    }
  };

  const handleDeleteAnuncio = async () => {
    if (!anuncio) return;
    try {
      // Delete images from storage first
      if (anuncioImages.length > 0) {
        const paths = anuncioImages.map(img => {
          const url = new URL(img.url);
          const parts = url.pathname.split("/storage/v1/object/public/anuncio-imagens/");
          return parts[1] || "";
        }).filter(Boolean);
        if (paths.length > 0) {
          await supabase.storage.from("anuncio-imagens").remove(paths);
        }
      }
      // Delete image records
      await supabase.from("anuncio_imagens").delete().eq("anuncio_id", anuncio.id);
      // Delete lances
      await supabase.from("lances").delete().eq("anuncio_id", anuncio.id);
      // Delete anuncio
      const { error } = await supabase.from("anuncios").delete().eq("id", anuncio.id);
      if (error) {
        toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Anúncio excluído permanentemente" });
      navigate("/dashboard/anuncios");
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast({ title: "Erro inesperado", variant: "destructive" });
    }
  };

  const handleAcceptConfirm = async () => {
    if (!selectedLance || !anuncio) return;
    try {
      await supabase.from("lances").update({ status: "aceito" }).eq("id", selectedLance.id);
      await supabase.from("anuncios").update({ status: "finalizado" }).eq("id", anuncio.id);

      const phone = selectedLance.profiles?.whatsapp?.replace(/\D/g, "") ?? "";
      const msg = encodeURIComponent(
        `Olá, vi sua proposta no O Catireiro e aceitei sua oferta pelo ${anuncio.titulo}!`
      );
      window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${msg}`, "_blank");

      setAcceptModalOpen(false);
      const { data: updated } = await supabase.from("anuncios").select("*").eq("id", anuncio.id).single();
      if (updated) setAnuncio(updated);
      await fetchLances();
    } catch (err) {
      console.error("Erro ao aceitar proposta:", err);
      toast({ title: "Erro inesperado", variant: "destructive" });
    }
  };

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

  const status = anuncioStatusConfig[anuncio.status] ?? anuncioStatusConfig.ativo;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={anuncioImages} />

            {/* Header card */}
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={status.className}>{status.label}</Badge>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      <Tag className="w-3 h-3 mr-1" />{anuncio.categoria}
                    </Badge>
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">{anuncio.titulo}</h1>
                </div>

                {/* Action buttons - always visible for the seller */}
                {isVendedor && (
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {/* Edit - only for active listings */}
                    {isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => navigate(`/editar-anuncio/${anuncio.id}`)}
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </Button>
                    )}

                    {/* Cancel - only for active listings */}
                    {isActive && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar anúncio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja cancelar este anúncio? Todos os compradores que fizeram propostas serão notificados. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={handleCancelAnuncio}
                            >
                              Sim, cancelar anúncio
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Delete permanently - for finalized or cancelled */}
                    {(anuncio.status === "finalizado" || anuncio.status === "cancelado") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir anúncio permanentemente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Este anúncio e todas as suas propostas serão removidos permanentemente. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={handleDeleteAnuncio}
                            >
                              Sim, excluir permanentemente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
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
                    <TrendingUp className="w-3 h-3" /> Maior Proposta
                  </span>
                  <span className="font-display font-bold text-primary">
                    {maxLance ? formatCurrency(maxLance) : "—"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gavel className="w-3 h-3" /> Propostas
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
                <Gavel className="w-5 h-5 text-primary" /> Propostas Recebidas
              </h2>

              {lances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma proposta ainda. Seja o primeiro!
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
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {lance.profiles?.nome_completo ?? "Comprador"}
                            {lance.comprador_id === currentUserId && (
                              <span className="text-xs text-primary ml-1.5">(Você)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lance.profiles?.cidade}{lance.profiles?.estado ? `, ${lance.profiles.estado}` : ""}
                          </p>
                          {isVendedor && lance.mensagem && (
                            <p className="text-xs text-foreground/80 mt-1 italic bg-muted/50 rounded px-2 py-1">
                              💬 {lance.mensagem}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-display font-bold text-lg">
                            {formatCurrency(lance.valor)}
                          </span>
                          {lance.status === "aceito" && (
                            <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">Aceita</Badge>
                          )}
                          {aceito && lance.status !== "aceito" && (
                            <Badge variant="outline" className="ml-2 border-destructive/30 text-destructive text-[10px]">
                              Não Aceita
                            </Badge>
                          )}
                          {!aceito && lance.status === "pendente" && (
                            <Badge variant="outline" className="ml-2 border-muted-foreground/30 text-muted-foreground text-[10px]">
                              Pendente
                            </Badge>
                          )}
                          {!aceito && i === 0 && (
                            <Badge variant="outline" className="ml-2 border-accent/30 text-accent text-[10px]">
                              Maior
                            </Badge>
                          )}
                        </div>

                        {lance.comprador_id === currentUserId && anuncio.status !== "finalizado" && lance.status !== "aceito" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteLance(lance.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}

                        {isVendedor && isActive && lance.status !== "aceito" && (
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
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tempo Restante</h3>
              <CountdownTimer endDate={new Date(anuncio.data_fim)} stopped={!!aceito} />
            </div>

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

            {!isVendedor && isActive && !aceito && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  if (!currentUserId) { navigate("/auth"); return; }
                  setBidModalOpen(true);
                }}
              >
                <Gavel className="w-4 h-4 mr-2" /> Fazer Proposta
              </Button>
            )}

            {aceito && (
              <div className="glass rounded-xl p-5 text-center space-y-3">
                <Badge className="bg-primary/20 text-primary border-primary/30">Proposta Aceita</Badge>
                <p className="text-sm text-muted-foreground">Este anúncio foi finalizado.</p>
                {isVendedor && aceito.profiles?.whatsapp && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      const phone = aceito.profiles?.whatsapp?.replace(/\D/g, "") ?? "";
                      const msg = encodeURIComponent(
                        `Olá, vi sua proposta no O Catireiro e aceitei sua oferta pelo ${anuncio.titulo}!`
                      );
                      window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${msg}`, "_blank");
                    }}
                  >
                    💬 WhatsApp do Comprador
                  </Button>
                )}
              </div>
            )}

            {anuncio.status === "cancelado" && (
              <div className="glass rounded-xl p-5 text-center space-y-2">
                <Badge className="bg-destructive/20 text-destructive border-destructive/30">Cancelado</Badge>
                <p className="text-sm text-muted-foreground">Este anúncio foi cancelado.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

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
