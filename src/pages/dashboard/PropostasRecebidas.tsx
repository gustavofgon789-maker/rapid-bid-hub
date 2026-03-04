import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Eye, ClipboardList } from "lucide-react";
import { lanceStatusConfig, formatCurrency } from "@/lib/statusConfig";

const PropostasRecebidas = () => {
  const { user } = useAuth();
  const [lances, setLances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("lances")
        .select("*, anuncios!inner(titulo, id, vendedor_id, status), profiles!lances_comprador_id_fkey(nome_completo, cidade, estado)")
        .eq("anuncios.vendedor_id", user.id)
        .in("status", ["pendente"])
        .order("created_at", { ascending: false });
      setLances(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <DashboardPageHeader
        title="Propostas Recebidas"
        description="Propostas pendentes nos seus anúncios"
        icon={<ClipboardList className="w-5 h-5 text-primary" />}
      />

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : lances.length === 0 ? (
        <DashboardEmptyState icon={<ClipboardList className="w-8 h-8 text-muted-foreground/50" />} title="Nenhuma proposta pendente" description="Quando alguém fizer uma proposta, ela aparecerá aqui." />
      ) : (
        <div className="space-y-3">
          {lances.map((l) => {
            const st = lanceStatusConfig[l.status] ?? lanceStatusConfig.pendente;
            return (
              <div key={l.id} className="glass rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 card-hover">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{l.profiles?.nome_completo ?? "Comprador"}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.anuncios?.titulo}</p>
                    {l.mensagem && <p className="text-xs text-foreground/70 italic mt-1 truncate">💬 {l.mensagem}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-bold text-primary">{formatCurrency(l.valor)}</span>
                  <Badge variant="outline" className={st.className}>{st.label}</Badge>
                  <Button variant="outline" size="sm" asChild><Link to={`/anuncio/${l.anuncio_id}`}><Eye className="w-3.5 h-3.5" /></Link></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PropostasRecebidas;
