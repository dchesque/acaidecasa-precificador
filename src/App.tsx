import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Configuracoes from "./pages/Configuracoes";
import Fornecedores from "./pages/Fornecedores";
import Insumos from "./pages/Insumos";
import Embalagens from "./pages/Embalagens";
import Receitas from "./pages/Receitas";
import CoposBase from "./pages/CoposBase";
import Combinados from "./pages/Combinados";
import Cardapio from "./pages/Cardapio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/embalagens" element={<Embalagens />} />
          <Route path="/receitas" element={<Receitas />} />
          <Route path="/copos-base" element={<CoposBase />} />
          <Route path="/combinados" element={<Combinados />} />
          <Route path="/cardapio" element={<Cardapio />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
