import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface BidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anuncio: Tables<"anuncios">;
  currentMax: number | null;
  userId: string;
  onSuccess: () => void;
}

const BidModal = ({ open, onOpenChange, anuncio, currentMax, userId, onSuccess }: BidModalProps) => {
  const [step, setStep] = useState<"warning" | "bid">("warning");
  const [accepted, setAccepted] = useState(false);
  const [valor, setValor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const minValue = currentMax ? currentMax + 0.01 : anuncio.preco_minimo;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("warning");
      setAccepted(false);
      setValor("");
    }
    onOpenChange(v);
  };

  const handleSubmitBid = async () => {
    const numVal = parseFloat(valor.replace(",", "."));
    if (isNaN(numVal) || numVal < minValue) {
      toast({
        title: "Valor inválido",
        description: `O lance deve ser de pelo menos ${formatCurrency(minValue)}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("lances").insert({
      anuncio_id: anuncio.id,
      comprador_id: userId,
      valor: numVal,
    });

    if (error) {
      toast({
        title: "Erro ao dar lance",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Lance registrado!", description: `Seu lance de ${formatCurrency(numVal)} foi enviado.` });
      onSuccess();
    }
    setSubmitting(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="glass border-border/50 max-w-md">
        {step === "warning" ? (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-accent" />
                </div>
                <AlertDialogTitle className="font-display text-lg">⚠️ AVISO IMPORTANTE</AlertDialogTitle>
              </div>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm">
                  <p className="text-foreground font-medium">
                    O Catireiro é apenas um intermediário. Leia com atenção:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span><strong>NUNCA</strong> transfira dinheiro sem ver o produto pessoalmente.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Verifique se o item está no nome do anunciante.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Marque encontros em <strong>locais públicos</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>O site <strong>não se responsabiliza</strong> pela negociação.</span>
                    </li>
                  </ul>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <Checkbox
                      id="accept-terms"
                      checked={accepted}
                      onCheckedChange={(c) => setAccepted(c === true)}
                    />
                    <label htmlFor="accept-terms" className="text-sm font-medium text-foreground cursor-pointer">
                      Estou ciente dos riscos e desejo prosseguir
                    </label>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button disabled={!accepted} onClick={() => setStep("bid")}>
                Continuar
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-lg">Dar Lance</AlertDialogTitle>
              <AlertDialogDescription>
                Informe o valor do seu lance para <strong>{anuncio.titulo}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Preço mínimo:</span>{" "}
                  <span className="font-semibold text-primary">{formatCurrency(anuncio.preco_minimo)}</span>
                </div>
                {currentMax && (
                  <div>
                    <span className="text-muted-foreground">Maior lance:</span>{" "}
                    <span className="font-semibold text-accent">{formatCurrency(currentMax)}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="bid-value" className="text-xs">Seu lance (R$)</Label>
                <Input
                  id="bid-value"
                  type="number"
                  step="0.01"
                  min={minValue}
                  placeholder={formatCurrency(minValue)}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="mt-1 text-lg font-display font-bold"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo: {formatCurrency(minValue)}
                </p>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button onClick={handleSubmitBid} disabled={submitting}>
                {submitting ? "Enviando..." : "Confirmar Lance"}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BidModal;
