import type { CollectionConfig } from 'payload'

import { anyone, authenticated, ownerOnly } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['filename', 'alt', 'tag', 'updatedAt'],
  },
  access: {
    // Media files are served on public pages, so reads must stay public.
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: ownerOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe what the image shows -- read aloud by screen readers.',
      },
    },
    {
      name: 'tag',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Hero / banner', value: 'hero' },
        { label: 'Icon', value: 'icon' },
        { label: 'Background', value: 'background' },
        { label: 'Illustration', value: 'illustration' },
        { label: 'Logo / brand mark', value: 'logo' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Helps filter the media library by where an image is used.',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Title attribute for the <img> tag — shown as a tooltip on hover. Also helps SEO.',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Optional caption displayed below the image.',
      },
    },
    {
      name: 'usageNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Optional: where on the site this is used, for future reference.',
      },
    },
  ],
  upload: true,
}
