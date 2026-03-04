import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notificacao {
  id: string; titulo: string; mensagem: string; lida: boolean; tipo: string; link: string | null; created_at: string;
}

const Notificacoes = () => {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("notificacoes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setNotificacoes((data as Notificacao[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notificacoes").update({ lida: true } as any).eq("id", id);
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const markAllAsRead = async () => {
    const unread = notificacoes.filter((n) => !n.lida);
    if (unread.length === 0) return;
    for (const n of unread) { await supabase.from("notificacoes").update({ lida: true } as any).eq("id", n.id); }
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const unreadCount = notificacoes.filter((n) => !n.lida).length;
  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout>
      <DashboardPageHeader
        title="Notificações"
        description={unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia!"}
        icon={<Bell className="w-5 h-5 text-primary" />}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1.5" /> Marcar todas
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : notificacoes.length === 0 ? (
        <DashboardEmptyState icon={<Bell className="w-8 h-8 text-muted-foreground/50" />} title="Nenhuma notificação" description="Quando algo importante acontecer, você será notificado aqui." />
      ) : (
        <div className="space-y-3">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className={`glass rounded-2xl p-4 md:p-5 flex items-start gap-4 transition-all ${
                !n.lida ? "border-l-4 border-l-primary" : "opacity-60"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{n.titulo}</span>
                  {n.tipo === "cancelamento" && (
                    <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px]">Cancelamento</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{n.mensagem}</p>
                <p className="text-xs text-muted-foreground/70 mt-1.5">{formatDate(n.created_at)}</p>
              </div>
              {!n.lida && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="shrink-0">
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Notificacoes;
