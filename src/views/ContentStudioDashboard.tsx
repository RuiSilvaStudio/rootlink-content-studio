'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type PageNode = {
  id: number; title: string; slug: string; status: string; parent?: number | null; order: number
  children: PageNode[]
}
type ToolTab = 'fonts' | 'theme' | 'media' | 'templates'

function buildTree(pages: PageNode[]): PageNode[] {
  const map = new Map<number, PageNode>()
  const roots: PageNode[] = []
  for (const p of pages) { map.set(p.id, { ...p, children: [] }) }
  for (const p of map.values()) {
    if (p.parent && map.has(p.parent)) map.get(p.parent)!.children.push(p)
    else roots.push(p)
  }
  const s = (ns: PageNode[]) => { ns.sort((a, b) => a.order - b.order); ns.forEach((n) => s(n.children)) }
  s(roots)
  return roots
}

function PageTreeItem({ node, level, active, onClick }: { node: PageNode; level: number; active: string | null; onClick: (slug: string) => void }) {
  const [expanded, setExpanded] = useState(level < 1)
  return (
    <div>
      <div
        onClick={() => { onClick(node.slug); setExpanded((v) => !v) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', paddingLeft: 10 + level * 16,
          cursor: 'pointer', borderRadius: 6, fontSize: 13, fontWeight: active === node.slug ? 600 : 400,
          background: active === node.slug ? 'var(--theme-elevation-100)' : 'transparent',
          color: active === node.slug ? 'var(--theme-elevation-900)' : 'var(--theme-elevation-600)',
        }}
        onMouseEnter={(e) => { if (active !== node.slug) e.currentTarget.style.background = 'var(--theme-elevation-50)' }}
        onMouseLeave={(e) => { if (active !== node.slug) e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ fontSize: 10, opacity: 0.5, width: 12, textAlign: 'center', flexShrink: 0 }}>
          {node.children.length > 0 ? (expanded ? '▾' : '▸') : ''}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {node.title}
        </span>
      </div>
      {expanded && node.children.length > 0 && (
        <div>
          {node.children.map((c) => <PageTreeItem key={c.id} node={c} level={level + 1} active={active} onClick={onClick} />)}
        </div>
      )}
    </div>
  )
}

