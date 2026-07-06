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
        fontFamily: 'Inter',
        fontFamilyMono: 'JetBrains Mono',
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
        radii: { sm: 4, md: 8, lg: 16, full: 9999 },
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

  const existingCopy = await payload.find({
    collection: 'marketing-copy',
    where: { key: { equals: 'home.hero_title' } },
    limit: 1,
  })

  if (existingCopy.docs.length === 0) {
    await payload.create({
      collection: 'marketing-copy',
      data: {
        key: 'home.hero_title',
        page: 'Homepage',
        value: 'Grow resilience, together.',
        locale: 'en',
        notes:
          'Real RootLink key -- the homepage hero headline. Overrides the default "Find what feeds your land" wherever this key is read (the preview-site clone fetches these live).',
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
