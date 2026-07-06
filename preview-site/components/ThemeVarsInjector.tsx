"use client";

import { useEffect } from "react";
import { fetchActiveThemeVars } from "@/lib/theme-vars";

/**
 * Fetches Content Studio's active Theme palette once on load and applies it
 * as CSS custom properties on <html>, overriding the defaults in
 * globals.css. No Content Studio -> silently keeps the defaults (matches
 * production with no theme applied). This is "refresh to see the latest
 * saved theme", not keystroke-level live preview -- see repo README.
 *
 * Dispatches a `rootlink:theme-vars-updated` window event afterwards, so
 * anything that reads these colors outside of CSS/Tailwind (currently just
 * HeroParticleCanvas, which draws to a <canvas> and can't use CSS at all)
 * knows to re-read them -- this component's fetch is async, so those
 * consumers' own initial mount usually runs before these values are ready.
 */
export function ThemeVarsInjector() {
  useEffect(() => {
    let cancelled = false;
    fetchActiveThemeVars().then((vars) => {
      if (cancelled || !vars) return;
      const root = document.documentElement;
      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(key, value);
      }
      window.dispatchEvent(new Event("rootlink:theme-vars-updated"));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
