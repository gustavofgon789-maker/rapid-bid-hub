import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lanceStatusConfig, anuncioStatusConfig, formatCurrency } from "@/lib/statusConfig";

const PropostasEnviadas = () => {
  const { user } = useAuth();
  const [lances, setLances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("lances")
        .select("*, anuncios(titulo, id, status, vendedor_id, profiles!anuncios_vendedor_id_fkey(nome_completo))")
        .eq("comprador_id", user.id)
        .in("status", ["pendente"])
        .order("created_at", { ascending: false });
      setLances(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Propostas Enviadas</h1>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : lances.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          Nenhuma proposta pendente.
        </div>
      ) : (
        <div className="space-y-3">
          {lances.map((l) => {
            const isFinalizado = l.anuncios?.status === "finalizado";
            const isRejected = isFinalizado && l.status === "pendente";
            const st = isRejected
              ? { label: "Não Aceita", className: "bg-destructive/20 text-destructive border-destructive/30" }
              : (lanceStatusConfig[l.status] ?? lanceStatusConfig.pendente);

            return (
              <div key={l.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/anuncio/${l.anuncio_id}`} className="font-medium text-sm hover:text-primary truncate block">{l.anuncios?.titulo}</Link>
                  <p className="text-xs text-muted-foreground">Vendedor: {l.anuncios?.profiles?.nome_completo ?? "—"}</p>
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

export default PropostasEnviadas;
