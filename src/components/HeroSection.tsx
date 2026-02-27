import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(160_64%_39%_/_0.03),_transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-accent mb-8">
            <Zap className="w-3.5 h-3.5" />
            Negociação rápida com propostas em tempo real
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight mb-6">
            Precisa vender{" "}
            <span className="text-gradient-urgency">rápido?</span>
            <br />
            Aqui é a{" "}
            <span className="text-gradient-money">catira</span> certa.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Publique seu item com prazo e preço mínimo. Receba propostas de compradores reais e feche negócio com quem você escolher.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Button size="lg" asChild className="text-base px-8 glow-money">
              <Link to="/auth?tab=register">
                Quero Anunciar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link to="/anuncios">
                Ver Anúncios
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Clock, title: "Timer Real", desc: "Contagem regressiva em cada anúncio" },
              { icon: Zap, title: "Propostas Diretas", desc: "Lance e negocie sem intermediários" },
              { icon: Shield, title: "Avisos de Segurança", desc: "Alertas em cada etapa da negociação" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
