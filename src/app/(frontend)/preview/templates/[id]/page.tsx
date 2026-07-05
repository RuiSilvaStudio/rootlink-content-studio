import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

import config from '@/payload.config'
import '@/components/preview/preview.css'

import { TemplatePreviewClient } from './PreviewClient'

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string; theme?: string }>
}) {
  const { id } = await params
  const { mode, theme: themeIdParam } = await searchParams

  const payload = await getPayload({ config })
  const template = await payload.findByID({ collection: 'templates', id, depth: 2 }).catch(() => null)

  if (!template) {
    notFound()
  }

  let theme = null
  if (themeIdParam) {
    theme = await payload.findByID({ collection: 'themes', id: themeIdParam }).catch(() => null)
  }
  if (!theme) {
    const activeThemes = await payload.find({
      collection: 'themes',
      where: { isActive: { equals: true } },
      limit: 1,
    })
    theme = activeThemes.docs[0] ?? null
  }

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010'

  return (
    <TemplatePreviewClient
      initialData={template}
      theme={theme}
      initialMode={mode === 'dark' ? 'dark' : 'light'}
      serverURL={serverURL}
    />
  )
}
