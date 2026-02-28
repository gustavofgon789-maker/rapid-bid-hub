import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Constants } from "@/integrations/supabase/types";

const categorias = Constants.public.Enums.categoria_tipo;

const NovoAnuncio = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<string>("Outros");
  const [precoMinimo, setPrecoMinimo] = useState("");
  const [duracaoDias, setDuracaoDias] = useState("7");
  const [motivoUrgencia, setMotivoUrgencia] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!titulo.trim()) {
      toast.error("Informe o título do anúncio.");
      return;
    }
    const preco = parseFloat(precoMinimo);
    if (isNaN(preco) || preco <= 0) {
      toast.error("Informe um preço mínimo válido.");
      return;
    }
    const dias = parseInt(duracaoDias);
    if (isNaN(dias) || dias < 1 || dias > 30) {
      toast.error("A duração deve ser entre 1 e 30 dias.");
      return;
    }

    setSubmitting(true);
    try {
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + dias);

      const { error } = await supabase.from("anuncios").insert({
        vendedor_id: user.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria: categoria as any,
        preco_minimo: preco,
        duracao_dias: dias,
        data_fim: dataFim.toISOString(),
        motivo_urgencia: motivoUrgencia.trim() || null,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Anúncio criado com sucesso!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro ao criar anúncio:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 flex justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6 gap-2 text-muted-foreground"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Button>

        <div className="glass rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Novo Anúncio</h1>
              <p className="text-muted-foreground text-sm">
                Preencha os detalhes para criar seu anúncio
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ex: iPhone 15 Pro Max 256GB"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o produto ou serviço em detalhes..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço Mínimo (R$) *</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={precoMinimo}
                  onChange={(e) => setPrecoMinimo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (dias)</Label>
                <Select value={duracaoDias} onValueChange={setDuracaoDias}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 3, 5, 7, 14, 21, 30].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} dia{d !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgencia">Motivo de Urgência</Label>
                <Input
                  id="urgencia"
                  placeholder="Ex: Preciso vender até sexta"
                  value={motivoUrgencia}
                  onChange={(e) => setMotivoUrgencia(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Criando..." : "Criar Anúncio"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NovoAnuncio;
