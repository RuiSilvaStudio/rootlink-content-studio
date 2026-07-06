/**
 * Fetches the active Theme's palette from Content Studio and converts it
 * into the CSS custom properties `globals.css` reads (the `--rl-*` source
 * variables aliased into Tailwind's `@theme` color tokens -- see the
 * comment on `@theme` in that file for why they're named differently and
 * why plain hex is fine under Tailwind v4).
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

const SHADE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const FAMILIES = ['primary', 'earth', 'rust'] as const

/** Returns a map of CSS custom property name ("--rl-*") -> hex value, or null if no active theme / unreachable. */
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
      '--rl-cream': theme.palette.cream,
    }
    for (const family of FAMILIES) {
      const scale = theme.palette[family].scale
      for (const step of SHADE_STEPS) {
        const hex = scale[`s${step}`]
        if (hex) vars[`--rl-${family}-${step}`] = hex
      }
    }
    return vars
  } catch {
    return null
  }
}
