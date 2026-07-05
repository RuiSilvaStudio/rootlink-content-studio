import type { Block } from 'payload'

export const ImageWithText: Block = {
  slug: 'imageWithText',
  labels: {
    singular: 'Image with Text',
    plural: 'Image with Text',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Image on left', value: 'left' },
        { label: 'Image on right', value: 'right' },
      ],
    },
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
}
