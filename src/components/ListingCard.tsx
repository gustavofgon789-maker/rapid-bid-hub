import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";

interface ListingCardProps {
  id: string;
  titulo: string;
  categoria: string;
  preco_minimo: number;
  maior_lance?: number;
  total_lances: number;
  localizacao: string;
  data_fim: Date;
  motivo_urgencia?: string;
}

const categoryIcons: Record<string, string> = {
  "Celulares": "📱",
  "Carros": "🚗",
  "Caminhões": "🚛",
  "Motos": "🏍️",
  "Outros": "📦",
};

const ListingCard = ({
  id,
  titulo,
  categoria,
  preco_minimo,
  maior_lance,
  total_lances,
  localizacao,
  data_fim,
  motivo_urgencia,
}: ListingCardProps) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <Link to={`/anuncio/${id}`} className="block group">
      <div className="glass rounded-xl p-5 card-hover h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="text-xs font-medium gap-1">
            <span>{categoryIcons[categoria] || "📦"}</span>
            {categoria}
          </Badge>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {titulo}
        </h3>

        {/* Urgency */}
        {motivo_urgencia && (
          <p className="text-xs text-accent/80 mb-3 line-clamp-1">
            ⚡ {motivo_urgencia}
          </p>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground mb-4">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">{localizacao}</span>
        </div>

        <div className="mt-auto space-y-3">
          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                {maior_lance ? "Maior Proposta" : "Preço Mínimo"}
              </p>
              <p className="font-display font-bold text-lg text-primary">
                {formatCurrency(maior_lance || preco_minimo)}
              </p>
            </div>
            {total_lances > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{total_lances} proposta{total_lances !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="pt-3 border-t border-border/50">
            <CountdownTimer endDate={data_fim} compact />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
