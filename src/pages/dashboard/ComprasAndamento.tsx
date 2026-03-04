import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageSquare, CheckCircle } from "lucide-react";
import { lanceStatusConfig, formatCurrency } from "@/lib/statusConfig";
import { useToast } from "@/hooks/use-toast";

const ComprasAndamento = () => {
  const { user } = useAuth();
  const [lances, setLances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("lances")
      .select("*, anuncios(titulo, id, vendedor_id, profiles!anuncios_vendedor_id_fkey(nome_completo, whatsapp))")
      .eq("comprador_id", user.id)
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
      case "aceito":
      case "aguardando_pagamento": {
        const phone = lance.anuncios?.profiles?.whatsapp?.replace(/\D/g, "") ?? "";
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={`https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent("Olá! Vou realizar o pagamento pelo produto do O Catireiro.")}`} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-3.5 h-3.5 mr-1" /> WhatsApp
              </a>
            </Button>
            <Button size="sm" onClick={() => updateStatus(lanceId, "pago")}>Confirmar Pagamento</Button>
          </div>
        );
      }
      case "pago": return <Badge variant="outline" className="text-xs">Aguardando envio</Badge>;
      case "enviado": return <Button size="sm" onClick={() => updateStatus(lanceId, "recebido")}><CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmar Recebimento</Button>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <DashboardPageHeader title="Compras em Andamento" description="Acompanhe suas compras" icon={<ShoppingCart className="w-5 h-5 text-primary" />} />

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : lances.length === 0 ? (
        <DashboardEmptyState icon={<ShoppingCart className="w-8 h-8 text-muted-foreground/50" />} title="Nenhuma compra em andamento" />
      ) : (
        <div className="space-y-3">
          {lances.map((l) => {
            const st = lanceStatusConfig[l.status] ?? lanceStatusConfig.pendente;
            return (
              <div key={l.id} className="glass rounded-2xl p-4 md:p-5 space-y-3 card-hover">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link to={`/anuncio/${l.anuncio_id}`} className="font-medium text-sm hover:text-primary truncate block">{l.anuncios?.titulo}</Link>
                    <p className="text-xs text-muted-foreground">Vendedor: {l.anuncios?.profiles?.nome_completo ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-display font-bold text-primary">{formatCurrency(l.valor)}</span>
                    <Badge variant="outline" className={st.className}>{st.label}</Badge>
                  </div>
                </div>
                <div className="flex justify-end">{nextAction(l.status, l.id, l)}</div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ComprasAndamento;
