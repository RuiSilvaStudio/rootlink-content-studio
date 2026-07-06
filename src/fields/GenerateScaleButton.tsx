'use client'

import type { UIFieldClientProps } from 'payload'

import { useForm } from '@payloadcms/ui'
import React, { useState } from 'react'

import { generateScale, SHADE_STEPS } from '../lib/color-scale'

/**
 * "Generate scale from seed" button for a Palette family group
 * (palette.<family>.seed / palette.<family>.scale.s50..s900). Reads the
 * family's `seed` field and overwrites all 9 `scale.sNNN` sibling fields --
 * a normal, still-independently-editable set of fields afterwards, not a
 * locked/computed value. Safe to click again any time; it always overwrites
 * the whole scale from whatever the seed currently is.
 */
export function GenerateScaleButton(props: UIFieldClientProps) {
  const { path } = props
  const { dispatchFields, getDataByPath } = useForm()
  const [justGenerated, setJustGenerated] = useState(false)

  // path is this ui field's own path, e.g. "palette.primary.generateAction"
  const familyPath = path.split('.').slice(0, -1).join('.')
  const seedPath = `${familyPath}.seed`

  const handleClick = () => {
    const seed = getDataByPath<string>(seedPath)
    if (!seed || !/^#?[0-9a-fA-F]{6}$/.test(seed)) {
      return
    }
    const scale = generateScale(seed)
    for (const step of SHADE_STEPS) {
      dispatchFields({
        type: 'UPDATE',
        path: `${familyPath}.scale.s${step}`,
        value: scale[step],
      })
    }
    setJustGenerated(true)
    setTimeout(() => setJustGenerated(false), 1500)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        type="button"
        onClick={handleClick}
        className="btn btn--style-secondary btn--size-small"
        style={{ cursor: 'pointer' }}
      >
        {justGenerated ? 'Scale generated ✓' : 'Generate scale from seed color'}
      </button>
      <p style={{ fontSize: 13, opacity: 0.65, marginTop: 6 }}>
        Fills in all 9 shades below from the seed color above. Every shade stays editable by
        hand afterwards -- generating again always overwrites them from the current seed.
      </p>
    </div>
  )
}
