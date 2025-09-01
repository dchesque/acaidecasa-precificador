"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"

export const Header = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-acai-purple via-acai-purple-light to-acai-green rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg drop-shadow-sm">🫐</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground bg-gradient-to-r from-acai-purple to-acai-green bg-clip-text text-transparent">
              Açaí De Casa
            </h1>
            <p className="text-sm text-muted-foreground">Sistema de Precificação</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">Versão 1.3</div>
            <div className="text-xs text-acai-purple">Next.js 15</div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};