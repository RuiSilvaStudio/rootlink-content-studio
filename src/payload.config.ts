import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Fonts } from './collections/Fonts'
import { MarketingCopy } from './collections/MarketingCopy'
import { Pages } from './collections/Pages'
import { Templates } from './collections/Templates'
import { Themes } from './collections/Themes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Fonts, Media, MarketingCopy, Pages, Themes, Templates],
  editor: lexicalEditor(),
  // Allows the preview-site clone (a separate Next.js app/port) to fetch
  // published content (marketing copy, themes) directly from this API.
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010', 'http://localhost:3011'],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
