import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon } from "lucide-react";
import { lanceStatusConfig, formatCurrency } from "@/lib/statusConfig";

const HistoricoCompras = () => {
  const { user } = useAuth();
  const [lances, setLances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("lances")
        .select("*, anuncios(titulo, id, profiles!anuncios_vendedor_id_fkey(nome_completo))")
        .eq("comprador_id", user.id)
        .order("created_at", { ascending: false });
      setLances(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <DashboardPageHeader title="Histórico de Compras" description="Todas as suas propostas enviadas" icon={<HistoryIcon className="w-5 h-5 text-primary" />} />

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : lances.length === 0 ? (
        <DashboardEmptyState icon={<HistoryIcon className="w-8 h-8 text-muted-foreground/50" />} title="Nenhum histórico" />
      ) : (
        <div className="space-y-3">
          {lances.map((l) => {
            const isFinalizado = l.anuncios?.status === "finalizado";
            const isRejected = isFinalizado && l.status === "pendente";
            const st = isRejected
              ? { label: "Não Aceita", className: "bg-destructive/20 text-destructive border-destructive/30" }
              : (lanceStatusConfig[l.status] ?? lanceStatusConfig.pendente);
            return (
              <div key={l.id} className="glass rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 card-hover">
                <div className="min-w-0">
                  <Link to={`/anuncio/${l.anuncio_id}`} className="font-medium text-sm hover:text-primary truncate block">{l.anuncios?.titulo}</Link>
                  <p className="text-xs text-muted-foreground">{l.anuncios?.profiles?.nome_completo ?? "Vendedor"} · {new Date(l.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-bold">{formatCurrency(l.valor)}</span>
                  <Badge variant="outline" className={st.className}>{st.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default HistoricoCompras;
