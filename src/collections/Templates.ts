import type { CollectionConfig } from 'payload'

import { authenticated, ownerOnly } from '../access'
import { pageBlocks } from '../blocks'

export const Templates: CollectionConfig = {
  slug: 'templates',
  labels: {
    singular: 'Template',
    plural: 'Templates',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    description: 'Reusable page layouts built from blocks. Reorder, add, or remove blocks below.',
    livePreview: {
      url: ({ data }) =>
        data?.id
          ? `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010'}/preview/templates/${data.id}`
          : null,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: ownerOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name, e.g. "Homepage" or "Donate landing page".',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional: what this template is for / where it is used.',
      },
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: pageBlocks,
      admin: {
        description: 'Drag to reorder. This defines the structure of the page, top to bottom.',
      },
    },
  ],
}
