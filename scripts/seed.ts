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
        colorsLight: {
          bgRoot: '#fafafa',
          text: '#18181b',
          surface1: '#f4f4f5',
          surface2: '#e4e4e7',
          primary: '#10b981',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        colorsDark: {
          bgRoot: '#09090b',
          text: '#fafafa',
          surface1: '#18181b',
          surface2: '#27272a',
          primary: '#10b981',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
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
