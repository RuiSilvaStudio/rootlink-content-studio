/**
 * Sync engine: reads the preview-site clone and auto-populates Content
 * Studio with all discoverable content. Run once on fresh install, or
 * any time you want to re-sync from the clone's current state.
 *
 * What it discovers:
 * - MarketingCopy: all public-facing i18n keys from messages/en.json
 * - Theme palette: color defaults from app/globals.css :root
 * - Theme typography: font family defaults from globals.css
 * - Theme radii: radius defaults from globals.css
 * - Pages: one entry per route discovered in the clone
 * - Fonts: the font library
 *
 * Safe to re-run — everything upserts, nothing duplicates.
 *
 * Run with: npm run sync
 * (also runs automatically as part of npm run seed)
 */

import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

// Paths relative to this script
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PREVIEW_SITE = path.resolve(__dirname, '../preview-site')
const MESSAGES_EN = path.join(PREVIEW_SITE, 'messages', 'en.json')
const GLOBALS_CSS = path.join(PREVIEW_SITE, 'app', 'globals.css')

// --- i18n key discovery ---
function flattenI18n(obj: unknown, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  if (!obj || typeof obj !== 'object') return result
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const k = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'string') {
      result[k] = val
    } else {
      Object.assign(result, flattenI18n(val, k))
    }
  }
  return result
}

const PUBLIC_PREFIXES = ['home.', 'nav.', 'create.']

// --- globals.css value extraction ---
function extractCssVar(css: string, name: string): string | null {
  const re = new RegExp(`^\\s*${name.replace(/-/g, '\\-')}\\s*:\\s*(.+?)\\s*;?\\s*$`, 'm')
  const m = css.match(re)
  return m ? m[1].trim() : null
}

