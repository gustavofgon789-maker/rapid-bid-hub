import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Smartphone, Car, Truck, Bike, Package, Search, MapPin, Flame, Clock, ArrowDownUp, Sofa, Radar, LocateFixed, X } from "lucide-react";
import { haversineDistance, geocodeCity } from "@/lib/geo";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { name: "Celulares", icon: Smartphone, soon: false },
  { name: "Móveis", icon: Sofa, soon: false },
  { name: "Carros", icon: Car, soon: true },
  { name: "Caminhões", icon: Truck, soon: true },
  { name: "Motos", icon: Bike, soon: true },
  { name: "Outros", icon: Package, soon: false },
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
  const { toast } = useToast();

  // Radar state
  const [radarActive, setRadarActive] = useState(false);
  const [radarKm, setRadarKm] = useState(50);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleActivateRadar = () => {
    if (radarActive) {
      setRadarActive(false);
      setUserCoords(null);
      return;
    }
    setGeoLoading(true);
    if (!navigator.geolocation) {
      toast({ title: "Geolocalização não suportada", description: "Seu navegador não suporta geolocalização.", variant: "destructive" });
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setRadarActive(true);
        setGeoLoading(false);
        toast({ title: "Radar ativado!", description: `Mostrando anúncios em até ${radarKm}km de você.` });
      },
      () => {
        toast({ title: "Localização negada", description: "Permita o acesso à localização para usar o radar.", variant: "destructive" });
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const fetchListings = async () => {
      let query = supabase
        .from("anuncios")
        .select("*, profiles!anuncios_vendedor_id_fkey(cidade, estado, latitude, longitude), lances(valor), anuncio_imagens(url, ordem)")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });

      if (activeCategory) {
        query = query.eq("categoria", activeCategory as any);
      }

      const { data } = await query;

      const mapped = (data ?? []).map((a: any) => {
        const sortedImgs = (a.anuncio_imagens ?? []).sort((x: any, y: any) => x.ordem - y.ordem);
        return {
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
          imagem_url: sortedImgs[0]?.url,
          latitude: a.profiles?.latitude,
          longitude: a.profiles?.longitude,
        };
      });

      setListings(mapped);
      setLoading(false);
    };

    fetchListings();
  }, [activeCategory]);

  const filteredAndSorted = useMemo(() => {
    let result = [...listings];

    // Filter by location text
    if (locationSearch.trim()) {
      const search = locationSearch.toLowerCase().trim();
      result = result.filter((l) => l.localizacao.toLowerCase().includes(search));
    }

    // Filter by radar distance
    if (radarActive && userCoords) {
      result = result.filter((l) => {
        if (l.latitude == null || l.longitude == null) return false;
        const dist = haversineDistance(userCoords.lat, userCoords.lng, l.latitude, l.longitude);
        return dist <= radarKm;
      });
    }

    // Sort
    switch (sortBy) {
      case "urgentes":
        result.sort((a, b) => {
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
        break;
    }

    return result;
  }, [listings, locationSearch, sortBy, radarActive, radarKm, userCoords]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Anúncios</h1>
          <p className="text-muted-foreground mb-8">Encontre a catira perfeita</p>

          {/* Radar section */}
          <div className="glass rounded-2xl p-4 md:p-5 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className={`w-5 h-5 ${radarActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                <span className="font-semibold text-sm">Radar de Proximidade</span>
              </div>
              <Button
                variant={radarActive ? "destructive" : "default"}
                size="sm"
                onClick={handleActivateRadar}
                disabled={geoLoading}
                className="gap-1.5"
              >
                {geoLoading ? (
                  "Localizando..."
                ) : radarActive ? (
                  <><X className="w-3.5 h-3.5" /> Desativar</>
                ) : (
                  <><LocateFixed className="w-3.5 h-3.5" /> Ativar Radar</>
                )}
              </Button>
            </div>

            {radarActive && userCoords && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Raio de busca</span>
                  <Badge variant="secondary" className="text-xs font-bold">{radarKm} km</Badge>
                </div>
                <Slider
                  value={[radarKm]}
                  onValueChange={([v]) => setRadarKm(v)}
                  min={10}
                  max={300}
                  step={10}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>10 km</span>
                  <span>150 km</span>
                  <span>300 km</span>
                </div>
              </div>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por cidade ou estado..."
                className="pl-10"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>
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
            {categories.map(({ name, icon: Icon, soon }) => (
              <Badge
                key={name}
                variant={activeCategory === name ? "default" : "secondary"}
                className={`text-sm px-4 py-1.5 gap-1.5 ${soon ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                onClick={() => !soon && setSearchParams({ categoria: name })}
              >
                <Icon className="w-3.5 h-3.5" />
                {name}
                {soon && <span className="text-[10px] font-bold ml-1">EM BREVE</span>}
              </Badge>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Carregando...</div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-lg">Nenhum anúncio encontrado.</p>
              {radarActive && (
                <p className="text-sm mt-1">Tente aumentar o raio do radar ou desativá-lo.</p>
              )}
              {locationSearch && (
                <p className="text-sm mt-1">Tente limpar o filtro de localização.</p>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">
                {filteredAndSorted.length} anúncio{filteredAndSorted.length !== 1 ? "s" : ""} encontrado{filteredAndSorted.length !== 1 ? "s" : ""}
                {radarActive && ` em até ${radarKm}km`}
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
