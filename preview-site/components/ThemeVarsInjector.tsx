"use client";

import { useEffect } from "react";
import { fetchActiveThemeVars } from "@/lib/theme-vars";

/**
 * Fetches Content Studio's active Theme palette once on load and applies it
 * as CSS custom properties on <html>, overriding the defaults in
 * globals.css. No Content Studio -> silently keeps the defaults (matches
 * production with no theme applied). This is "refresh to see the latest
 * saved theme", not keystroke-level live preview -- see repo README.
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
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
