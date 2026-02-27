import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display text-lg font-bold">O Catireiro</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A plataforma de catira mais rápida do Brasil. Negocie com urgência e segurança.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Navegação</h4>
            <div className="space-y-2">
              <Link to="/anuncios" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Anúncios</Link>
              <Link to="/como-funciona" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Como Funciona</Link>
              <Link to="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Entrar / Cadastrar</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Contato</h4>
            <p className="text-sm text-muted-foreground">contato@ocatireiro.com.br</p>
          </div>
        </div>

        <div className="border-t border-border/30 pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
            O Catireiro não realiza leilões oficiais. Somos uma plataforma de classificados de propostas diretas. 
            A responsabilidade civil, fiscal e criminal da transação é exclusiva dos usuários. 
            Todas as negociações são de responsabilidade das partes envolvidas.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
