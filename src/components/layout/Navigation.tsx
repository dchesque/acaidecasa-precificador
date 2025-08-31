import { useState } from "react";
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
  { id: "dashboard", label: "Dashboard", icon: MenuSquare, active: true },
  { id: "configuracoes", label: "Configurações", icon: Settings },
  { id: "fornecedores", label: "Fornecedores", icon: Users },
  { id: "insumos", label: "Insumos", icon: Package },
  { id: "embalagens", label: "Embalagens", icon: Archive },
  { id: "receitas", label: "Receitas", icon: ChefHat },
  { id: "copos-base", label: "Copos Base", icon: Coffee },
  { id: "combinados", label: "Combinados", icon: Layers },
  { id: "cardapio", label: "Cardápio", icon: MenuSquare },
];

export const Navigation = () => {
  const [activeItem, setActiveItem] = useState("dashboard");

  return (
    <nav className="w-64 bg-white border-r border-border p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
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