/**
 * Sets up Content Studio from the preview-site clone.
 *
 * 1. Runs sync-from-clone to auto-discover all i18n keys, theme defaults,
 *    fonts, and page routes from the clone
 * 2. Creates one example Template (Content Studio-specific, not synced)
 *
 * Run with: npm run seed
 * Safe to re-run — all operations are upserts.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function seed() {
  const payload = await getPayload({ config })

  // ── Sync from clone (discovers everything automatically) ─
  // Dynamic import of the sync script's logic
  const { syncFromClone } = await import('./sync-from-clone.js')
  await syncFromClone(payload)

  // ── Template example (Content Studio concept only) ───────
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
        ],
      },
    })
    payload.logger.info('Seeded template: Homepage (example)')
  } else {
    payload.logger.info('Template "Homepage (example)" already exists, skipping')
  }

  payload.logger.info('Seed complete.')
}

try {
  await seed()
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
