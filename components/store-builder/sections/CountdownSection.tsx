'use client'
import { useEffect, useState } from 'react'
import type { CountdownProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: CountdownProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function CountdownSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)
  const [flip, setFlip] = useState({ d: false, h: false, m: false, s: false })

  useEffect(() => {
    const tick = () => {
      let target = new Date(props.target_date).getTime()
      const now = Date.now()
      let diff = target - now

      if (diff <= 0) {
        if (props.on_expire === 'reset') {
          target = Date.now() + 24 * 60 * 60 * 1000
          diff = target - now
        } else {
          setExpired(true)
          return
        }
      }

      const prev = timeLeft
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      setFlip({
        d: prev.d !== d,
        h: prev.h !== h,
        m: prev.m !== m,
        s: prev.s !== s,
      })
      setTimeLeft({ d, h, m, s })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [props.target_date, props.on_expire])

  if (expired && props.on_expire === 'hide') return null

  const units = [
    { key: 'd', label: 'Jours', value: timeLeft.d, show: props.show_days },
    { key: 'h', label: 'Heures', value: timeLeft.h, show: props.show_hours },
    { key: 'm', label: 'Min', value: timeLeft.m, show: props.show_minutes },
    { key: 's', label: 'Sec', value: timeLeft.s, show: props.show_seconds },
  ].filter(u => u.show)

  return (
    <>
      <style>{`
        @keyframes flip-in { 0% { transform: rotateX(-90deg); opacity: 0; } 100% { transform: rotateX(0); opacity: 1; } }
        .flip-anim { animation: flip-in 0.35s ease; }
        .timer-block { perspective: 400px; }
      `}</style>

      <div
        onClick={onClick}
        className={`py-14 px-4 relative text-center ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ backgroundColor: props.bg_color || '#1e1b4b', color: props.text_color || '#fff' }}
      >
        {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Compte à rebours</span>}

        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ color: props.accent_color || colors.accent }} className="text-sm font-bold tracking-widest uppercase mb-2">
            ⚡ Offre limitée
          </div>
          <h2 className="text-2xl font-bold mb-2">{props.title || 'L\'offre expire dans :'}</h2>
          {props.subtitle && <p className="opacity-70 mb-8 text-sm">{props.subtitle}</p>}

          {expired && props.on_expire === 'message' ? (
            <div className="text-xl font-bold" style={{ color: props.accent_color || colors.accent }}>
              {props.expire_message || 'L\'offre est terminée'}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {units.map((unit, idx) => (
                <div key={unit.key} className="flex items-center gap-3">
                  <div className="timer-block flex flex-col items-center">
                    <div
                      className={`rounded-xl flex items-center justify-center font-black text-5xl min-w-[80px] py-4 px-2 ${flip[unit.key as keyof typeof flip] ? 'flip-anim' : ''}`}
                      style={{ backgroundColor: props.timer_bg || '#312e81', color: props.text_color || '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                    >
                      {pad(unit.value)}
                    </div>
                    <span className="text-xs mt-2 font-semibold opacity-70 tracking-wide uppercase">{unit.label}</span>
                  </div>
                  {idx < units.length - 1 && (
                    <span className="text-4xl font-black opacity-50 mb-4">:</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
