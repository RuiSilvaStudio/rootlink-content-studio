'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { useState } from 'react'

import type { Template, Theme } from '@/payload-types'

import { TemplateBlocksRenderer } from '@/components/preview/Blocks'
import { ModeToggle } from '@/components/preview/ModeToggle'
import { themeCssVars } from '@/lib/theme-tokens'

export function TemplatePreviewClient({
  initialData,
  theme,
  initialMode,
  serverURL,
}: {
  initialData: Template
  theme: Theme | null
  initialMode: 'light' | 'dark'
  serverURL: string
}) {
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode)

  const { data } = useLivePreview<Template>({
    initialData,
    serverURL,
    depth: 2,
  })

  return (
    <div className="cs-root" style={themeCssVars(theme, mode) as React.CSSProperties}>
      <ModeToggle mode={mode} onChange={setMode} />
      {!theme ? (
        <p className="cs-section cs-small">
          No theme marked active yet -- showing default colors. Mark a theme &quot;active&quot; to preview
          with real tokens.
        </p>
      ) : null}
      <TemplateBlocksRenderer blocks={data.blocks} />
    </div>
  )
}
