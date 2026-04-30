"use client";

import { useHydrateAppContext } from "@/hooks/useHydrateAppContext";

/**
 * Mounts the AppContext hydration effect once, near the root of the tree.
 * Renders nothing — its only job is to run the side-effect.
 */
export function HydrationGate() {
  useHydrateAppContext();
  return null;
}
