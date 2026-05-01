"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavigationMenu } from "./NavigationMenu";

/**
 * Desktop sidebar — fixed at lg+ breakpoints. The mobile menu lives in
 * `MobileNav` and uses a Sheet drawer triggered from the page header.
 */
export const Navigation = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "hidden lg:flex fixed top-0 left-0 h-screen bg-slate-900 transition-all duration-300 ease-in-out flex-col z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <NavigationMenu collapsed={isCollapsed} />
    </aside>
  );
};
