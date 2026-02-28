import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Smartphone, Car, Truck, Bike, Package, Search, MapPin, Flame, Clock, ArrowDownUp } from "lucide-react";

const categories = [
  { name: "Celulares", icon: Smartphone },
  { name: "Carros", icon: Car },
  { name: "Caminhões", icon: Truck },
  { name: "Motos", icon: Bike },
  { name: "Outros", icon: Package },
];

type SortOption = "recentes" | "urgentes" | "menor_preco" | "maior_preco";

const sortOptions: { value: SortOption; label: string; icon: typeof Clock }[] = [
  { value: "recentes", label: "Mais Recentes", icon: Clock },
  { value: "urgentes", label: "Mais Urgentes", icon: Flame },
  { value: "menor_preco", label: "Menor Preço", icon: ArrowDownUp },
  { value: "maior_preco", label: "Maior Preço", icon: ArrowDownUp },
];

const Anuncios = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recentes");

  useEffect(() => {
    const fetchListings = async () => {
      let query = supabase
        .from("anuncios")
        .select("*, profiles!anuncios_vendedor_id_fkey(cidade, estado), lances(valor)")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });

      if (activeCategory) {
        query = query.eq("categoria", activeCategory as any);
      }

      const { data } = await query;

      const mapped = (data ?? []).map((a: any) => ({
        id: a.id,
        titulo: a.titulo,
        categoria: a.categoria,
        preco_minimo: a.preco_minimo,
        maior_lance: a.lances?.length > 0 ? Math.max(...a.lances.map((l: any) => l.valor)) : undefined,
        total_lances: a.lances?.length ?? 0,
        localizacao: a.profiles ? `${a.profiles.cidade}, ${a.profiles.estado}` : "Brasil",
        data_fim: new Date(a.data_fim),
        motivo_urgencia: a.motivo_urgencia,
        created_at: a.created_at,
      }));

      setListings(mapped);
      setLoading(false);
    };

    fetchListings();
  }, [activeCategory]);

  const filteredAndSorted = useMemo(() => {
    let result = [...listings];

    // Filter by location
    if (locationSearch.trim()) {
      const search = locationSearch.toLowerCase().trim();
      result = result.filter((l) =>
        l.localizacao.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (sortBy) {
      case "urgentes":
        result.sort((a, b) => {
          // Items with motivo_urgencia come first, then by closest deadline
          const aUrgent = a.motivo_urgencia ? 0 : 1;
          const bUrgent = b.motivo_urgencia ? 0 : 1;
          if (aUrgent !== bUrgent) return aUrgent - bUrgent;
          return a.data_fim.getTime() - b.data_fim.getTime();
        });
        break;
      case "menor_preco":
        result.sort((a, b) => a.preco_minimo - b.preco_minimo);
        break;
      case "maior_preco":
        result.sort((a, b) => b.preco_minimo - a.preco_minimo);
        break;
      case "recentes":
      default:
        // Already sorted by created_at desc from the query
        break;
    }

    return result;
  }, [listings, locationSearch, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Anúncios</h1>
          <p className="text-muted-foreground mb-8">Encontre a catira perfeita</p>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Location search */}
            <div className="relative flex-1 max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por cidade ou estado..."
                className="pl-10"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>

            {/* Sort options */}
            <div className="flex flex-wrap gap-2">
              {sortOptions.map(({ value, label, icon: Icon }) => (
                <Badge
                  key={value}
                  variant={sortBy === value ? "default" : "secondary"}
                  className="cursor-pointer text-sm px-3 py-1.5 gap-1.5"
                  onClick={() => setSortBy(value)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge
              variant={!activeCategory ? "default" : "secondary"}
              className="cursor-pointer text-sm px-4 py-1.5"
              onClick={() => setSearchParams({})}
            >
              Todos
            </Badge>
            {categories.map(({ name, icon: Icon }) => (
              <Badge
                key={name}
                variant={activeCategory === name ? "default" : "secondary"}
                className="cursor-pointer text-sm px-4 py-1.5 gap-1.5"
                onClick={() => setSearchParams({ categoria: name })}
              >
                <Icon className="w-3.5 h-3.5" />
                {name}
              </Badge>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Carregando...</div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-lg">Nenhum anúncio encontrado.</p>
              {locationSearch && (
                <p className="text-sm mt-1">
                  Tente limpar o filtro de localização.
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">
                {filteredAndSorted.length} anúncio{filteredAndSorted.length !== 1 ? "s" : ""} encontrado{filteredAndSorted.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSorted.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Anuncios;
