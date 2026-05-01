import { ReactNode } from "react";

/**
 * Hides content visually while keeping it available to screen readers.
 * Useful for required Radix titles (e.g. SheetTitle) that we don't want shown.
 */
export const VisuallyHidden = ({ children }: { children: ReactNode }) => (
  <span
    className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
    style={{ clip: "rect(0 0 0 0)", clipPath: "inset(50%)" }}
  >
    {children}
  </span>
);
