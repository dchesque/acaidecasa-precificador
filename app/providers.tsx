"use client"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppProvider } from "@/contexts/AppContext"
import { ThemeProvider } from "next-themes"
import { SuspenseBoundary } from "@/components/layout/SuspenseBoundary"
import { ConfirmProvider } from "@/components/common/ConfirmProvider"
import { HydrationGate } from "@/components/common/HydrationGate"
import { MockModeBanner } from "@/components/common/MockModeBanner"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        disableTransitionOnChange
      >
        <AppProvider>
          <HydrationGate />
          <ConfirmProvider>
            <TooltipProvider>
              <SuspenseBoundary>
                <MockModeBanner />
                {children}
              </SuspenseBoundary>
              <Sonner />
              <Toaster />
            </TooltipProvider>
          </ConfirmProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}