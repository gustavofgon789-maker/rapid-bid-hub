import { Smartphone, Car, Truck, Bike, Package } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Celulares", icon: Smartphone, count: 0 },
  { name: "Carros", icon: Car, count: 0 },
  { name: "Caminhões", icon: Truck, count: 0 },
  { name: "Motos", icon: Bike, count: 0 },
  { name: "Outros", icon: Package, count: 0 },
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
          {categories.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/anuncios?categoria=${name}`}
              className="glass rounded-xl p-6 text-center card-hover group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm">{name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
