import { ReactNode } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar (lg+) — fixed, takes 64 (or 16 when collapsed) */}
      <Navigation />
      {/* Mobile top bar (<lg) with hamburger that opens the same nav in a Sheet */}
      <MobileNav />

      <div className="lg:ml-64">
        <Header />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};
