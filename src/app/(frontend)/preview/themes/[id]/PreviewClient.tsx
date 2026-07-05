'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { useState } from 'react'

import type { Theme } from '@/payload-types'

import { ModeToggle } from '@/components/preview/ModeToggle'
import { ThemeStyleGuide } from '@/components/preview/ThemeStyleGuide'
import { themeCssVars } from '@/lib/theme-tokens'

export function ThemePreviewClient({
  initialData,
  initialMode,
  serverURL,
}: {
  initialData: Theme
  initialMode: 'light' | 'dark'
  serverURL: string
}) {
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode)

  const { data } = useLivePreview<Theme>({
    initialData,
    serverURL,
    depth: 1,
  })

  return (
    <div style={themeCssVars(data, mode) as React.CSSProperties}>
      <ModeToggle mode={mode} onChange={setMode} />
      <ThemeStyleGuide theme={data} mode={mode} />
    </div>
  )
}
