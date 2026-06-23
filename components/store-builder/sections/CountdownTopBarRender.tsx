'use client'

import { useEffect, useState } from 'react'

export default function CountdownTopBarRender({ settings }: { settings: any }) {
  const s = settings || {}
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const target = new Date(s.target_date || Date.now() + 12 * 3600000).getTime()
      const diff = Math.max(0, target - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [s.target_date])

  return (
    <div className="w-full py-3 px-4" style={{ backgroundColor: s.bg_color || '#3A2A2E' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-4 flex-wrap">
        <span className="text-sm font-semibold" style={{ color: s.text_color || '#FFF8F3' }}>
          🔥 {s.label || 'Offre'}{' '}
          <b style={{ color: s.accent_color || '#C9A24B' }}>{s.discount_text || '-39%'}</b>{' '}
          {s.suffix || 'se termine dans'}
        </span>
        <div className="flex gap-2">
          {[
            [time.h, 'h'],
            [time.m, 'm'],
            [time.s, 's'],
          ].map(([val, unit], i) => (
            <div
              key={i}
              className="rounded-xl px-3 py-1.5 font-bold text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
            >
              {String(val).padStart(2, '0')}{unit}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
