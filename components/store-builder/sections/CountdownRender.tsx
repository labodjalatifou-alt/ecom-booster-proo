'use client'

import { useEffect, useState } from 'react'

export default function CountdownRender({ settings }: { settings: Record<string, any> }) {
  const bgColor = settings.bg_color ?? '#1e1b4b'
  const textColor = settings.text_color ?? '#ffffff'
  const accentColor = settings.accent_color ?? '#ef4444'
  const title = settings.title ?? 'Offre expire dans'
  
  // Default target is 24h from now if not specified or invalid
  const defaultTarget = new Date(Date.now() + 86400000).toISOString()
  const targetDateStr = settings.target_date ?? defaultTarget

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    let target = new Date(targetDateStr).getTime()
    if (isNaN(target)) target = new Date(defaultTarget).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = target - now

      if (distance < 0) {
        clearInterval(interval)
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setIsExpired(false)
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDateStr, defaultTarget])

  const expirationAction = settings.on_expire ?? 'message'
  const expireMessage = settings.expire_message ?? 'Cette offre est terminée.'

  if (isExpired) {
    if (expirationAction === 'hide') return null
    if (expirationAction === 'message') {
      return (
        <div className="w-full p-6 text-center rounded-xl" style={{ backgroundColor: bgColor, color: textColor }}>
          <p className="font-bold text-lg">{expireMessage}</p>
        </div>
      )
    }
    // if 'reset', it should reset, but for now we just show 00:00:00
  }

  const TimeBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div 
        className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg text-2xl md:text-3xl font-black tabular-nums relative overflow-hidden shadow-inner"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: accentColor }}
      >
        <span className="relative z-10 animate-pulse">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] md:text-xs font-bold uppercase mt-2 opacity-80 tracking-wider" style={{ color: textColor }}>
        {label}
      </span>
    </div>
  )

  return (
    <div className="w-full p-6 rounded-xl flex flex-col items-center" style={{ backgroundColor: bgColor }}>
      {title && (
        <h3 className="text-lg md:text-xl font-bold mb-4 text-center" style={{ color: textColor }}>
          {title}
        </h3>
      )}
      <div className="flex items-center gap-3 md:gap-4">
        <TimeBlock value={timeLeft.days} label="Jours" />
        <span className="text-2xl font-bold pb-6 opacity-50" style={{ color: textColor }}>:</span>
        <TimeBlock value={timeLeft.hours} label="Heures" />
        <span className="text-2xl font-bold pb-6 opacity-50" style={{ color: textColor }}>:</span>
        <TimeBlock value={timeLeft.minutes} label="Min" />
        <span className="text-2xl font-bold pb-6 opacity-50" style={{ color: textColor }}>:</span>
        <TimeBlock value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  )
}
