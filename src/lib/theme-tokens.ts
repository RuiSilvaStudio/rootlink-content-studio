import type { Theme } from '@/payload-types'

import { SHADE_STEPS } from './color-scale'

export type ThemeMode = 'light' | 'dark'

const FALLBACK_SCALE_HEX: Record<string, string> = {
  s50: '#f3f0eb',
  s100: '#e3ddd0',
  s200: '#cabda6',
  s300: '#ad9a7a',
  s400: '#917a56',
  s500: '#7a6040',
  s600: '#634d33',
  s700: '#4f3d2a',
  s800: '#3d2f21',
  s900: '#291f16',
}

const FALLBACK_PALETTE: Theme['palette'] = {
  primary: { seed: '#7a6040', scale: FALLBACK_SCALE_HEX as never },
  earth: { seed: '#8c6b48', scale: FALLBACK_SCALE_HEX as never },
  rust: { seed: '#a8643d', scale: FALLBACK_SCALE_HEX as never },
  cream: '#f8f6f2',
}

// Fixed neutrals -- RootLink's real components use Tailwind's stock stone
// scale for backgrounds/text, not a custom one, so these aren't themeable
// (yet -- see README "Next up" section for why this was scoped out).
const NEUTRAL_LIGHT_TEXT = '#292524' // ~stone-800
const NEUTRAL_DARK_BG = '#0c0a09' // ~stone-950
const NEUTRAL_DARK_TEXT = '#f5f5f4' // ~stone-100

const TYPE_LEVELS = ['h1', 'h2', 'h3', 'body', 'small', 'mono'] as const
export type TypeLevel = (typeof TYPE_LEVELS)[number]

const FALLBACK_SCALE: Record<TypeLevel, { sizePx: number; weight: string; lineHeight: number }> = {
  h1: { sizePx: 30, weight: '700', lineHeight: 1.2 },
  h2: { sizePx: 24, weight: '600', lineHeight: 1.3 },
  h3: { sizePx: 20, weight: '500', lineHeight: 1.4 },
  body: { sizePx: 16, weight: '400', lineHeight: 1.5 },
  small: { sizePx: 14, weight: '400', lineHeight: 1.4 },
  mono: { sizePx: 13, weight: '500', lineHeight: 1.4 },
}

const FALLBACK_SPACING: Record<string, number> = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }

/** Look up a type-scale entry for a level, falling back to sane defaults if missing. */
export function lookupScale(theme: Theme | null | undefined, level: TypeLevel) {
  const found = theme?.scale?.find((s) => s.level === level)
  return found ?? FALLBACK_SCALE[level]
}

/** Look up a spacing token, falling back to sane defaults if missing. */
export function lookupSpacing(theme: Theme | null | undefined, token: string): number {
  const found = theme?.spacing?.find((s) => s.token === token)
  return found?.valuePx ?? FALLBACK_SPACING[token] ?? 16
}

export function getPalette(theme: Theme | null | undefined) {
  return theme?.palette ?? FALLBACK_PALETTE
}

/**
 * Converts a Theme document's real palette (primary/earth/rust scales +
 * cream) into a flat map of CSS custom properties, for Content Studio's own
 * generic style-guide preview. This is a rough approximation for a
 * mode toggle, not the real site's actual light/dark implementation --
 * see preview-site for the real one.
 */
export function themeCssVars(theme: Theme | null | undefined, mode: ThemeMode): Record<string, string> {
  const palette = getPalette(theme)

  const vars: Record<string, string> = {
    '--cs-color-bg': mode === 'light' ? palette.cream : NEUTRAL_DARK_BG,
    '--cs-color-text': mode === 'light' ? NEUTRAL_LIGHT_TEXT : NEUTRAL_DARK_TEXT,
    '--cs-color-surface-1': mode === 'light' ? palette.primary.scale.s50 : palette.primary.scale.s900,
    '--cs-color-surface-2': mode === 'light' ? palette.primary.scale.s100 : palette.primary.scale.s800,
    '--cs-color-primary': palette.primary.scale.s600,
    '--cs-color-earth': palette.earth.scale.s600,
    '--cs-color-rust': palette.rust.scale.s600,
    '--cs-font-family': theme?.fontFamily || 'Inter',
    '--cs-font-mono': theme?.fontFamilyMono || 'JetBrains Mono',
    '--cs-radius-sm': `${theme?.radii?.sm ?? 4}px`,
    '--cs-radius-md': `${theme?.radii?.md ?? 8}px`,
    '--cs-radius-lg': `${theme?.radii?.lg ?? 16}px`,
    '--cs-radius-full': `${theme?.radii?.full ?? 9999}px`,
  }

  for (const level of TYPE_LEVELS) {
    const s = lookupScale(theme, level)
    vars[`--cs-type-${level}-size`] = `${s.sizePx}px`
    vars[`--cs-type-${level}-weight`] = s.weight
    vars[`--cs-type-${level}-lh`] = String(s.lineHeight)
  }

  for (const token of ['xs', 'sm', 'md', 'lg', 'xl']) {
    vars[`--cs-space-${token}`] = `${lookupSpacing(theme, token)}px`
  }

  return vars
}

export { SHADE_STEPS }
