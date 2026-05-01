"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (`/public/sw.js`) on first paint.
 *
 * Skipped in development so HMR isn't intercepted by stale cached assets.
 * In production the SW takes over the next time the user reloads — we don't
 * call `skipWaiting()` automatically to avoid swapping bundles mid-session.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Ignore — the app keeps working without offline support.
      }
    };

    // Defer until the page settles to keep TTI fast.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
