'use client'

import type { TextFieldClientProps } from 'payload'

import { useField } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

import RAW from '@/lib/i18n-keys.json'
const FLAT: Record<string, string> = {}

function flatten(obj: unknown, prefix = ''): void {
  if (!obj || typeof obj !== 'object') return
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const k = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'string') {
      FLAT[k] = val
    } else {
      flatten(val, k)
    }
  }
}
flatten(RAW)

const ALL_KEYS = Object.keys(FLAT).sort()

// Public-facing marketing/navigation keys -- these make sense to edit.
// Everything else is admin UI or internal strings.
const MARKETING_PREFIXES = ['home.', 'nav.', 'create.']
const MARKETING_KEYS = ALL_KEYS.filter((k) => MARKETING_PREFIXES.some((p) => k.startsWith(p)))
const OTHER_KEYS = ALL_KEYS.filter((k) => !MARKETING_PREFIXES.some((p) => k.startsWith(p)))

const MAX_VISIBLE = 12

export function I18nKeyPicker(props: TextFieldClientProps) {
  const { path: pathFromProps } = props
  const { setValue, value } = useField<string>({ path: pathFromProps })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(() => {
    const pool = showAll || search ? ALL_KEYS : MARKETING_KEYS.slice(0, MAX_VISIBLE)
    if (!search) return pool.slice(0, search ? 30 : (showAll ? 50 : MAX_VISIBLE))
    const q = search.toLowerCase()
    return pool
      .filter((k) => k.toLowerCase().includes(q) || (FLAT[k] || '').toLowerCase().includes(q))
      .slice(0, 30)
  }, [search, showAll])

  const selectedText = value && FLAT[value] ? `${value} — ${FLAT[value]}` : (value || '')

  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 6,
          textTransform: 'capitalize',
        }}
      >
        Key
        <span style={{ color: 'var(--theme-error-500)', marginLeft: 4 }}>*</span>
      </label>

      {/* Input / selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 6,
          background: 'var(--theme-input-bg)',
          cursor: 'text',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <input
          type="text"
          value={open ? search : selectedText}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={open ? 'Type to search i18n keys...' : 'home.hero_title'}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '10px 12px',
            fontSize: 14,
            fontFamily: 'var(--font-mono, monospace)',
            outline: 'none',
            color: 'var(--theme-elevation-800)',
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '6px 12px',
            fontSize: 14,
            opacity: 0.5,
          }}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 340,
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 && search ? (
            <div style={{ padding: '12px 14px', fontSize: 13, opacity: 0.6 }}>
              No key matches &quot;{search}&quot; — this will create a custom key.
            </div>
          ) : (
            filtered.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setValue(k)
                  setOpen(false)
                  setSearch('')
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: value === k ? 'var(--theme-elevation-100)' : 'transparent',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  fontSize: 13,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--theme-elevation-50)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = value === k ? 'var(--theme-elevation-100)' : 'transparent'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 600 }}>
                  {k}
                </div>
                <div style={{ opacity: 0.7, marginTop: 2, fontSize: 12, lineHeight: 1.3 }}>
                  {FLAT[k]}
                </div>
              </button>
            ))
          )}
          {!search && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowAll((v) => !v)
              }}
              style={{
                display: 'block',
                width: '100%',
                border: 'none',
                background: 'var(--theme-elevation-50)',
                borderTop: '1px solid var(--theme-elevation-100)',
                cursor: 'pointer',
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 600,
                opacity: 0.7,
                textAlign: 'center',
              }}
            >
              {showAll ? 'Show marketing keys only' : `Show all ${OTHER_KEYS.length}+ keys`}
            </button>
          )}
        </div>
      )}

      {/* Backdrop to close */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => {
            setOpen(false)
            setSearch('')
          }}
        />
      )}
    </div>
  )
}
