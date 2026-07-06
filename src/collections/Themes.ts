import type { CollectionConfig } from 'payload'

import { anyone, authenticated, ownerOnly, ownerOnlyField } from '../access'
import { SHADE_STEPS } from '../lib/color-scale'

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

/**
 * One themeable color family (RootLink's real Tailwind config defines
 * exactly three: primary, earth, rust -- each a full 50-900 scale). "seed"
 * plus "Generate scale" gives a fast, visual starting point; every one of
 * the 9 shades is still a normal, independently hand-editable field
 * afterwards. See src/lib/color-scale.ts and src/fields/GenerateScaleButton.tsx.
 */
function paletteFamily(label: string, defaultSeed: string) {
  return {
    type: 'group' as const,
    label,
    fields: [
      { name: 'seed', label: `${label} -- seed color`, defaultValue: defaultSeed, ...hexColor },
      {
        name: 'generateAction',
        type: 'ui' as const,
        admin: {
          components: {
            Field: '/fields/GenerateScaleButton#GenerateScaleButton',
          },
        },
      },
      {
        name: 'scale',
        type: 'group' as const,
        label: 'Shades (50 = lightest, 900 = darkest)',
        fields: SHADE_STEPS.map((step) => ({
          name: `s${step}`,
          label: step,
          ...hexColor,
        })),
      },
    ],
  }
}

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
      'Design tokens: color palette, typography, spacing. Multiple themes can exist; mark one active per site.',
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
    // Public read: the live site (and the preview-site clone) fetch the
    // active theme's palette directly, same reasoning as MarketingCopy.
    read: anyone,
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
      name: 'importExport',
      type: 'ui',
      admin: {
        components: {
          Field: '/fields/PaletteImportExport#PaletteImportExport',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Palette',
          fields: [
            {
              name: 'palette',
              type: 'group',
              fields: [
                { name: 'primary', ...paletteFamily('Primary', '#7a6040') },
                { name: 'earth', ...paletteFamily('Earth', '#8c6b48') },
                { name: 'rust', ...paletteFamily('Rust', '#a8643d') },
                { name: 'cream', label: 'Cream (base background)', defaultValue: '#f8f6f2', ...hexColor },
              ],
            },
          ],
        },
        {
          label: 'Typography',
          fields: [
            {
              name: 'fontBody',
              type: 'relationship',
              relationTo: 'fonts',
              hasMany: false,
              admin: {
                description: 'Body/serif font. Pick from the Fonts library.',
                allowCreate: true,
              },
            },
            {
              name: 'fontDisplay',
              type: 'relationship',
              relationTo: 'fonts',
              hasMany: false,
              admin: {
                description: 'Display/heading font. Pick from the Fonts library.',
                allowCreate: true,
              },
            },
            {
              name: 'fontMono',
              type: 'relationship',
              relationTo: 'fonts',
              hasMany: false,
              admin: {
                description: 'Monospace font for technical data / IDs.',
                allowCreate: true,
              },
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
                { name: 'sm', type: 'number', defaultValue: 8 },
                { name: 'md', type: 'number', defaultValue: 12 },
                { name: 'lg', type: 'number', defaultValue: 16 },
                { name: 'xl2', type: 'number', defaultValue: 16 },
                { name: 'full', type: 'number', defaultValue: 9999 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
