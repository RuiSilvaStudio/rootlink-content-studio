import type { CollectionConfig } from 'payload'

import { anyone, authenticated, ownerOnly } from '../access'

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
    // Public read: the live site (and the preview-site clone) fetch these
    // as plain copy overrides, same as RootLink's own real `/api/copy`
    // endpoint -- no Content Studio login involved for reading.
    read: anyone,
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
        description:
          'Must match a real RootLink i18n key, e.g. "home.hero_title" -- this is what gets overridden on the live site. Do not change once in use.',
      },
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: false,
      admin: {
        description: 'Which page this copy belongs to. Filterable in the list view.',
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
