'use client'
import { useEffect, useState } from 'react'

export default function CountdownRender({ settings }: { settings: any }) {
  const s = settings || {}
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const target = s.target_date ? new Date(s.target_date).getTime() : new Date().getTime() + 86400000
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = target - now

      if (diff <= 0) {
        setExpired(true)
        clearInterval(interval)
        return
      }

      setTime({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [s.target_date])

  if (expired && s.on_expire === 'hide') return null

  if (expired && s.on_expire === 'message') {
    return (
      <div className="w-full py-4 text-center font-bold" style={{ backgroundColor: s.bg_color || 'var(--color-secondary)', color: s.text_color || 'var(--color-text)' }}>
        {s.expire_message || 'Offre expirée'}
      </div>
    )
  }

  const Unit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div 
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-3xl font-black shadow-inner"
        style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: s.accent_color || 'var(--color-primary)' }}
      >
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-[10px] sm:text-xs mt-2 uppercase font-bold tracking-wider opacity-80">{label}</span>
    </div>
  )

  return (
    <div 
      className="w-full py-8 px-4 flex flex-col items-center justify-center gap-6 shadow-sm border-y border-black/5"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)', color: s.text_color || 'var(--color-text)' }}
    >
      <h3 className="text-lg sm:text-xl font-black tracking-tight uppercase text-center max-w-2xl">
        {s.title || '🔥 L\'OFFRE EXPIRE BIENTÔT'}
      </h3>
      
      <div className="flex items-center gap-3 sm:gap-6">
        {time.d > 0 && <Unit value={time.d} label="Jours" />}
        {time.d > 0 && <span className="text-2xl font-bold opacity-50 -mt-6">:</span>}
        
        <Unit value={time.h} label="Heures" />
        <span className="text-2xl font-bold opacity-50 -mt-6">:</span>
        <Unit value={time.m} label="Minutes" />
        <span className="text-2xl font-bold opacity-50 -mt-6">:</span>
        <Unit value={time.s} label="Secondes" />
      </div>
    </div>
  )
}
