import type { CollectionConfig } from 'payload'

import { authenticated, ownerOnly } from '../access'

export const MarketingCopy: CollectionConfig = {
  slug: 'marketing-copy',
  labels: {
    singular: 'Marketing Copy',
    plural: 'Marketing Copy',
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'page', 'value', 'updatedAt'],
    description: 'Text strings used in marketing pages. "Key" identifies where a string is used.',
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: ownerOnly,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'A stable identifier, e.g. "homepage.hero.title". Do not change once in use.',
      },
    },
    {
      name: 'page',
      type: 'text',
      admin: {
        description: 'Optional: which page/section this belongs to, for filtering, e.g. "Homepage".',
      },
    },
    {
      name: 'value',
      type: 'textarea',
      required: true,
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Portuguese', value: 'pt' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional context for other editors, e.g. "Shown only to logged-out visitors".',
      },
    },
  ],
}
