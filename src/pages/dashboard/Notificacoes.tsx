import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: string;
  link: string | null;
  created_at: string;
}

const Notificacoes = () => {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
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
    for (const n of unread) {
      await supabase.from("notificacoes").update({ lida: true } as any).eq("id", n.id);
    }
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : notificacoes.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nenhuma notificação ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className={`glass rounded-xl p-4 flex items-start gap-4 transition-colors ${
                !n.lida ? "border-l-4 border-l-primary" : "opacity-70"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{n.titulo}</span>
                  {n.tipo === "cancelamento" && (
                    <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px]">
                      Cancelamento
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{n.mensagem}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_at)}</p>
              </div>
              {!n.lida && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
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
