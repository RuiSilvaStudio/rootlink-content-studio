"use client";

import { useEffect } from "react";
import { fetchActiveThemeVars } from "@/lib/theme-vars";

/**
 * Fetches Content Studio's active Theme palette and font library once on
 * load, applies CSS custom properties on <html>, and injects
 * <link rel="stylesheet"> tags for any fonts the theme references that
 * aren't already loaded from the static @import in globals.css.
 *
 * No Content Studio -> silently keeps the defaults (matches production
 * with no theme applied).
 *
 * Dispatches a `rootlink:theme-vars-updated` window event afterwards, so
 * anything that reads these colors outside of CSS/Tailwind (currently just
 * HeroParticleCanvas, which draws to a <canvas> and can't use CSS at all)
 * knows to re-read them.
 */
export function ThemeVarsInjector() {
  useEffect(() => {
    let cancelled = false
    fetchActiveThemeVars().then((result) => {
      if (cancelled || !result) return
      const { cssVars, fontUrls } = result
      const root = document.documentElement
      for (const [key, value] of Object.entries(cssVars)) {
        root.style.setProperty(key, value)
      }
      // Inject font stylesheet <link> elements for fonts not already loaded
      const existingLinks = new Set(
        Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((l) => l.href),
      )
      for (const url of fontUrls) {
        if (!url || existingLinks.has(url)) continue
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url
        document.head.appendChild(link)
        existingLinks.add(url)
      }
      window.dispatchEvent(new Event('rootlink:theme-vars-updated'))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
