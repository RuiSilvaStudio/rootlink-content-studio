import type { CollectionConfig } from 'payload'

import { authenticated, ownerOnly, ownerOnlyField } from '../access'

const hexColor = {
  type: 'text' as const,
  required: true,
  validate: (value: unknown) => {
    if (typeof value !== 'string' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
      return 'Enter a hex color, e.g. #10b981'
    }
    return true
  },
  admin: {
    components: {
      Field: '/fields/ColorPickerField#ColorPickerField',
    },
  },
}

const colorModeFields = [
  { name: 'bgRoot', label: 'Base background', ...hexColor },
  { name: 'text', label: 'Body text', ...hexColor },
  { name: 'surface1', label: 'Surface (level 1)', ...hexColor },
  { name: 'surface2', label: 'Surface (level 2)', ...hexColor },
  { name: 'primary', label: 'Primary action', ...hexColor },
  { name: 'success', label: 'Success', ...hexColor },
  { name: 'warning', label: 'Warning', ...hexColor },
  { name: 'error', label: 'Error', ...hexColor },
]

export const Themes: CollectionConfig = {
  slug: 'themes',
  labels: {
    singular: 'Theme',
    plural: 'Themes',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'isActive', 'updatedAt'],
    description:
      'Design tokens: color, typography, spacing. Multiple themes can exist; mark one active per site.',
    livePreview: {
      url: ({ data }) =>
        data?.id
          ? `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010'}/preview/themes/${data.id}`
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
        description: 'e.g. "RootLink Default"',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'The active theme is the one currently live on the site.',
      },
      access: {
        // Switching the live theme is a high-impact action -- owner only.
        update: ownerOnlyField,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Colors',
          fields: [
            {
              name: 'colorsLight',
              label: 'Light mode',
              type: 'group',
              fields: colorModeFields,
            },
            {
              name: 'colorsDark',
              label: 'Dark mode',
              type: 'group',
              fields: colorModeFields,
            },
          ],
        },
        {
          label: 'Typography',
          fields: [
            {
              name: 'fontFamily',
              type: 'text',
              defaultValue: 'Inter',
              admin: { description: 'Body/display font, e.g. "Inter" or "Geist".' },
            },
            {
              name: 'fontFamilyMono',
              type: 'text',
              defaultValue: 'JetBrains Mono',
              admin: { description: 'Used for technical data / IDs.' },
            },
            {
              name: 'scale',
              type: 'array',
              labels: { singular: 'Type level', plural: 'Type scale' },
              fields: [
                {
                  name: 'level',
                  type: 'select',
                  required: true,
                  options: ['H1', 'H2', 'H3', 'Body', 'Small', 'Mono'].map((v) => ({
                    label: v,
                    value: v.toLowerCase(),
                  })),
                },
                { name: 'sizePx', type: 'number', required: true },
                {
                  name: 'weight',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Regular (400)', value: '400' },
                    { label: 'Medium (500)', value: '500' },
                    { label: 'Semi-Bold (600)', value: '600' },
                    { label: 'Bold (700)', value: '700' },
                  ],
                },
                { name: 'lineHeight', type: 'number', required: true },
              ],
            },
          ],
        },
        {
          label: 'Spacing & radii',
          fields: [
            {
              name: 'spacing',
              type: 'array',
              labels: { singular: 'Spacing token', plural: 'Spacing scale' },
              fields: [
                { name: 'token', type: 'text', required: true, admin: { description: 'e.g. sm, md, lg' } },
                { name: 'valuePx', type: 'number', required: true },
              ],
            },
            {
              name: 'radii',
              type: 'group',
              fields: [
                { name: 'sm', type: 'number', defaultValue: 4 },
                { name: 'md', type: 'number', defaultValue: 8 },
                { name: 'lg', type: 'number', defaultValue: 16 },
                { name: 'full', type: 'number', defaultValue: 9999 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
