import type { Access, FieldAccess } from 'payload'

/** Any logged-in admin user (owner or editor). */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** Only the `owner` role. Use for destructive or team-management actions. */
export const ownerOnly: Access = ({ req: { user } }) => user?.role === 'owner'

/** Field-level equivalent of `ownerOnly`, for locking down individual fields. */
export const ownerOnlyField: FieldAccess = ({ req: { user } }) => user?.role === 'owner'

/** Anyone, logged in or not -- for content that must be publicly readable (e.g. media files). */
export const anyone: Access = () => true
