/**
 * Fetches the active Theme's palette from Content Studio and converts it
 * into the CSS custom properties `tailwind.config.ts` reads (see that file
 * for why these need to be "r g b" triplets, not hex, and why this pattern
 * exists at all for Tailwind v3).
 */

type Scale = Record<string, string>
type PaletteDoc = {
  isActive?: boolean
  palette: {
    primary: { scale: Scale }
    earth: { scale: Scale }
    rust: { scale: Scale }
    cream: string
  }
}

function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num = parseInt(full, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r} ${g} ${b}`
}

const SHADE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const FAMILIES = ['primary', 'earth', 'rust'] as const

/** Returns a map of CSS custom property name -> "r g b" value, or null if no active theme / unreachable. */
export async function fetchActiveThemeVars(): Promise<Record<string, string> | null> {
  const base = process.env.NEXT_PUBLIC_CONTENT_STUDIO_URL || 'http://localhost:3010'
  try {
    const res = await fetch(`${base}/api/themes?where[isActive][equals]=true&limit=1&depth=0`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    const theme: PaletteDoc | undefined = data?.docs?.[0]
    if (!theme?.palette) return null

    const vars: Record<string, string> = {
      '--color-cream': hexToRgbTriplet(theme.palette.cream),
    }
    for (const family of FAMILIES) {
      const scale = theme.palette[family].scale
      for (const step of SHADE_STEPS) {
        const hex = scale[`s${step}`]
        if (hex) vars[`--color-${family}-${step}`] = hexToRgbTriplet(hex)
      }
    }
    return vars
  } catch {
    return null
  }
}
