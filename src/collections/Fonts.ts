import type { CollectionConfig } from 'payload'

import { anyone, authenticated, ownerOnly } from '../access'

export const Fonts: CollectionConfig = {
  slug: 'fonts',
  labels: {
    singular: 'Font',
    plural: 'Fonts',
  },
  admin: {
    useAsTitle: 'family',
    defaultColumns: ['family', 'fallback', 'updatedAt'],
    description:
      'Font library. Add a font here, then select it from the dropdown in Themes > Typography. Preview-site injects the stylesheet automatically at runtime.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: ownerOnly,
  },
  fields: [
    {
      name: 'family',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'CSS font-family name. Must match exactly what the stylesheet declares, e.g. "Fraunces".',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        description:
          'Stylesheet URL (Google Fonts etc.). Leave empty for system fonts like Georgia or Arial — they\'re already installed on every device.',
      },
    },
    {
      name: 'fallback',
      type: 'relationship',
      relationTo: 'fonts',
      hasMany: false,
      admin: {
        description: 'Font to use if this one fails to load. Usually a system font like Georgia. Leave empty if this font is a system font itself.',
      },
    },
  ],
}
