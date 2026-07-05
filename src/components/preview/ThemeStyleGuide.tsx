import type { Theme } from '@/payload-types'

import { lookupScale, type TypeLevel } from '@/lib/theme-tokens'

const SWATCHES: { key: keyof Theme['colorsLight']; label: string }[] = [
  { key: 'bgRoot', label: 'Base background' },
  { key: 'text', label: 'Body text' },
  { key: 'surface1', label: 'Surface 1' },
  { key: 'surface2', label: 'Surface 2' },
  { key: 'primary', label: 'Primary' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' },
]

const TYPE_LEVELS: { level: TypeLevel; sample: string }[] = [
  { level: 'h1', sample: 'Grow resilience, together.' },
  { level: 'h2', sample: 'Section header' },
  { level: 'h3', sample: 'Subsection header' },
  { level: 'body', sample: 'This is body text, used for the majority of reading content.' },
  { level: 'small', sample: 'Captions and small labels look like this.' },
  { level: 'mono', sample: 'root-a1b2c3d4' },
]

export function ThemeStyleGuide({ theme, mode }: { theme: Theme; mode: 'light' | 'dark' }) {
  const colors = mode === 'light' ? theme.colorsLight : theme.colorsDark

  return (
    <div className="cs-root">
      <section className="cs-section">
        <p className="cs-small cs-hero__eyebrow">
          {theme.name} &middot; {mode} mode
        </p>
        <h1 className="cs-h1" style={{ marginTop: 8 }}>
          Colors
        </h1>
        <div className="cs-grid" style={{ marginTop: 24 }}>
          {SWATCHES.map((s) => (
            <div className="cs-swatch" key={s.key}>
              <div className="cs-swatch__chip" style={{ background: colors[s.key] }} />
              <p className="cs-small">{s.label}</p>
              <p className="cs-mono cs-small">{colors[s.key]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cs-section">
        <h1 className="cs-h1">Typography</h1>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 'var(--cs-space-md)' }}>
          {TYPE_LEVELS.map(({ level, sample }) => {
            const s = lookupScale(theme, level)
            return (
              <div key={level}>
                <p className="cs-small" style={{ opacity: 0.6, marginBottom: 4 }}>
                  {level.toUpperCase()} &middot; {s.sizePx}px / weight {s.weight} / line-height {s.lineHeight}
                </p>
                <p className={`cs-${level}`}>{sample}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="cs-section">
        <h1 className="cs-h1">Spacing &amp; radius</h1>
        <div style={{ marginTop: 24, display: 'flex', gap: 'var(--cs-space-md)', flexWrap: 'wrap' }}>
          {(theme.spacing?.length ? theme.spacing : []).map((s) => (
            <div key={s.token} style={{ textAlign: 'center' }}>
              <div
                className="cs-surface-2"
                style={{ width: s.valuePx, height: s.valuePx, borderRadius: 'var(--cs-radius-sm)' }}
              />
              <p className="cs-small" style={{ marginTop: 8 }}>
                {s.token} ({s.valuePx}px)
              </p>
            </div>
          ))}
          {!theme.spacing?.length ? <p className="cs-body">No spacing tokens defined yet.</p> : null}
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 'var(--cs-space-md)', flexWrap: 'wrap' }}>
          {(['sm', 'md', 'lg', 'full'] as const).map((r) => (
            <div key={r} style={{ textAlign: 'center' }}>
              <div
                className="cs-surface-2"
                style={{ width: 72, height: 72, borderRadius: `var(--cs-radius-${r})` }}
              />
              <p className="cs-small" style={{ marginTop: 8 }}>
                radius-{r}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="cs-section">
        <h1 className="cs-h1">Buttons</h1>
        <div className="cs-hero__ctas" style={{ marginTop: 24 }}>
          <button className="cs-button cs-button--primary">Primary action</button>
          <button className="cs-button cs-button--secondary">Secondary action</button>
        </div>
      </section>
    </div>
  )
}
