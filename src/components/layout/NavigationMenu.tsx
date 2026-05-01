"use client";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
  Package,
  ChefHat,
  Layers,
  LayoutDashboard,
  Building2,
  MenuSquare,
  User,
  LogOut,
  ChevronUp,
  GlassWater,
  TrendingUp,
  Calculator,
  BarChart3,
  Briefcase,
} from "lucide-react";

interface NavigationMenuProps {
  /** True for the desktop's collapsed (icons-only) state. */
  collapsed?: boolean;
  /** Invoked after a navigation link is clicked — used to close the mobile sheet. */
  onNavigate?: () => void;
}

/**
 * Pure markup for the sidebar nav. Both `Navigation` (desktop, fixed) and
 * the mobile `Sheet` reuse this so the menu structure stays in one place.
 */
export const NavigationMenu = ({ collapsed = false, onNavigate }: NavigationMenuProps) => {
  const router = useRouter();
  const { userProfile } = useAppContext();
  const { signOut } = useAuth();

  const getUserInitials = (nome: string) => {
    if (!nome) return "AC";
    return nome
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate?.();
      router.push("/auth/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao sair";
      toast.error(message);
    }
  };

  const go = (path: string) => {
    onNavigate?.();
    router.push(path);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header com Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-white font-semibold text-lg">AçaíDeCasa</h1>
              <p className="text-gray-400 text-xs">Precificador inteligente</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1" aria-label="Menu principal">
        <NavItem
          href="/"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          isCollapsed={collapsed}
          color="text-blue-400"
          onClick={onNavigate}
        />
        <NavItem
          href="/cardapio"
          icon={<MenuSquare className="h-5 w-5" />}
          label="Cardápio"
          isCollapsed={collapsed}
          color="text-purple-400"
          onClick={onNavigate}
        />
        <NavItem
          href="/receitas"
          icon={<ChefHat className="h-5 w-5" />}
          label="Receitas"
          isCollapsed={collapsed}
          color="text-orange-400"
          onClick={onNavigate}
        />
        <NavItem
          href="/copos-base"
          icon={<GlassWater className="h-5 w-5" />}
          label="Copos Base"
          isCollapsed={collapsed}
          color="text-amber-400"
          onClick={onNavigate}
        />
        <NavItem
          href="/combinados"
          icon={<Layers className="h-5 w-5" />}
          label="Combinados"
          isCollapsed={collapsed}
          color="text-pink-400"
          onClick={onNavigate}
        />
        <NavItem
          href="/insumos"
          icon={<Package className="h-5 w-5" />}
          label="Insumos"
          isCollapsed={collapsed}
          color="text-green-400"
          onClick={onNavigate}
        />
        <NavItem
          href="/fornecedores"
          icon={<Building2 className="h-5 w-5" />}
          label="Fornecedores"
          isCollapsed={collapsed}
          color="text-indigo-400"
          onClick={onNavigate}
        />

        {!collapsed && (
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
              onClick={onNavigate}
            />
            <NavItem
              href="/analise-vendas"
              icon={<TrendingUp className="h-4 w-4" />}
              label="Análise de Vendas"
              isSubItem
              color="text-green-500"
              onClick={onNavigate}
            />
            <NavItem
              href="/custos-operacionais"
              icon={<Calculator className="h-4 w-4" />}
              label="Custos Operacionais"
              isSubItem
              color="text-red-400"
              onClick={onNavigate}
            />
          </NavItem>
        )}

        {collapsed && (
          <>
            <NavItem
              href="/dashboard-gestao"
              icon={<BarChart3 className="h-5 w-5" />}
              label="Dashboard"
              isCollapsed={collapsed}
              color="text-emerald-400"
              onClick={onNavigate}
            />
            <NavItem
              href="/analise-vendas"
              icon={<TrendingUp className="h-5 w-5" />}
              label="Análise Vendas"
              isCollapsed={collapsed}
              color="text-green-500"
              onClick={onNavigate}
            />
            <NavItem
              href="/custos-operacionais"
              icon={<Calculator className="h-5 w-5" />}
              label="Custos Operacionais"
              isCollapsed={collapsed}
              color="text-red-400"
              onClick={onNavigate}
            />
          </>
        )}
      </nav>

      {/* Footer (avatar + dropdown) */}
      <div className="border-t border-slate-800 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Abrir menu de conta"
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors group"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                  {getUserInitials(userProfile?.nome || "")}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-white font-medium truncate">
                      {userProfile?.nome || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {userProfile?.email || "usuario@acaidecasa.com"}
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-200 transition-colors" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 mb-2 bg-slate-800 border-slate-700"
          >
            <DropdownMenuItem
              onClick={() => go("/configuracoes")}
              className="flex items-center gap-2 text-gray-200 hover:bg-slate-700 cursor-pointer"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => go("/minha-conta")}
              className="flex items-center gap-2 text-gray-200 hover:bg-slate-700 cursor-pointer"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span>Minha Conta</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:bg-slate-700 hover:text-red-300 cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
