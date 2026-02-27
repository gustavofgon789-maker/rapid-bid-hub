import { Link } from "react-router-dom";
import { Flame, Menu, X, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            O <span className="text-primary">Catireiro</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/anuncios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Anúncios
          </Link>
          <Link to="/como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Como Funciona
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth"><LogIn className="w-4 h-4 mr-1.5" />Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?tab=register"><UserPlus className="w-4 h-4 mr-1.5" />Cadastrar</Link>
            </Button>
          </div>
        </div>

        {/* Mobile */}
        <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden glass border-t border-border/30 px-4 py-4 space-y-3">
          <Link to="/anuncios" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>
            Anúncios
          </Link>
          <Link to="/como-funciona" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>
            Como Funciona
          </Link>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" asChild className="flex-1">
              <Link to="/auth" onClick={() => setMenuOpen(false)}><LogIn className="w-4 h-4 mr-1.5" />Entrar</Link>
            </Button>
            <Button size="sm" asChild className="flex-1">
              <Link to="/auth?tab=register" onClick={() => setMenuOpen(false)}><UserPlus className="w-4 h-4 mr-1.5" />Cadastrar</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
