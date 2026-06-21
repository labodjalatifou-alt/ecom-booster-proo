'use client'
import { useEffect, useState } from 'react'
export default function CountdownRender({ settings }: { settings: any }) {
  const s = settings || {}
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, sec: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(s.target_date || Date.now() + 86400000).getTime() - Date.now())
      setTime({ d: Math.floor(diff/86400000), h: Math.floor(diff/3600000)%24, m: Math.floor(diff/60000)%60, sec: Math.floor(diff/1000)%60 })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [s.target_date])
  const Box = ({ v, label }: { v: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-black" style={{ backgroundColor: s.timer_bg || '#312e81', color: s.accent_color || '#ef4444' }}>
        {String(v).padStart(2,'0')}
      </div>
      <span className="text-xs mt-1 font-semibold uppercase tracking-wide" style={{ color: s.text_color || '#fff' }}>{label}</span>
    </div>
  )
  return (
    <div className="w-full py-10 px-4 text-center" style={{ backgroundColor: s.bg_color || '#1e1b4b' }}>
      <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: s.accent_color || '#ef4444' }}>⚡ OFFRE LIMITÉE</p>
      <h3 className="text-xl md:text-2xl font-bold mb-6" style={{ color: s.text_color || '#fff' }}>{s.title || 'Offre expire dans'}</h3>
      <div className="flex items-center justify-center gap-3 md:gap-5">
        <Box v={time.d} label="JOURS" />
        <span className="text-2xl font-black mb-5" style={{ color: s.accent_color || '#ef4444' }}>:</span>
        <Box v={time.h} label="HEURES" />
        <span className="text-2xl font-black mb-5" style={{ color: s.accent_color || '#ef4444' }}>:</span>
        <Box v={time.m} label="MIN" />
        <span className="text-2xl font-black mb-5" style={{ color: s.accent_color || '#ef4444' }}>:</span>
        <Box v={time.sec} label="SEC" />
      </div>
    </div>
  )
}
