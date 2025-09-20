"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserCircle } from "lucide-react"
import { useAppContext } from "@/contexts/AppContext"

export const Header = () => {
  const { userProfile } = useAppContext()

  // Get first name for welcome message
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-muted-foreground">Bem-vindo,</span>
          <span className="text-lg font-semibold text-foreground">
            {userProfile ? getFirstName(userProfile.nome) : "Usuário"}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Logado como:</span>
            <span className="text-sm font-medium text-foreground">
              {userProfile?.email || "usuario@acaidecasa.com"}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};