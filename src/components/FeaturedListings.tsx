import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ListingCard from "./ListingCard";

const FeaturedListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from("anuncios")
        .select("*, profiles!anuncios_vendedor_id_fkey(cidade, estado), lances(valor)")
        .eq("status", "ativo")
        .order("data_fim", { ascending: true })
        .limit(6);

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
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          Carregando anúncios...
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
            🔥 Catiras em <span className="text-gradient-urgency">destaque</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            Nenhum anúncio ativo no momento. Seja o primeiro a anunciar!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              🔥 Catiras em <span className="text-gradient-urgency">destaque</span>
            </h2>
            <p className="text-muted-foreground">Os anúncios mais quentes agora</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
