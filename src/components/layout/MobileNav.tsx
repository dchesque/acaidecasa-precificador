"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavigationMenu } from "./NavigationMenu";
import { VisuallyHidden } from "./VisuallyHidden";

/**
 * Top bar shown only below the `lg` breakpoint, with a hamburger that opens
 * the same nav menu inside a Sheet drawer. Closes automatically on navigate.
 */
export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b bg-slate-900 text-white">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-slate-800"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-slate-800">
          <VisuallyHidden>
            <SheetTitle>Menu de navegação</SheetTitle>
          </VisuallyHidden>
          <NavigationMenu collapsed={false} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">AC</span>
        </div>
        <span className="font-semibold">AçaíDeCasa</span>
      </div>
    </header>
  );
};
