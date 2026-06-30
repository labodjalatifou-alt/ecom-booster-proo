'use client'

import { useEffect, useState, useMemo } from 'react'

/** Compte à rebours basé sur une durée (heures + minutes), pas une date calendrier */
export default function CountdownRender({ settings }: { settings: any }) {
  const s = settings || {}
  const durationMs = useMemo(() => {
    const h = Number(s.duration_hours ?? 2)
    const m = Number(s.duration_minutes ?? 0)
    return (h * 3600 + m * 60) * 1000 || 7200000
  }, [s.duration_hours, s.duration_minutes])

  const [remaining, setRemaining] = useState(durationMs)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const key = `countdown-${s.id || 'block'}-${durationMs}`
    let end = Number(sessionStorage.getItem(key))
    if (!end || end <= Date.now()) {
      end = Date.now() + durationMs
      sessionStorage.setItem(key, String(end))
    }
    const tick = () => {
      const diff = end - Date.now()
      if (diff <= 0) {
        if (s.on_expire === 'reset') {
          end = Date.now() + durationMs
          sessionStorage.setItem(key, String(end))
          setRemaining(durationMs)
          setExpired(false)
          return
        }
        setExpired(true)
        setRemaining(0)
        return
      }
      setRemaining(diff)
      setExpired(false)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [durationMs, s.on_expire, s.id])

  if (expired && s.on_expire === 'hide') return null
  if (expired && s.on_expire === 'message') {
    return (
      <div className="w-full py-4 text-center font-bold" style={{ backgroundColor: s.bg_color || 'var(--color-secondary)', color: s.text_color || 'var(--color-text)' }}>
        {s.expire_message || 'Offre expirée'}
      </div>
    )
  }

  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-inner countdown-unit"
        style={{ backgroundColor: s.accent_color ? `${s.accent_color}22` : 'rgba(0,0,0,0.08)', color: s.accent_color || 'var(--color-primary)' }}
      >
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-[10px] sm:text-xs mt-2 uppercase font-bold tracking-wider opacity-80">{label}</span>
    </div>
  )

  return (
    <div
      className="w-full py-8 px-4 flex flex-col items-center justify-center gap-5 border-y border-black/5"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)', color: s.text_color || 'var(--color-text)' }}
    >
      <h3 className="text-lg sm:text-xl font-black tracking-tight uppercase text-center max-w-2xl">
        {s.title || '🔥 L\'OFFRE EXPIRE BIENTÔT'}
      </h3>
      <div className="flex items-center gap-4 sm:gap-6">
        <Unit value={hours} label="Heures" />
        <span className="text-3xl font-black opacity-40 -mt-6">:</span>
        <Unit value={minutes} label="Minutes" />
        <span className="text-3xl font-black opacity-40 -mt-6">:</span>
        <Unit value={seconds} label="Secondes" />
      </div>
      <style>{`.countdown-unit { animation: pulse 2s ease-in-out infinite; }`}</style>
    </div>
  )
}
