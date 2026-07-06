'use client'

import type { UIFieldClientProps } from 'payload'

import { useForm } from '@payloadcms/ui'
import React, { useRef, useState } from 'react'

import { SHADE_STEPS } from '../lib/color-scale'

const FAMILIES = ['primary', 'earth', 'rust'] as const

type PaletteData = {
  primary: { seed: string; scale: Record<string, string> }
  earth: { seed: string; scale: Record<string, string> }
  rust: { seed: string; scale: Record<string, string> }
  cream: string
}

/**
 * Import/export controls for the whole Palette group. Export downloads the
 * current primary/earth/rust/cream values as a JSON file; import reads one
 * back in and overwrites every field. Lets a designer hand you (or you hand
 * a designer) a palette file directly instead of re-entering colors one by
 * one -- e.g. exported from a design tool, or shared between themes/sites.
 */
export function PaletteImportExport(props: UIFieldClientProps) {
  const { path } = props
  const { dispatchFields, getData } = useForm()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  // path is this ui field's own path, e.g. "palette.importExport"
  const palettePath = path.split('.').slice(0, -1).join('.')

  const handleExport = () => {
    const data = getData()
    const palette = palettePath
      .split('.')
      .reduce<Record<string, unknown> | undefined>(
        (acc, key) => acc?.[key] as Record<string, unknown> | undefined,
        data as Record<string, unknown>,
      )
    if (!palette) {
      setStatus('Nothing to export yet.')
      return
    }
    const { importExport: _omit, ...clean } = palette
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'theme-palette.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as Partial<PaletteData>

      for (const family of FAMILIES) {
        const familyData = parsed[family]
        if (!familyData) continue
        if (familyData.seed) {
          dispatchFields({ type: 'UPDATE', path: `${palettePath}.${family}.seed`, value: familyData.seed })
        }
        for (const step of SHADE_STEPS) {
          const key = `s${step}`
          const value = familyData.scale?.[key]
          if (value) {
            dispatchFields({ type: 'UPDATE', path: `${palettePath}.${family}.scale.${key}`, value })
          }
        }
      }
      if (parsed.cream) {
        dispatchFields({ type: 'UPDATE', path: `${palettePath}.cream`, value: parsed.cream })
      }
      setStatus(`Imported "${file.name}".`)
    } catch (ignore) {
      setStatus('Could not read that file -- expected the JSON export format.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <button type="button" onClick={handleImportClick} className="btn btn--style-secondary btn--size-small">
        Import theme file
      </button>
      <button type="button" onClick={handleExport} className="btn btn--style-secondary btn--size-small">
        Export theme as JSON
      </button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} style={{ display: 'none' }} />
      {status ? <span style={{ fontSize: 13, opacity: 0.7 }}>{status}</span> : null}
    </div>
  )
}
