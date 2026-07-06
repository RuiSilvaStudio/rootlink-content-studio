import type { Theme } from '@/payload-types'

import { SHADE_STEPS, lookupScale, type TypeLevel } from '@/lib/theme-tokens'

const FAMILIES = ['primary', 'earth', 'rust'] as const

const TYPE_LEVELS: { level: TypeLevel; sample: string }[] = [
  { level: 'h1', sample: 'Grow resilience, together.' },
  { level: 'h2', sample: 'Section header' },
  { level: 'h3', sample: 'Subsection header' },
  { level: 'body', sample: 'This is body text, used for the majority of reading content.' },
  { level: 'small', sample: 'Captions and small labels look like this.' },
  { level: 'mono', sample: 'root-a1b2c3d4' },
]

export function ThemeStyleGuide({ theme, mode }: { theme: Theme; mode: 'light' | 'dark' }) {
  const palette = theme.palette

  return (
    <div className="cs-root">
      <section className="cs-section">
        <p className="cs-small cs-hero__eyebrow">
          {theme.name} &middot; {mode} mode
        </p>
        <h1 className="cs-h1" style={{ marginTop: 8 }}>
          Palette
        </h1>
        {FAMILIES.map((family) => (
          <div key={family} style={{ marginTop: 24 }}>
            <p className="cs-small" style={{ opacity: 0.65, marginBottom: 8, textTransform: 'capitalize' }}>
              {family}
            </p>
            <div className="cs-grid">
              {SHADE_STEPS.map((step) => {
                const hex = palette[family].scale[`s${step}` as keyof (typeof palette)[typeof family]['scale']]
                return (
                  <div className="cs-swatch" key={step}>
                    <div className="cs-swatch__chip" style={{ background: hex }} />
                    <p className="cs-small">{step}</p>
                    <p className="cs-mono cs-small">{hex}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 24 }}>
          <p className="cs-small" style={{ opacity: 0.65, marginBottom: 8 }}>
            Cream (base background)
          </p>
          <div className="cs-swatch" style={{ maxWidth: 140 }}>
            <div className="cs-swatch__chip" style={{ background: palette.cream }} />
            <p className="cs-mono cs-small">{palette.cream}</p>
          </div>
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
