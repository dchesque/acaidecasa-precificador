"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserCircle } from "lucide-react"

export const Header = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-muted-foreground">Bem-vindo,</span>
          <span className="text-lg font-semibold text-foreground">Admin</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Logado como:</span>
            <span className="text-sm font-medium text-foreground">admin@acaidecasa.com</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};