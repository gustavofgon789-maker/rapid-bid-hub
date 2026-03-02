import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Eye } from "lucide-react";
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
      <h1 className="font-display text-2xl font-bold mb-6">Propostas Recebidas</h1>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : lances.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          Nenhuma proposta pendente.
        </div>
      ) : (
        <div className="space-y-3">
          {lances.map((l) => {
            const st = lanceStatusConfig[l.status] ?? lanceStatusConfig.pendente;
            return (
              <div key={l.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{l.profiles?.nome_completo ?? "Comprador"}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.anuncios?.titulo}</p>
                    {l.mensagem && (
                      <p className="text-xs text-foreground/70 italic mt-1 truncate">💬 {l.mensagem}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-bold text-primary">{formatCurrency(l.valor)}</span>
                  <Badge variant="outline" className={st.className}>{st.label}</Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/anuncio/${l.anuncio_id}`}><Eye className="w-3.5 h-3.5" /></Link>
                  </Button>
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
