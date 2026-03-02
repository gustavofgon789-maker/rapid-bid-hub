import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon } from "lucide-react";
import { lanceStatusConfig, formatCurrency } from "@/lib/statusConfig";

const HistoricoVendas = () => {
  const { user } = useAuth();
  const [lances, setLances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("lances")
        .select("*, anuncios!inner(titulo, id, vendedor_id), profiles!lances_comprador_id_fkey(nome_completo)")
        .eq("anuncios.vendedor_id", user.id)
        .order("created_at", { ascending: false });
      setLances(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Histórico de Vendas</h1>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : lances.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          <HistoryIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
          Nenhum histórico.
        </div>
      ) : (
        <div className="space-y-3">
          {lances.map((l) => {
            const st = lanceStatusConfig[l.status] ?? lanceStatusConfig.pendente;
            return (
              <div key={l.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/anuncio/${l.anuncio_id}`} className="font-medium text-sm hover:text-primary truncate block">{l.anuncios?.titulo}</Link>
                  <p className="text-xs text-muted-foreground">{l.profiles?.nome_completo ?? "Comprador"} · {new Date(l.created_at).toLocaleDateString("pt-BR")}</p>
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

export default HistoricoVendas;
