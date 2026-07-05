'use client'

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: 'light' | 'dark'
  onChange: (mode: 'light' | 'dark') => void
}) {
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
        background: 'rgba(0,0,0,0.06)',
        backdropFilter: 'blur(6px)',
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
            background: mode === m ? 'white' : 'transparent',
            color: '#18181b',
          }}
        >
          {m === 'light' ? 'Light' : 'Dark'}
        </button>
      ))}
    </div>
  )
}
