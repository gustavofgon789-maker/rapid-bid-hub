export const lanceStatusFlow = [
  "pendente",
  "aceito",
  "recusado",
  "aguardando_pagamento",
  "pago",
  "enviado",
  "recebido",
  "finalizado",
  "cancelado",
] as const;

export type LanceStatusFlow = (typeof lanceStatusFlow)[number];

export const lanceStatusConfig: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-muted text-muted-foreground border-border" },
  aceito: { label: "Proposta Aceita", className: "bg-primary/20 text-primary border-primary/30" },
  recusado: { label: "Não Aceita", className: "bg-destructive/20 text-destructive border-destructive/30" },
  aguardando_pagamento: { label: "Aguardando Pagamento", className: "bg-accent/20 text-accent border-accent/30" },
  pago: { label: "Pago", className: "bg-primary/20 text-primary border-primary/30" },
  enviado: { label: "Enviado", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  recebido: { label: "Recebido", className: "bg-primary/20 text-primary border-primary/30" },
  finalizado: { label: "Finalizado", className: "bg-primary/30 text-primary border-primary/40" },
  cancelado: { label: "Cancelado", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export const anuncioStatusConfig: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-primary/20 text-primary border-primary/30" },
  aguardando_escolha: { label: "Escolha Obrigatória", className: "bg-accent/20 text-accent border-accent/30" },
  finalizado: { label: "Finalizado", className: "bg-muted text-muted-foreground border-border" },
  cancelado: { label: "Cancelado", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
