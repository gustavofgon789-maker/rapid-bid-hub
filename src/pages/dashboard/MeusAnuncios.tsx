import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import CountdownTimer from "@/components/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, DollarSign, TrendingUp, Gavel, XCircle, Megaphone } from "lucide-react";
import { anuncioStatusConfig, formatCurrency } from "@/lib/statusConfig";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DashboardMeusAnuncios = () => {
  const { user } = useAuth();
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("anuncios")
        .select("*, lances(valor, status)")
        .eq("vendedor_id", user.id)
        .order("created_at", { ascending: false });
      setAnuncios(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleCancelAnuncio = async (anuncioId: string, titulo: string) => {
    const { data: lances } = await supabase
      .from("lances").select("comprador_id").eq("anuncio_id", anuncioId);
    if (lances && lances.length > 0) {
      const uniqueBidders = [...new Set(lances.map(l => l.comprador_id))];
      await supabase.from("notificacoes").insert(
        uniqueBidders.map(bidderId => ({
          user_id: bidderId, titulo: "Anúncio cancelado",
          mensagem: `O anúncio "${titulo}" foi cancelado pelo vendedor.`, tipo: "cancelamento",
        }))
      );
    }
    const { error } = await supabase.from("anuncios").update({ status: "cancelado" as any }).eq("id", anuncioId);
    if (error) { toast({ title: "Erro ao cancelar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Anúncio cancelado", description: "Interessados foram notificados." });
    setAnuncios(prev => prev.map(a => a.id === anuncioId ? { ...a, status: "cancelado" } : a));
  };

  return (
    <DashboardLayout>
      <DashboardPageHeader
        title="Meus Anúncios"
        description="Gerencie todos os seus anúncios ativos"
        icon={<Megaphone className="w-5 h-5 text-primary" />}
        actions={
          <Button asChild>
            <Link to="/novo-anuncio"><Plus className="w-4 h-4 mr-2" /> Novo Anúncio</Link>
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : anuncios.length === 0 ? (
        <DashboardEmptyState
          icon={<Megaphone className="w-8 h-8 text-muted-foreground/50" />}
          title="Nenhum anúncio criado ainda"
          description="Crie seu primeiro anúncio e comece a receber propostas!"
          action={<Button asChild><Link to="/novo-anuncio"><Plus className="w-4 h-4 mr-2" /> Criar Anúncio</Link></Button>}
        />
      ) : (
        <div className="space-y-4">
          {anuncios.map((a) => {
            const maxLance = a.lances?.length > 0 ? Math.max(...a.lances.map((l: any) => l.valor)) : null;
            const aceito = a.lances?.find((l: any) => l.status === "aceito");
            const st = anuncioStatusConfig[a.status] ?? anuncioStatusConfig.ativo;

            return (
              <div key={a.id} className="glass rounded-2xl p-5 md:p-6 card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <Badge variant="outline" className={st.className}>{st.label}</Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground text-xs">{a.categoria}</Badge>
                    </div>
                    <Link to={`/anuncio/${a.id}`} className="font-display font-semibold text-lg hover:text-primary transition-colors block">
                      {a.titulo}
                    </Link>
                    <div className="flex items-center gap-4 mt-2.5 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Min: {formatCurrency(a.preco_minimo)}</span>
                      {maxLance && <span className="flex items-center gap-1 text-primary"><TrendingUp className="w-3.5 h-3.5" /> Maior: {formatCurrency(maxLance)}</span>}
                      <span className="flex items-center gap-1"><Gavel className="w-3.5 h-3.5" /> {a.lances?.length ?? 0} proposta{(a.lances?.length ?? 0) !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <CountdownTimer endDate={new Date(a.data_fim)} compact stopped={!!aceito} />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/anuncio/${a.id}`}><Eye className="w-3.5 h-3.5 mr-1" /> Ver</Link>
                      </Button>
                      {a.status !== "finalizado" && a.status !== "cancelado" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar anúncio?</AlertDialogTitle>
                              <AlertDialogDescription>Tem certeza? Todos os compradores que fizeram propostas serão notificados.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Voltar</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleCancelAnuncio(a.id, a.titulo)}>Sim, cancelar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardMeusAnuncios;
