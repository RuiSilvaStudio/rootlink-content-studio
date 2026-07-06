import type { CollectionConfig } from 'payload'

import { anyone, authenticated, ownerOnly } from '../access'
import { pageBlocks } from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    description:
      'Site pages. Each page has a URL path (slug) and is composed of blocks. Parent pages create the site tree.',
    components: {
      views: {
        list: {
          Component: '/views/PagesTreeView#PagesTreeView',
        },
      },
    },
    livePreview: {
      url: ({ data }) =>
        data?.id && data?.slug
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
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: ownerOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name, e.g. "Homepage" or "About Us".',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path, e.g. "/" for homepage, "/about" for About page. Must start with /.',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value.startsWith('/')) return 'Slug must start with /'
        return true
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: false,
      admin: {
        description: 'Parent page — leave empty for top-level pages. Creates the site tree.',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Sort order within the same level of the tree. Lower = first.',
      },
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: pageBlocks,
      admin: {
        description: 'Drag to reorder. The structure of this page, top to bottom.',
      },
    },
  ],
}