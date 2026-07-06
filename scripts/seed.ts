/**
 * Seeds example content so the admin panel isn't empty on first look:
 * one active theme (matching RootLink's current design tokens), one example
 * template, and one example marketing copy entry.
 *
 * Run with: npm run seed
 * Safe to re-run -- it upserts by a stable identifying field instead of duplicating.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function seed() {
  const payload = await getPayload({ config })

  // ── Seed fonts ──────────────────────────────────────────
  // Create all fonts first without fallback references, then wire them up
  const seedFonts = [
    {
      family: 'Fraunces',
      sourceUrl:
        'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&display=swap',
      fallbackFamily: 'Georgia',
    },
    {
      family: 'Source Serif 4',
      sourceUrl:
        'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,300..700&display=swap',
      fallbackFamily: 'Georgia',
    },
    {
      family: 'Inter',
      sourceUrl:
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
      family: 'JetBrains Mono',
      sourceUrl:
        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
    },
    {
      family: 'Georgia',
      sourceUrl: '',
    },
  ]

  const fontIds: Record<string, number> = {}
  for (const f of seedFonts) {
    const existing = await payload.find({ collection: 'fonts', where: { family: { equals: f.family } }, limit: 1 })
    if (existing.docs.length > 0) {
      fontIds[f.family] = existing.docs[0].id
      payload.logger.info(`Font "${f.family}" already exists (#${fontIds[f.family]})`)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await (payload.create as any)({ collection: 'fonts', data: { family: f.family, sourceUrl: f.sourceUrl } })
      fontIds[f.family] = created.id
      payload.logger.info(`Created font "${f.family}" (#${created.id})`)
    }
  }

  // Wire up fallback relationships in a second pass
  for (const f of seedFonts) {
    if (f.fallbackFamily && fontIds[f.fallbackFamily]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload.update as any)({
        collection: 'fonts',
        id: fontIds[f.family],
        data: { fallback: fontIds[f.fallbackFamily] },
      })
    }
  }

  // ── Seed theme ──────────────────────────────────────────

  const existingTheme = await payload.find({
    collection: 'themes',
    where: { name: { equals: 'RootLink Default' } },
    limit: 1,
  })

  if (existingTheme.docs.length === 0) {
    await payload.create({
      collection: 'themes',
      data: {
        name: 'RootLink Default',
        isActive: true,
        // Exact hex values from RootLink's real tailwind.config.ts, so the
        // default seeded theme renders byte-identical to production.
        palette: {
          primary: {
            seed: '#7a6040',
            scale: {
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
            },
          },
          earth: {
            seed: '#8c6b48',
            scale: {
              s50: '#f5f0ea',
              s100: '#e8ddd0',
              s200: '#d4c0a8',
              s300: '#bba080',
              s400: '#a6845e',
              s500: '#8c6b48',
              s600: '#70553a',
              s700: '#5a432e',
              s800: '#453324',
              s900: '#2e2218',
            },
          },
          rust: {
            seed: '#a8643d',
            scale: {
              s50: '#f9f0ec',
              s100: '#f0dcd1',
              s200: '#e0bea8',
              s300: '#cf9b7a',
              s400: '#c07d53',
              s500: '#a8643d',
              s600: '#8b5032',
              s700: '#714029',
              s800: '#5c3422',
              s900: '#4a2a1c',
            },
          },
          cream: '#f8f6f2',
        },
        fontBody: fontIds['Source Serif 4'],
        fontDisplay: fontIds['Fraunces'],
        fontMono: fontIds['JetBrains Mono'],
        scale: [
          { level: 'h1', sizePx: 30, weight: '700', lineHeight: 1.2 },
          { level: 'h2', sizePx: 24, weight: '600', lineHeight: 1.3 },
          { level: 'h3', sizePx: 20, weight: '500', lineHeight: 1.4 },
          { level: 'body', sizePx: 16, weight: '400', lineHeight: 1.5 },
          { level: 'small', sizePx: 14, weight: '400', lineHeight: 1.4 },
          { level: 'mono', sizePx: 13, weight: '500', lineHeight: 1.4 },
        ],
        spacing: [
          { token: 'xs', valuePx: 4 },
          { token: 'sm', valuePx: 8 },
          { token: 'md', valuePx: 16 },
          { token: 'lg', valuePx: 24 },
          { token: 'xl', valuePx: 32 },
        ],
        radii: { sm: 8, md: 12, lg: 16, xl2: 16, full: 9999 },
      },
    })
    payload.logger.info('Seeded theme: RootLink Default')
  } else {
    payload.logger.info('Theme "RootLink Default" already exists, skipping')
  }

  const existingTemplate = await payload.find({
    collection: 'templates',
    where: { name: { equals: 'Homepage (example)' } },
    limit: 1,
  })

  if (existingTemplate.docs.length === 0) {
    await payload.create({
      collection: 'templates',
      data: {
        name: 'Homepage (example)',
        description: 'An example template showing how blocks compose into a page.',
        blocks: [
          {
            blockType: 'hero',
            eyebrow: 'Community-powered',
            headline: 'Grow resilience, together.',
            subhead: 'RootLink connects communities with the tools and people to thrive.',
            primaryCta: { label: 'Get started', href: '/signup' },
            secondaryCta: { label: 'Learn more', href: '/about' },
          },
          {
            blockType: 'textSection',
            heading: 'Built for autonomy',
            body: 'This is example copy -- edit or delete this template freely.',
            alignment: 'left',
          },
          {
            blockType: 'callToAction',
            heading: 'Ready to join?',
            buttonLabel: 'Sign up',
            buttonHref: '/signup',
          },
        ],
      },
    })
    payload.logger.info('Seeded template: Homepage (example)')
  } else {
    payload.logger.info('Template "Homepage (example)" already exists, skipping')
  }

  // ── Seed pages ──────────────────────────────────────────
  const existingHome = await payload.find({
    collection: 'pages',
    where: { slug: { equals: '/' } },
    limit: 1,
  })

  if (existingHome.docs.length === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Homepage',
        slug: '/',
        status: 'published',
        order: 0,
        blocks: [
          {
            blockType: 'hero',
            eyebrow: 'Community-powered',
            headline: 'Grow resilience, together.',
            subhead: 'RootLink connects communities with the tools and people to thrive.',
            primaryCta: { label: 'Get started', href: '/signup' },
            secondaryCta: { label: 'Learn more', href: '/about' },
          },
          {
            blockType: 'callToAction',
            heading: 'Ready to join?',
            buttonLabel: 'Sign up',
            buttonHref: '/signup',
          },
        ],
      },
    })
    payload.logger.info('Seeded page: Homepage')
  } else {
    payload.logger.info('Page "Homepage" already exists, skipping')
  }

  // ── Seed marketing copy (after pages, so the page relationship exists) ─
  const existingCopy = await payload.find({
    collection: 'marketing-copy',
    where: { key: { equals: 'home.hero_title' } },
    limit: 1,
  })

  if (existingCopy.docs.length === 0) {
    const homePage = await payload.find({
      collection: 'pages',
      where: { slug: { equals: '/' } },
      limit: 1,
    })

    await payload.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'marketing-copy' as any,
      data: {
        key: 'home.hero_title',
        page: homePage.docs[0]?.id || undefined,
        value: 'Grow resilience, together.',
        locale: 'en',
        notes: 'Real RootLink key — overrides the default "Find what feeds your land".',
      },
    })
    payload.logger.info('Seeded marketing copy: home.hero_title')
  } else {
    payload.logger.info('Marketing copy "home.hero_title" already exists, skipping')
  }

  payload.logger.info('Seed complete.')
}

// `payload run` does not await async work in the imported script -- it moves
// on as soon as the dynamic import() call resolves. A top-level `await` here
// keeps the process alive until seeding actually finishes.
try {
  await seed()
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
