/**
 * Fetches the active Theme from Content Studio and converts all design
 * tokens (palette colors, font families, radii) into the `--rl-*` CSS
 * custom properties `globals.css` reads. See the `@theme` comment in
 * globals.css for why these target `--rl-*` and not `--color-*` directly.
 */

type Scale = Record<string, string>
type ThemeDoc = {
  isActive?: boolean
  fontFamily?: string
  fontFamilyDisplay?: string
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

const SHADE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const FAMILIES = ['primary', 'earth', 'rust'] as const

/** Returns a map of CSS custom property name ("--rl-*") -> string value, or null if no active theme / unreachable. */
export async function fetchActiveThemeVars(): Promise<Record<string, string> | null> {
  const base = process.env.NEXT_PUBLIC_CONTENT_STUDIO_URL || 'http://localhost:3010'
  try {
    const res = await fetch(`${base}/api/themes?where[isActive][equals]=true&limit=1&depth=0`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    const theme: ThemeDoc | undefined = data?.docs?.[0]
    if (!theme?.palette) return null

    const vars: Record<string, string> = {
      '--rl-cream': theme.palette.cream,
    }

    // Color scales
    for (const family of FAMILIES) {
      const scale = theme.palette[family].scale
      for (const step of SHADE_STEPS) {
        const hex = scale[`s${step}`]
        if (hex) vars[`--rl-${family}-${step}`] = hex
      }
    }

    // Font families
    if (theme.fontFamilyDisplay) vars['--rl-font-display'] = theme.fontFamilyDisplay
    if (theme.fontFamily) vars['--rl-font-serif'] = theme.fontFamily

    // Radii
    const r = theme.radii
    if (r) {
      if (r.xl2 != null) vars['--rl-radius-xl2'] = `${r.xl2}px`
      if (r.lg != null) vars['--rl-radius-lg'] = `${r.lg}px`
      if (r.md != null) vars['--rl-radius-md'] = `${r.md}px`
      if (r.sm != null) vars['--rl-radius-sm'] = `${r.sm}px`
      if (r.full != null) vars['--rl-radius-full'] = `${r.full}px`
    }

    return vars
  } catch {
    return null
  }
}
