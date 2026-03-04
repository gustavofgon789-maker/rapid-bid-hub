import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Truck as TruckIcon, MessageSquare } from "lucide-react";
import { lanceStatusConfig, formatCurrency } from "@/lib/statusConfig";
import { useToast } from "@/hooks/use-toast";

const VendasAndamento = () => {
  const { user } = useAuth();
  const [lances, setLances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("lances")
      .select("*, anuncios!inner(titulo, id, vendedor_id, status), profiles!lances_comprador_id_fkey(nome_completo, whatsapp)")
      .eq("anuncios.vendedor_id", user.id)
      .in("status", ["aceito", "aguardando_pagamento", "pago", "enviado"])
      .order("created_at", { ascending: false });
    setLances(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const updateStatus = async (lanceId: string, newStatus: string) => {
    const { error } = await supabase.from("lances").update({ status: newStatus as any }).eq("id", lanceId);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Status atualizado!" }); fetchData(); }
  };

  const nextAction = (status: string, lanceId: string, lance: any) => {
    switch (status) {
      case "aceito": return <Button size="sm" onClick={() => updateStatus(lanceId, "aguardando_pagamento")}>Aguardar Pagamento</Button>;
      case "aguardando_pagamento": {
        const phone = lance.profiles?.whatsapp?.replace(/\D/g, "") ?? "";
        return (
          <Button size="sm" variant="outline" asChild>
            <a href={`https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent("Olá! Estou aguardando o pagamento pelo produto do O Catireiro.")}`} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> WhatsApp
            </a>
          </Button>
        );
      }
      case "pago": return <Button size="sm" onClick={() => updateStatus(lanceId, "enviado")}><TruckIcon className="w-3.5 h-3.5 mr-1" /> Confirmar Envio</Button>;
      case "enviado": return <Badge variant="outline" className="text-xs">Aguardando recebimento</Badge>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <DashboardPageHeader title="Vendas em Andamento" description="Gerencie suas vendas ativas" icon={<TruckIcon className="w-5 h-5 text-primary" />} />

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : lances.length === 0 ? (
        <DashboardEmptyState icon={<TruckIcon className="w-8 h-8 text-muted-foreground/50" />} title="Nenhuma venda em andamento" />
      ) : (
        <div className="space-y-3">
          {lances.map((l) => {
            const st = lanceStatusConfig[l.status] ?? lanceStatusConfig.pendente;
            return (
              <div key={l.id} className="glass rounded-2xl p-4 md:p-5 card-hover">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{l.profiles?.nome_completo ?? "Comprador"}</p>
                      <Link to={`/anuncio/${l.anuncio_id}`} className="text-xs text-muted-foreground hover:text-primary truncate block">{l.anuncios?.titulo}</Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-display font-bold text-primary">{formatCurrency(l.valor)}</span>
                    <Badge variant="outline" className={st.className}>{st.label}</Badge>
                    {nextAction(l.status, l.id, l)}
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

export default VendasAndamento;
