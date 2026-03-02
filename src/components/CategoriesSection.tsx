import { Smartphone, Car, Truck, Bike, Package, Sofa } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Celulares", icon: Smartphone, soon: false },
  { name: "Móveis", icon: Sofa, soon: false },
  { name: "Carros", icon: Car, soon: true },
  { name: "Caminhões", icon: Truck, soon: true },
  { name: "Motos", icon: Bike, soon: true },
  { name: "Outros", icon: Package, soon: false },
];

const CategoriesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Categorias
          </h2>
          <p className="text-muted-foreground">Encontre a melhor catira por categoria</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map(({ name, icon: Icon, soon }) => {
            const content = (
              <div className={`glass rounded-xl p-6 text-center card-hover group relative ${soon ? 'opacity-60 pointer-events-none' : ''}`}>
                {soon && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    Em Breve
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm">{name}</h3>
              </div>
            );

            return soon ? (
              <div key={name}>{content}</div>
            ) : (
              <Link key={name} to={`/anuncios?categoria=${name}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
