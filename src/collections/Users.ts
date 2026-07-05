import type { CollectionConfig } from 'payload'

// Small-team RBAC: 'owner' can manage everything, including other users.
// 'editor' can access the admin panel and edit content, but cannot manage
// user accounts or escalate their own role.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'updatedAt'],
  },
  auth: true,
  access: {
    // Anyone with an admin panel session can read the user list (needed for
    // basic things like "created by" display); tighten later if needed.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'owner',
    update: ({ req: { user }, id }) => user?.role === 'owner' || user?.id === id,
    delete: ({ req: { user } }) => user?.role === 'owner',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Only owners can set or change a user's role -- prevents an editor
        // from promoting themselves.
        update: ({ req: { user } }) => user?.role === 'owner',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