export function ContentStudioDashboard(_props: Record<string, unknown>) {
  const [pages, setPages] = useState<PageNode[]>([])
  const [activeSlug, setActiveSlug] = useState<string | null>('/')
  const [rightTab, setRightTab] = useState<ToolTab>('theme')
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [selectedField, setSelectedField] = useState<{
    collection: string; key: string; label: string; currentValue: string
    csType?: string; linkUrl?: string
  } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const cloneUrl = process.env.NEXT_PUBLIC_CLONE_URL || 'http://localhost:3011'

  useEffect(() => {
    fetch('/api/pages?limit=100&depth=0')
      .then((r) => r.json())
      .then((d) => setPages(buildTree(d.docs || [])))
      .catch(() => {})
  }, [])

  // Listen for field-level postMessages from the clone iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'content-studio:select-field') {
        setSelectedField(e.data)
        setRightTab('theme') // switch to editing context
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const sidebar = { width: 260, background: 'var(--theme-elevation-50)', borderRight: '1px solid var(--theme-elevation-100)', overflow: 'auto' }

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'var(--font-body, system-ui)' }}>
      {/* ── LEFT SIDEBAR: page tree ──────────────────────── */}
      {leftOpen && (
        <div style={sidebar}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--theme-elevation-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5 }}>Pages</span>
            <button onClick={() => setLeftOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5, fontSize: 14 }}>×</button>
          </div>
          <div style={{ padding: '6px 0' }}>
            {pages.map((n) => <PageTreeItem key={n.id} node={n} level={0} active={activeSlug} onClick={setActiveSlug} />)}
          </div>
        </div>
      )}

      {/* ── TOGGLE LEFT ────────────────────────────────────── */}
      {!leftOpen && (
        <div style={{ width: 32, background: 'var(--theme-elevation-50)', borderRight: '1px solid var(--theme-elevation-100)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12 }}>
          <button onClick={() => setLeftOpen(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5, fontSize: 14 }}>☰</button>
        </div>
      )}

      {/* ── CENTER: clone iframe ──────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', background: '#e4e4e7' }}>
        <iframe
          ref={iframeRef}
          src={`${cloneUrl}${activeSlug || '/'}?edit=1`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Content Studio Preview"
        />
      </div>

      {/* ── TOGGLE RIGHT ───────────────────────────────────── */}
      {!rightOpen && (
        <div style={{ width: 32, background: 'var(--theme-elevation-50)', borderLeft: '1px solid var(--theme-elevation-100)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12 }}>
          <button onClick={() => setRightOpen(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5, fontSize: 14 }}>☰</button>
        </div>
      )}

      {/* ── RIGHT SIDEBAR: tools ──────────────────────────── */}
      {rightOpen && (
        <div style={{ ...sidebar, borderRight: 'none', borderLeft: '1px solid var(--theme-elevation-100)' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--theme-elevation-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['theme', 'fonts', 'media', 'templates'] as ToolTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  style={{
                    border: 'none', background: rightTab === tab ? 'var(--theme-elevation-100)' : 'transparent',
                    cursor: 'pointer', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    textTransform: 'capitalize', color: rightTab === tab ? 'var(--theme-elevation-900)' : 'var(--theme-elevation-500)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={() => setRightOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5, fontSize: 14 }}>×</button>
          </div>
          <div style={{ padding: 12 }}>
            {selectedField ? (
              <InlineFieldEditor
                field={selectedField}
                onClose={() => setSelectedField(null)}
                onSaved={() => {
                  // Refresh the iframe to reflect changes
                  if (iframeRef.current) {
                    iframeRef.current.src = iframeRef.current.src;
                  }
                }}
              />
            ) : (
              <>
                {rightTab === 'theme' && <QuickThemePanel />}
                {rightTab === 'fonts' && <QuickFontsPanel />}
                {rightTab === 'media' && <QuickMediaPanel />}
                {rightTab === 'templates' && <QuickTemplatesPanel />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InlineFieldEditor({ field, onClose, onSaved }: {
  field: { collection: string; key: string; label: string; currentValue: string; csType?: string; linkUrl?: string }
  onClose: () => void
  onSaved: () => void
}) {
  const [value, setValue] = useState(field.currentValue)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setStatus('saving')
    try {
      if (field.collection === 'marketing-copy') {
        // Find existing
        const searchRes = await fetch(`/api/marketing-copy?where[key][equals]=${encodeURIComponent(field.key)}&limit=1`)
        const searchData = await searchRes.json()
        const existing = searchData?.docs?.[0]
        const method = existing ? 'PATCH' : 'POST'
        const url = existing ? `/api/marketing-copy/${existing.id}` : '/api/marketing-copy'
        const body = existing
          ? { value, locale: 'en' }
          : { key: field.key, value, locale: 'en' }
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        setStatus('saved')
        setTimeout(() => { setStatus('idle'); onSaved() }, 800)
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{field.csType === 'button' ? 'Button' : field.label}</div>
          <div style={{ fontSize: 11, opacity: 0.5, fontFamily: 'monospace' }}>{field.key}</div>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5 }}>×</button>
      </div>

      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); if (status === 'saved') setStatus('idle') }}
        rows={3}
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--theme-elevation-200)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
      />

      {field.csType === 'button' && field.linkUrl ? (
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--theme-elevation-50)', fontSize: 11, fontFamily: 'monospace', opacity: 0.7 }}>
          → {field.linkUrl}
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 11, opacity: 0.5 }}>{value.length} chars</span>
        <button
          onClick={handleSave}
          disabled={status === 'saving' || value === field.currentValue}
          style={{
            border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: value === field.currentValue ? 'default' : 'pointer',
            background: status === 'saved' ? '#10b981' : status === 'error' ? '#ef4444' : value === field.currentValue ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-900)',
            color: status === 'saved' || status === 'error' ? '#fff' : value === field.currentValue ? 'var(--theme-elevation-400)' : '#fff',
          }}
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : status === 'error' ? 'Error' : 'Save'}
        </button>
      </div>

      {field.collection === 'marketing-copy' && (
        <div style={{ marginTop: 12 }}>
          <Link href="/admin/collections/marketing-copy" style={{ fontSize: 11, opacity: 0.5 }}>Open all copy →</Link>
        </div>
      )}
    </div>
  )
}

function QuickThemePanel() {
  const [theme, setTheme] = useState<Record<string, unknown> | null>(null)
  useEffect(() => {
    fetch('/api/themes?where[isActive][equals]=true&limit=1&depth=0')
      .then((r) => r.json()).then((d) => setTheme(d.docs?.[0] || null)).catch(() => {})
  }, [])
  if (!theme) return <div style={{ opacity: 0.5, fontSize: 13 }}>Loading theme...</div>
  const p = theme.palette as Record<string, unknown> | undefined
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{(theme.name as string) || 'Theme'}</div>
      <div style={{ marginBottom: 12 }}>
        <Link href="/admin/collections/themes" style={{ fontSize: 12, opacity: 0.6 }}>Open full editor →</Link>
      </div>
      {p && ['primary', 'earth', 'rust'].map((fam) => {
        const f = p[fam] as Record<string, unknown> | undefined
        if (!f) return null
        const scale = f.scale as Record<string, string> | undefined
        return (
          <div key={fam} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'capitalize', marginBottom: 4 }}>{fam}</div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {['s50','s100','s200','s300','s400','s500','s600','s700','s800','s900'].map((s) => (
                <div key={s} style={{ width: 18, height: 18, borderRadius: 3, background: scale?.[s] || '#ccc', border: '1px solid rgba(0,0,0,0.1)' }} title={`${s}: ${scale?.[s] || ''}`} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function QuickFontsPanel() {
  const [fonts, setFonts] = useState<{ id: number; family: string }[]>([])
  useEffect(() => {
    fetch('/api/fonts?limit=20&depth=0').then((r) => r.json()).then((d) => setFonts(d.docs || [])).catch(() => {})
  }, [])
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Fonts</div>
      <Link href="/admin/collections/fonts" style={{ fontSize: 12, opacity: 0.6, display: 'block', marginBottom: 10 }}>Manage →</Link>
      {fonts.map((f) => <div key={f.id} style={{ padding: '3px 0', fontSize: 13 }}>{f.family}</div>)}
    </div>
  )
}

function QuickMediaPanel() {
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Media</div>
      <Link href="/admin/collections/media" style={{ fontSize: 12, opacity: 0.6 }}>Open media library →</Link>
    </div>
  )
}

function QuickTemplatesPanel() {
  const [templates, setTemplates] = useState<{ id: number; name: string }[]>([])
  useEffect(() => {
    fetch('/api/templates?limit=20&depth=0').then((r) => r.json()).then((d) => setTemplates(d.docs || [])).catch(() => {})
  }, [])
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Templates</div>
      <Link href="/admin/collections/templates" style={{ fontSize: 12, opacity: 0.6, display: 'block', marginBottom: 10 }}>Manage →</Link>
      {templates.map((t) => <div key={t.id} style={{ padding: '3px 0', fontSize: 13 }}>{t.name}</div>)}
    </div>
  )
}