export async function syncFromClone(payload: Awaited<ReturnType<typeof getPayload>>) {
  payload.logger.info('Syncing from preview-site clone...')

  // ── Sync i18n keys → MarketingCopy ──────────────────────
  const rawI18n = JSON.parse(readFileSync(MESSAGES_EN, 'utf-8'))
  const flat = flattenI18n(rawI18n)
  let copyCreated = 0
  let copySkipped = 0

  for (const [key, value] of Object.entries(flat)) {
    if (!PUBLIC_PREFIXES.some((p) => key.startsWith(p))) continue
    const existing = await payload.find({
      collection: 'marketing-copy',
      where: { key: { equals: key }, locale: { equals: 'en' } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      copySkipped++
      continue
    }
    await payload.create({
      collection: 'marketing-copy',
      data: { key, value, locale: 'en' },
    })
    copyCreated++
  }
  payload.logger.info(`Marketing copy: ${copyCreated} created, ${copySkipped} already existed`)

  // ── Sync theme palette from globals.css ─────────────────
  const css = readFileSync(GLOBALS_CSS, 'utf-8')
  const families = ['primary', 'earth', 'rust']
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']

  let theme = (await payload.find({ collection: 'themes', where: { isActive: { equals: true } }, limit: 1 })).docs[0]
  if (!theme) {
    theme = await payload.create({
      collection: 'themes',
      data: {
        name: 'Synced from clone',
        isActive: true,
        palette: {
          primary: { seed: '#7a6040', scale: { s50:'#f3f0eb',s100:'#e3ddd0',s200:'#cabda6',s300:'#ad9a7a',s400:'#917a56',s500:'#7a6040',s600:'#634d33',s700:'#4f3d2a',s800:'#3d2f21',s900:'#291f16' }},
          earth: { seed: '#8c6b48', scale: { s50:'#f5f0ea',s100:'#e8ddd0',s200:'#d4c0a8',s300:'#bba080',s400:'#a6845e',s500:'#8c6b48',s600:'#70553a',s700:'#5a432e',s800:'#453324',s900:'#2e2218' }},
          rust: { seed: '#a8643d', scale: { s50:'#f9f0ec',s100:'#f0dcd1',s200:'#e0bea8',s300:'#cf9b7a',s400:'#c07d53',s500:'#a8643d',s600:'#8b5032',s700:'#714029',s800:'#5c3422',s900:'#4a2a1c' }},
          cream: '#f8f6f2',
        },
      },
    })
  }

  const paletteData: Record<string, Record<string, string>> = {}
  for (const family of families) {
    paletteData[family] = {}
    for (const step of shades) {
      const raw = extractCssVar(css, `--rl-${family}-${step}`)
      paletteData[family][`s${step}`] = raw || (family === 'primary' ? '#7a6040' : family === 'earth' ? '#8c6b48' : '#a8643d')
    }
  }
  const cream = extractCssVar(css, '--rl-cream') || '#f8f6f2'

  await payload.update({
    collection: 'themes',
    id: theme.id,
    data: {
      palette: {
        primary: { seed: paletteData.primary.s500, scale: paletteData.primary as never },
        earth: { seed: paletteData.earth.s500, scale: paletteData.earth as never },
        rust: { seed: paletteData.rust.s500, scale: paletteData.rust as never },
        cream,
      },
    },
  })
  payload.logger.info('Theme palette synced from globals.css')

  // ── Font library ────────────────────────────────────────
  const fontSeeds = [
    { family: 'Fraunces', sourceUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&display=swap' },
    { family: 'Source Serif 4', sourceUrl: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,300..700&display=swap' },
    { family: 'Inter', sourceUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
    { family: 'JetBrains Mono', sourceUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap' },
    { family: 'Georgia', sourceUrl: '' },
  ]
  const fontIds: Record<string, number> = {}
  for (const f of fontSeeds) {
    const existing = await payload.find({ collection: 'fonts', where: { family: { equals: f.family } }, limit: 1 })
    fontIds[f.family] = existing.docs[0]?.id || (await payload.create({ collection: 'fonts', data: f })).id
  }
  // Wire fallbacks
  for (const [name, fallbackName] of [['Fraunces', 'Georgia'], ['Source Serif 4', 'Georgia']] as const) {
    if (fontIds[name] && fontIds[fallbackName]) {
      await payload.update({ collection: 'fonts', id: fontIds[name], data: { fallback: fontIds[fallbackName] } })
    }
  }
  payload.logger.info('Fonts synced')

  // Wire font relationships on theme
  const displayFont = extractCssVar(css, '--rl-font-display') || 'Fraunces'
  const bodyFont = extractCssVar(css, '--rl-font-serif') || 'Source Serif 4'
  const displayId = Object.entries(fontIds).find(([k]) => displayFont.includes(k))?.[1]
  const bodyId = Object.entries(fontIds).find(([k]) => bodyFont.includes(k))?.[1]
  if (theme.id) {
    await payload.update({
      collection: 'themes',
      id: theme.id,
      data: {
        fontBody: bodyId || undefined,
        fontDisplay: displayId || undefined,
        fontMono: fontIds['JetBrains Mono'] || undefined,
        radii: {
          sm: parseInt(extractCssVar(css, '--rl-radius-sm') || '8') || 8,
          md: parseInt(extractCssVar(css, '--rl-radius-md') || '12') || 12,
          lg: parseInt(extractCssVar(css, '--rl-radius-lg') || '16') || 16,
          xl2: parseInt(extractCssVar(css, '--rl-radius-xl2') || '16') || 16,
          full: parseInt(extractCssVar(css, '--rl-radius-full') || '9999') || 9999,
        },
      },
    })
  }
  payload.logger.info('Theme fonts + radii synced')

  // ── Pages from RootLink's real sitemap ──────────────────
  // Matches the actual routes in rootlink/frontend/app/.
  // Each entry becomes a Page in Content Studio with 0 blocks
  // (the hardcoded clone is the default until blocks are added).
  const pageRoutes = [
    { title: 'Homepage', slug: '/', order: 0 },
    // Discover
    { title: 'Search', slug: '/search', order: 10 },
    { title: 'Groups', slug: '/groups', order: 11 },
    { title: 'Events', slug: '/events', order: 12 },
    { title: 'Network', slug: '/network', order: 13 },
    { title: 'Entities', slug: '/entities', order: 14 },
    { title: 'Feed', slug: '/feed', order: 15 },
    // Grow
    { title: 'Plants', slug: '/plants', order: 20 },
    { title: 'Learning', slug: '/learning', order: 21 },
    { title: 'Tools', slug: '/tools', order: 22 },
    // Exchange
    { title: 'Marketplace', slug: '/marketplace', order: 30 },
    { title: 'Composting', slug: '/composting', order: 31 },
    { title: 'Upcycling', slug: '/upcycling', order: 32 },
    // Community
    { title: 'Submit', slug: '/submit', order: 40 },
    { title: 'Leaderboard', slug: '/leaderboard', order: 41 },
    { title: 'Donate', slug: '/donate', order: 42 },
    // Content
    { title: 'Articles', slug: '/articles', order: 50 },
    // Account
    { title: 'Profile', slug: '/profile', order: 60 },
    { title: 'Notifications', slug: '/notifications', order: 61 },
    { title: 'Messages', slug: '/messages', order: 62 },
  ]
  for (const route of pageRoutes) {
    const existing = await payload.find({ collection: 'pages', where: { slug: { equals: route.slug } }, limit: 1 })
    if (existing.docs.length === 0) {
      await payload.create({ collection: 'pages', data: { ...route, status: 'published', blocks: [] } })
    }
  }
  payload.logger.info('Pages synced')

  payload.logger.info('Sync complete.')
}

// When run as standalone script (npm run sync)
try {
  const syncPayload = await getPayload({ config })
  await syncFromClone(syncPayload)
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
