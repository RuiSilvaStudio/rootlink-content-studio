/**
 * Fetches the active Theme from Content Studio and converts all design
 * tokens (palette colors, font families, radii) into the `--rl-*` CSS
 * custom properties `globals.css` reads. See the `@theme` comment in
 * globals.css for why these target `--rl-*` and not `--color-*` directly.
 */

type Scale = Record<string, string>
type FontDoc = {
  id: number
  family: string
  sourceUrl: string
  fallback?: FontDoc | number | null
}

function fontStack(font: FontDoc, allFonts: FontDoc[]): string {
  // Build a CSS font-family stack: fontFamily, fallbackFont, generic
  const stack = [font.family]
  const fallbackId = font.fallback ? (typeof font.fallback === 'object' ? font.fallback.id : font.fallback) : null
  if (fallbackId) {
    const fb = allFonts.find((f) => f.id === fallbackId)
    if (fb && fb.family !== font.family) stack.push(fb.family)
  }
  // Always add a safe generic at the end
  stack.push('serif')
  return stack.join(', ')
}
type ThemeDoc = {
  isActive?: boolean
  fontBody?: FontDoc | number
  fontDisplay?: FontDoc | number
  palette: {
    primary: { scale: Scale }
    earth: { scale: Scale }
    rust: { scale: Scale }
    cream: string
  }
  radii?: {
    sm?: number
    md?: number
    lg?: number
    xl2?: number
    full?: number
  }
}

function isFontDoc(v: unknown): v is FontDoc {
  return typeof v === 'object' && v !== null && 'family' in v && 'sourceUrl' in v && 'fallback' in v
}

const SHADE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const FAMILIES = ['primary', 'earth', 'rust'] as const

export type ThemeFontsResult = { cssVars: Record<string, string>; fontUrls: string[] }

/** Returns CSS custom properties + the list of font stylesheet URLs to inject. */
export async function fetchActiveThemeVars(): Promise<ThemeFontsResult | null> {
  const base = process.env.NEXT_PUBLIC_CONTENT_STUDIO_URL || 'http://localhost:3010'
  try {
    const res = await fetch(`${base}/api/themes?where[isActive][equals]=true&limit=1&depth=1`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    const theme: ThemeDoc | undefined = data?.docs?.[0]
    if (!theme?.palette) return null

    const vars: Record<string, string> = {
      '--rl-cream': theme.palette.cream,
    }
    const fontUrls: string[] = []

    // Color scales
    for (const family of FAMILIES) {
      const scale = theme.palette[family].scale
      for (const step of SHADE_STEPS) {
        const hex = scale[`s${step}`]
        if (hex) vars[`--rl-${family}-${step}`] = hex
      }
    }

    // Font families (relationship fields — with depth=2 they include the fallback font)
    // We also need the full font list to resolve fallback chains for CSS font-family stacks
    const allFontsRes = await fetch(`${base}/api/fonts?limit=50&depth=0`, { cache: 'no-store' })
    const allFonts: FontDoc[] = allFontsRes.ok ? ((await allFontsRes.json())?.docs || []) : []

    const displayFont = theme.fontDisplay
    if (isFontDoc(displayFont)) {
      vars['--rl-font-display'] = fontStack(displayFont, allFonts)
      if (displayFont.sourceUrl) fontUrls.push(displayFont.sourceUrl)
      const df = displayFont.fallback
      if (isFontDoc(df) && df.sourceUrl && df.sourceUrl !== displayFont.sourceUrl) {
        fontUrls.push(df.sourceUrl)
      }
    }
    const bodyFont = theme.fontBody
    if (isFontDoc(bodyFont)) {
      vars['--rl-font-serif'] = fontStack(bodyFont, allFonts)
      if (bodyFont.sourceUrl && bodyFont.sourceUrl !== (isFontDoc(theme.fontDisplay) ? theme.fontDisplay.sourceUrl : '')) {
        fontUrls.push(bodyFont.sourceUrl)
      }
      const bf = bodyFont.fallback
      if (isFontDoc(bf) && bf.sourceUrl && bf.sourceUrl !== bodyFont.sourceUrl && (!isFontDoc(theme.fontDisplay) || bf.sourceUrl !== theme.fontDisplay.sourceUrl)) {
        fontUrls.push(bf.sourceUrl)
      }
    }

    // Radii
    const r = theme.radii
    if (r) {
      if (r.xl2 != null) vars['--rl-radius-xl2'] = `${r.xl2}px`
      if (r.lg != null) vars['--rl-radius-lg'] = `${r.lg}px`
      if (r.md != null) vars['--rl-radius-md'] = `${r.md}px`
      if (r.sm != null) vars['--rl-radius-sm'] = `${r.sm}px`
      if (r.full != null) vars['--rl-radius-full'] = `${r.full}px`
    }

    return { cssVars: vars, fontUrls }
  } catch {
    return null
  }
}
