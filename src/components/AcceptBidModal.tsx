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
import { ShieldCheck, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface AcceptBidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lance: Tables<"lances"> & { profiles?: Tables<"profiles"> | null };
  anuncioTitulo: string;
  onConfirm: () => void;
}

const AcceptBidModal = ({ open, onOpenChange, lance, anuncioTitulo, onConfirm }: AcceptBidModalProps) => {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass border-border/50 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <AlertDialogTitle className="font-display text-lg">🔒 SEGURANÇA</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p className="text-foreground font-medium">
                Você está aceitando o lance de{" "}
                <span className="text-primary font-bold">{formatCurrency(lance.valor)}</span> de{" "}
                <span className="font-semibold">{lance.profiles?.nome_completo ?? "Comprador"}</span>{" "}
                pelo item <span className="font-semibold">{anuncioTitulo}</span>.
              </p>

              <p className="text-muted-foreground">Antes de prosseguir, lembre-se:</p>

              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span><strong>Não entregue</strong> o bem sem confirmar o recebimento do dinheiro.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Verifique se o comprador é a <strong>mesma pessoa</strong> do documento.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Em caso de veículos, exija <strong>vistoria em mecânico</strong> de confiança.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>O Catireiro <strong>não garante</strong> a entrega ou o pagamento.</span>
                </li>
              </ul>

              <p className="text-xs text-muted-foreground border-t border-border/30 pt-3">
                Ao confirmar, você será redirecionado para o WhatsApp do comprador.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button onClick={onConfirm}>
            Aceitar e Ir ao WhatsApp
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AcceptBidModal;
