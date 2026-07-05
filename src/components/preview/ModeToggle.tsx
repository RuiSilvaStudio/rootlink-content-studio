'use client'

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: 'light' | 'dark'
  onChange: (mode: 'light' | 'dark') => void
}) {
  // This is editor "chrome", not part of the themed page it floats over --
  // it must stay legible no matter what colors the theme being edited uses
  // (including broken/incomplete ones). So its own colors are fixed and never
  // derived from the theme/page underneath it.
  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 50,
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      }}
    >
      {(['light', 'dark'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          style={{
            border: 'none',
            cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: mode === m ? 700 : 400,
            background: mode === m ? '#18181b' : 'transparent',
            color: mode === m ? '#ffffff' : '#18181b',
          }}
        >
          {m === 'light' ? 'Light' : 'Dark'}
        </button>
      ))}
    </div>
  )
}
