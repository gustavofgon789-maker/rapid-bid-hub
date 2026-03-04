import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import CountdownTimer from "@/components/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, DollarSign, TrendingUp, Gavel, XCircle } from "lucide-react";
import { anuncioStatusConfig, formatCurrency } from "@/lib/statusConfig";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
    // Get bidders
    const { data: lances } = await supabase
      .from("lances")
      .select("comprador_id")
      .eq("anuncio_id", anuncioId);

    if (lances && lances.length > 0) {
      const uniqueBidders = [...new Set(lances.map(l => l.comprador_id))];
      const notifications = uniqueBidders.map(bidderId => ({
        user_id: bidderId,
        titulo: "Anúncio cancelado",
        mensagem: `O anúncio "${titulo}" foi cancelado pelo vendedor.`,
        tipo: "cancelamento",
      }));
      await supabase.from("notificacoes").insert(notifications);
    }

    const { error } = await supabase
      .from("anuncios")
      .update({ status: "cancelado" as any })
      .eq("id", anuncioId);

    if (error) {
      toast({ title: "Erro ao cancelar", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Anúncio cancelado", description: "Interessados foram notificados." });
    setAnuncios(prev => prev.map(a => a.id === anuncioId ? { ...a, status: "cancelado" } : a));
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Meus Anúncios</h1>
        <Button asChild>
          <Link to="/novo-anuncio"><Plus className="w-4 h-4 mr-2" /> Novo Anúncio</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : anuncios.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhum anúncio criado ainda.</p>
          <Button asChild><Link to="/novo-anuncio"><Plus className="w-4 h-4 mr-2" /> Criar Anúncio</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {anuncios.map((a) => {
            const maxLance = a.lances?.length > 0 ? Math.max(...a.lances.map((l: any) => l.valor)) : null;
            const aceito = a.lances?.find((l: any) => l.status === "aceito");
            const st = anuncioStatusConfig[a.status] ?? anuncioStatusConfig.ativo;

            return (
              <div key={a.id} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className={st.className}>{st.label}</Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground text-xs">{a.categoria}</Badge>
                    </div>
                    <Link to={`/anuncio/${a.id}`} className="font-display font-semibold text-lg hover:text-primary transition-colors">
                      {a.titulo}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Min: {formatCurrency(a.preco_minimo)}</span>
                      {maxLance && <span className="flex items-center gap-1 text-primary"><TrendingUp className="w-3.5 h-3.5" /> Maior: {formatCurrency(maxLance)}</span>}
                      <span className="flex items-center gap-1"><Gavel className="w-3.5 h-3.5" /> {a.lances?.length ?? 0} proposta{(a.lances?.length ?? 0) !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <CountdownTimer endDate={new Date(a.data_fim)} compact stopped={!!aceito} />
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/anuncio/${a.id}`}><Eye className="w-3.5 h-3.5 mr-1" /> Ver</Link>
                    </Button>
                    {a.status !== "finalizado" && a.status !== "cancelado" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar anúncio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza? Todos os compradores que fizeram propostas serão notificados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleCancelAnuncio(a.id, a.titulo)}
                            >
                              Sim, cancelar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
