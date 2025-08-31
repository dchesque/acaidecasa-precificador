import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Users, 
  Package, 
  Archive, 
  ChefHat, 
  Coffee, 
  Layers, 
  MenuSquare 
} from "lucide-react";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: MenuSquare, path: "/" },
  { id: "configuracoes", label: "Configurações", icon: Settings, path: "/configuracoes" },
  { id: "fornecedores", label: "Fornecedores", icon: Users, path: "/fornecedores" },
  { id: "insumos", label: "Insumos", icon: Package, path: "/insumos" },
  { id: "embalagens", label: "Embalagens", icon: Archive, path: "/embalagens" },
  { id: "receitas", label: "Receitas", icon: ChefHat, path: "/receitas" },
  { id: "copos-base", label: "Copos Base", icon: Coffee, path: "/copos-base" },
  { id: "combinados", label: "Combinados", icon: Layers, path: "/combinados" },
  { id: "cardapio", label: "Cardápio", icon: MenuSquare, path: "/cardapio" },
];

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-64 bg-white border-r border-border p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};