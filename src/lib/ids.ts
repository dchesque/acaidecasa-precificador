/**
 * Returns a collision-resistant string identifier.
 *
 * Uses `crypto.randomUUID()` when the runtime exposes it (modern browsers and
 * Node 19+), falling back to `crypto.getRandomValues` for older clients. The
 * fallback never relies on `Date.now()` alone, which collides under bursty
 * dispatches.
 */
export const newId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Last-resort fallback (SSR or very old runtimes).
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
};
