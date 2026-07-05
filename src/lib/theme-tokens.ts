import type { Theme } from '@/payload-types'

export type ThemeMode = 'light' | 'dark'

const FALLBACK_COLORS: Theme['colorsLight'] = {
  bgRoot: '#fafafa',
  text: '#18181b',
  surface1: '#f4f4f5',
  surface2: '#e4e4e7',
  primary: '#10b981',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
}

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

/**
 * Converts a Theme document into a flat map of CSS custom properties for the
 * given mode (light/dark), suitable for spreading onto a React `style` prop.
 */
export function themeCssVars(theme: Theme | null | undefined, mode: ThemeMode): Record<string, string> {
  const colors = (mode === 'light' ? theme?.colorsLight : theme?.colorsDark) ?? FALLBACK_COLORS

  const vars: Record<string, string> = {
    '--cs-color-bg': colors.bgRoot,
    '--cs-color-text': colors.text,
    '--cs-color-surface-1': colors.surface1,
    '--cs-color-surface-2': colors.surface2,
    '--cs-color-primary': colors.primary,
    '--cs-color-success': colors.success,
    '--cs-color-warning': colors.warning,
    '--cs-color-error': colors.error,
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
