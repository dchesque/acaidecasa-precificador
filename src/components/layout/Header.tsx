"use client"

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
      </div>
    </header>
  );
};