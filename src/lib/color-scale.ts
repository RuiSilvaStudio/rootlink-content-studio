/**
 * Generates a 9-step Tailwind-style color scale (50-900) from a single seed
 * color, matching the lightness curve RootLink's real hand-tuned palette
 * actually follows (reverse-engineered from tailwind.config.ts -- hue and
 * saturation stay roughly constant across the scale, only lightness moves).
 *
 * This is intentionally a starting point, not a replacement for design
 * judgment: every generated shade is a normal, independently editable field,
 * so "auto-generate then tweak a couple of shades by hand" is the expected
 * workflow, not "auto-generate and never touch it again."
 */

export const SHADE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const
export type ShadeStep = (typeof SHADE_STEPS)[number]
export type ColorScale = Record<ShadeStep, string>

// Target lightness (%) per step, averaged from RootLink's real primary/earth/rust scales.
const LIGHTNESS_CURVE: Record<ShadeStep, number> = {
  '50': 94,
  '100': 87,
  '200': 75,
  '300': 62,
  '400': 50,
  '500': 41,
  '600': 33,
  '700': 27,
  '800': 21,
  '900': 14,
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')
  )
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360
  s /= 100
  l /= 100
  if (s === 0) {
    const v = l * 255
    return [v, v, v]
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ]
}

/**
 * Generates a full 50-900 scale from one seed hex color. The seed always
 * becomes exactly shade 500 (the conventional "true brand color" position) --
 * predictable, so picking a color never surprises you with it landing
 * somewhere else in the scale. The seed's hue and saturation are preserved
 * across every other step; lightness follows RootLink's real curve, shifted
 * by however much lighter/darker the seed is than a "typical" 500, so the
 * whole scale stays proportionate instead of just cloning fixed values.
 */
export function generateScale(seedHex: string): ColorScale {
  const normalizedSeed = seedHex.startsWith('#') ? seedHex : `#${seedHex}`
  const [r, g, b] = hexToRgb(normalizedSeed)
  const [h, s, l] = rgbToHsl(r, g, b)
  const lightnessShift = l - LIGHTNESS_CURVE['500']

  const scale = {} as ColorScale
  for (const step of SHADE_STEPS) {
    if (step === '500') {
      scale[step] = normalizedSeed
      continue
    }
    const targetL = Math.max(2, Math.min(98, LIGHTNESS_CURVE[step] + lightnessShift))
    const [rr, gg, bb] = hslToRgb(h, s, targetL)
    scale[step] = rgbToHex(rr, gg, bb)
  }
  return scale
}

/** Converts "#rrggbb" to the "r g b" space-separated form Tailwind's CSS-variable pattern needs. */
export function hexToRgbTriplet(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  return `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`
}
