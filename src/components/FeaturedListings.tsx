import ListingCard from "./ListingCard";

// Mock data for initial display
const mockListings = [
  {
    id: "1",
    titulo: "iPhone 15 Pro Max 256GB - Preciso vender hoje",
    categoria: "Celulares",
    preco_minimo: 4500,
    maior_lance: 5200,
    total_lances: 8,
    localizacao: "São Paulo, SP",
    data_fim: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    motivo_urgencia: "Mudança para o exterior",
  },
  {
    id: "2",
    titulo: "Honda Civic 2020 Touring - Quitação urgente",
    categoria: "Carros",
    preco_minimo: 95000,
    maior_lance: 102000,
    total_lances: 12,
    localizacao: "Belo Horizonte, MG",
    data_fim: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    motivo_urgencia: "Preciso quitar financiamento",
  },
  {
    id: "3",
    titulo: "Yamaha MT-07 2023 - Só 5 mil km rodados",
    categoria: "Motos",
    preco_minimo: 38000,
    total_lances: 3,
    localizacao: "Curitiba, PR",
    data_fim: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    motivo_urgencia: "Despesas médicas urgentes",
  },
  {
    id: "4",
    titulo: "Samsung Galaxy S24 Ultra 512GB",
    categoria: "Celulares",
    preco_minimo: 3800,
    maior_lance: 4100,
    total_lances: 5,
    localizacao: "Rio de Janeiro, RJ",
    data_fim: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    motivo_urgencia: "Conta atrasada",
  },
  {
    id: "5",
    titulo: "Scania R450 2021 - Completo com baú",
    categoria: "Caminhões",
    preco_minimo: 420000,
    maior_lance: 445000,
    total_lances: 6,
    localizacao: "Goiânia, GO",
    data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    titulo: "Notebook Dell XPS 15 - i7 13ª geração",
    categoria: "Outros",
    preco_minimo: 6500,
    total_lances: 0,
    localizacao: "Florianópolis, SC",
    data_fim: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    motivo_urgencia: "Comprar passagem urgente",
  },
];

const FeaturedListings = () => {
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
          {mockListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
