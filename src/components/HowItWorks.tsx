import { PlusCircle, Timer, Gavel, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: PlusCircle,
    title: "Publique seu item",
    desc: "Defina um preço mínimo, escolha o prazo (3, 5, 7 ou 15 dias) e explique o motivo da urgência.",
  },
  {
    icon: Timer,
    title: "Timer ativado",
    desc: "O anúncio entra no ar com contagem regressiva. Compradores veem e fazem propostas.",
  },
  {
    icon: Gavel,
    title: "Escolha a proposta",
    desc: "Quando o timer zerar, escolha qualquer proposta — não precisa ser a maior.",
  },
  {
    icon: MessageSquare,
    title: "Negocie via WhatsApp",
    desc: "Após o aceite, vocês se conectam pelo WhatsApp para finalizar a catira.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Como funciona a <span className="text-gradient-money">catira?</span>
          </h2>
          <p className="text-muted-foreground">Simples, rápido e direto ao ponto</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                <step.icon className="w-7 h-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
