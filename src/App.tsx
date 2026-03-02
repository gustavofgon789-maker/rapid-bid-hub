import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Anuncios from "./pages/Anuncios";
import AnuncioDetalhe from "./pages/AnuncioDetalhe";
import ComoFunciona from "./pages/ComoFunciona";
import NovoAnuncio from "./pages/NovoAnuncio";
import EditarAnuncio from "./pages/EditarAnuncio";
import NotFound from "./pages/NotFound";

// Dashboard pages
import DashboardMeusAnuncios from "./pages/dashboard/MeusAnuncios";
import PropostasRecebidas from "./pages/dashboard/PropostasRecebidas";
import VendasAndamento from "./pages/dashboard/VendasAndamento";
import VendasConcluidas from "./pages/dashboard/VendasConcluidas";
import HistoricoVendas from "./pages/dashboard/HistoricoVendas";
import PropostasEnviadas from "./pages/dashboard/PropostasEnviadas";
import ComprasAndamento from "./pages/dashboard/ComprasAndamento";
import ComprasConcluidas from "./pages/dashboard/ComprasConcluidas";
import HistoricoCompras from "./pages/dashboard/HistoricoCompras";
import Configuracoes from "./pages/dashboard/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/anuncios" element={<Anuncios />} />
            <Route path="/anuncio/:id" element={<AnuncioDetalhe />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/novo-anuncio" element={<NovoAnuncio />} />
            <Route path="/editar-anuncio/:id" element={<EditarAnuncio />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<Navigate to="/dashboard/anuncios" replace />} />
            <Route path="/dashboard/anuncios" element={<DashboardMeusAnuncios />} />
            <Route path="/dashboard/propostas-recebidas" element={<PropostasRecebidas />} />
            <Route path="/dashboard/vendas-andamento" element={<VendasAndamento />} />
            <Route path="/dashboard/vendas-concluidas" element={<VendasConcluidas />} />
            <Route path="/dashboard/historico-vendas" element={<HistoricoVendas />} />
            <Route path="/dashboard/propostas-enviadas" element={<PropostasEnviadas />} />
            <Route path="/dashboard/compras-andamento" element={<ComprasAndamento />} />
            <Route path="/dashboard/compras-concluidas" element={<ComprasConcluidas />} />
            <Route path="/dashboard/historico-compras" element={<HistoricoCompras />} />
            <Route path="/dashboard/configuracoes" element={<Configuracoes />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
