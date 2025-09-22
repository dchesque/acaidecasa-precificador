"use client"
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavItem } from "./NavItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Users,
  Package,
  ChefHat,
  Coffee,
  Layers,
  LayoutDashboard,
  UserCircle,
  Building2,
  MenuSquare,
  User,
  LogOut,
  ChevronUp,
  GlassWater,
  TrendingUp,
  Calculator,
  BarChart3,
  Briefcase
} from "lucide-react";

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { userProfile } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Get user initials for avatar fallback
  const getUserInitials = (nome: string) => {
    if (!nome) return "AC";
    return nome
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    // Implementar lógica de logout aqui
    console.log("Logout");
    // router.push("/login");
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen bg-slate-900 transition-all duration-300 ease-in-out flex flex-col z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header com Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-semibold text-lg">AçaíDeCasa</h1>
              <p className="text-gray-400 text-xs">Precificador inteligente</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <NavItem
          href="/"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          isCollapsed={isCollapsed}
          color="text-blue-400"
        />
        
        <NavItem
          href="/cardapio"
          icon={<MenuSquare className="h-5 w-5" />}
          label="Cardápio"
          isCollapsed={isCollapsed}
          color="text-purple-400"
        />
        
        <NavItem
          href="/receitas"
          icon={<ChefHat className="h-5 w-5" />}
          label="Receitas"
          isCollapsed={isCollapsed}
          color="text-orange-400"
        />
        
        <NavItem
          href="/copos-base"
          icon={<GlassWater className="h-5 w-5" />}
          label="Copos Base"
          isCollapsed={isCollapsed}
          color="text-amber-400"
        />
        
        <NavItem
          href="/combinados"
          icon={<Layers className="h-5 w-5" />}
          label="Combinados"
          isCollapsed={isCollapsed}
          color="text-pink-400"
        />
        
        <NavItem
          href="/insumos"
          icon={<Package className="h-5 w-5" />}
          label="Insumos"
          isCollapsed={isCollapsed}
          color="text-green-400"
        />
        
        <NavItem
          href="/fornecedores"
          icon={<Building2 className="h-5 w-5" />}
          label="Fornecedores"
          isCollapsed={isCollapsed}
          color="text-indigo-400"
        />

        {!isCollapsed && (
          <NavItem
            isSection
            icon={<Briefcase className="h-5 w-5" />}
            label="Gestão do Negócio"
            color="text-purple-400"
          >
            <NavItem
              href="/dashboard-gestao"
              icon={<BarChart3 className="h-4 w-4" />}
              label="Dashboard"
              isSubItem
              color="text-emerald-400"
            />
            <NavItem
              href="/analise-vendas"
              icon={<TrendingUp className="h-4 w-4" />}
              label="Análise de Vendas"
              isSubItem
              color="text-green-500"
            />
            <NavItem
              href="/custos-operacionais"
              icon={<Calculator className="h-4 w-4" />}
              label="Custos Operacionais"
              isSubItem
              color="text-red-400"
            />
          </NavItem>
        )}

        {isCollapsed && (
          <>
            <NavItem
              href="/dashboard-gestao"
              icon={<BarChart3 className="h-5 w-5" />}
              label="Dashboard"
              isCollapsed={isCollapsed}
              color="text-emerald-400"
            />
            <NavItem
              href="/analise-vendas"
              icon={<TrendingUp className="h-5 w-5" />}
              label="Análise Vendas"
              isCollapsed={isCollapsed}
              color="text-green-500"
            />
            <NavItem
              href="/custos-operacionais"
              icon={<Calculator className="h-5 w-5" />}
              label="Custos Operacionais"
              isCollapsed={isCollapsed}
              color="text-red-400"
            />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                  {getUserInitials(userProfile?.nome || "")}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      {userProfile?.nome || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {userProfile?.email || "usuario@acaidecasa.com"}
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-200 transition-colors" />
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            align="start" 
            className="w-56 mb-2 bg-slate-800 border-slate-700"
          >
            <DropdownMenuItem 
              onClick={() => router.push("/configuracoes")}
              className="flex items-center gap-2 text-gray-200 hover:bg-slate-700 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push("/minha-conta")}
              className="flex items-center gap-2 text-gray-200 hover:bg-slate-700 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Minha Conta</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:bg-slate-700 hover:text-red-300 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};