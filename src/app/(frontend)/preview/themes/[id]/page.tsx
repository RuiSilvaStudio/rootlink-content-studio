import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

import config from '@/payload.config'
import '@/components/preview/preview.css'

import { ThemePreviewClient } from './PreviewClient'

export default async function ThemePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams

  const payload = await getPayload({ config })
  const theme = await payload.findByID({ collection: 'themes', id, depth: 1 }).catch(() => null)

  if (!theme) {
    notFound()
  }

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010'

  return (
    <ThemePreviewClient
      initialData={theme}
      initialMode={mode === 'dark' ? 'dark' : 'light'}
      serverURL={serverURL}
    />
  )
}
