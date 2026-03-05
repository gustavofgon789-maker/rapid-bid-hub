import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { geocodeCity } from "@/lib/geo";

const Configuracoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [hasCoords, setHasCoords] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setNome(data.nome_completo);
        setWhatsapp(data.whatsapp);
        setCidade(data.cidade);
        setEstado(data.estado);
        setHasCoords(data.latitude != null && data.longitude != null);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Geocode city/state
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (cidade.trim() && estado.trim()) {
      const coords = await geocodeCity(cidade.trim(), estado.trim());
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    const { error } = await supabase.from("profiles").update({
      nome_completo: nome.trim(),
      whatsapp: whatsapp.trim(),
      cidade: cidade.trim(),
      estado: estado.trim(),
      ...(latitude != null && { latitude, longitude }),
    }).eq("user_id", user.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setHasCoords(latitude != null);
      toast({ title: "Perfil atualizado com sucesso!" });
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <DashboardPageHeader title="Configurações" description="Gerencie seus dados pessoais" icon={<Settings className="w-5 h-5 text-primary" />} />

      {loading ? (
        <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />
      ) : (
        <div className="glass rounded-2xl p-6 md:p-8 max-w-lg space-y-6">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="11999999999" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="SP" />
            </div>
          </div>
          {!hasCoords && cidade && estado && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Salve para ativar sua localização no radar de anúncios.</span>
            </div>
          )}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Configuracoes;
