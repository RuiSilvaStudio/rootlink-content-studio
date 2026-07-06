'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s',
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

interface PageNode {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published'
  parent?: number | null
  order: number
  children: PageNode[]
}

function buildTree(pages: PageNode[]): PageNode[] {
  const map = new Map<number, PageNode>()
  const roots: PageNode[] = []

  for (const p of pages) {
    map.set(p.id, { ...p, children: [] })
  }

  for (const p of map.values()) {
    if (p.parent && map.has(p.parent)) {
      map.get(p.parent)!.children.push(p)
    } else {
      roots.push(p)
    }
  }

  const sort = (nodes: PageNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    nodes.forEach((n) => sort(n.children))
  }
  sort(roots)
  return roots
}

function TreeNode({
  node,
  level,
  onRefresh,
}: {
  node: PageNode
  level: number
  onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(level < 1)
  const hasChildren = node.children.length > 0

  const handleDelete = async () => {
    if (!confirm(`Delete "${node.title}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/pages/${node.id}`, { method: 'DELETE' })
      onRefresh()
    } catch {
      alert('Delete failed.')
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          paddingLeft: 12 + level * 24,
          borderRadius: 6,
          cursor: 'pointer',
          transition: 'background 0.1s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--theme-elevation-50)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          style={{
            border: 'none',
            background: 'none',
            cursor: hasChildren ? 'pointer' : 'default',
            padding: 0,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hasChildren ? 0.7 : 0.15,
          }}
        >
          <Chevron open={expanded} />
        </button>

        <span style={{ opacity: 0.5, fontSize: 16 }}>
          {node.slug === '/' ? '\uD83C\uDF10' : '\uD83D\uDCC4'}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.title}
          </div>
          <div
            style={{
              fontSize: 11,
              opacity: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.slug}
          </div>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 999,
            background: node.status === 'published' ? '#10b98122' : '#f59e0b22',
            color: node.status === 'published' ? '#10b981' : '#f59e0b',
          }}
        >
          {node.status}
        </span>

        <Link
          href={`/admin/collections/pages/${node.id}`}
          title="Edit page"
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 13,
            opacity: 0.5,
            textDecoration: 'none',
            color: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'var(--theme-elevation-100)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.5'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          title="Delete page"
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 13,
            opacity: 0.5,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--theme-error-500)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'var(--theme-error-100)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.5'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Delete
        </button>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  )
}

export function PagesTreeView(_props: Record<string, unknown>) {
  const [nodes, setNodes] = useState<PageNode[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pages?limit=500&depth=0')
      const data = await res.json()
      setNodes(buildTree(data.docs || []))
    } catch {
      // keep whatever we have
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard mount-time data fetch
    fetchPages()
  }, [fetchPages])

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Site Pages</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.6 }}>
            Click the arrow to expand children. Drag blocks to reorder inside each page.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={fetchPages} className="btn btn--style-secondary btn--size-small">
            Refresh
          </button>
          <Link href="/admin/collections/pages/create" className="btn btn--style-primary btn--size-small">
            + New Page
        </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Loading pages...</p>
      ) : nodes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
          <p style={{ fontSize: 40, margin: '0 auto 12px' }}>{'\uD83D\uDCC4'}</p>
          <p>No pages yet. Create your first page to get started.</p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--theme-elevation-50)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {nodes.map((node) => (
            <TreeNode key={node.id} node={node} level={0} onRefresh={fetchPages} />
          ))}
        </div>
      )}
    </div>
  )
}
