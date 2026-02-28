import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Car, Truck, Bike, Package } from "lucide-react";

const categories = [
  { name: "Celulares", icon: Smartphone },
  { name: "Carros", icon: Car },
  { name: "Caminhões", icon: Truck },
  { name: "Motos", icon: Bike },
  { name: "Outros", icon: Package },
];

const Anuncios = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      }));

      setListings(mapped);
      setLoading(false);
    };

    fetchListings();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Anúncios</h1>
          <p className="text-muted-foreground mb-8">Encontre a catira perfeita</p>

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
          ) : listings.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">Nenhum anúncio encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Anuncios;
