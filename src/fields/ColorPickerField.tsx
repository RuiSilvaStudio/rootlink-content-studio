'use client'

import type { TextFieldClientProps } from 'payload'

import { FieldError, FieldLabel, useField } from '@payloadcms/ui'
import React from 'react'

/**
 * Replaces the raw hex text input with a visual color swatch + native color
 * picker, so editing a theme doesn't require reading/typing hex codes.
 * Still stores a plain hex string, so it's a drop-in for a `text` field.
 */
export function ColorPickerField(props: TextFieldClientProps) {
  const { field, path: pathFromProps } = props
  const { path, setValue, showError, value } = useField<string>({ path: pathFromProps })

  const hex = typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : '#000000'

  return (
    <div className="field-type text" style={{ marginBottom: 20 }}>
      <FieldLabel htmlFor={`field-${path}`} label={field.label} required={field.required} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          aria-label={typeof field.label === 'string' ? `${field.label} color picker` : 'Color picker'}
          type="color"
          value={hex}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: 44,
            height: 36,
            padding: 0,
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 6,
            cursor: 'pointer',
            background: 'none',
          }}
        />
        <input
          id={`field-${path}`}
          type="text"
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#10b981"
          spellCheck={false}
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            padding: '8px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-elevation-800)',
          }}
        />
      </div>
      {showError ? <FieldError path={path} /> : null}
    </div>
  )
}
