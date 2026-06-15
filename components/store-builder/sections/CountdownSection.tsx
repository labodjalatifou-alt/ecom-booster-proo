'use client'

import { useEffect, useState } from 'react'
import type { CountdownProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: CountdownProps
  colors: StoreColors
  fonts: StoreFonts
}

function getTimeLeft(target: string) {
  const diff = Math.max(0, Date.parse(target) - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(diff / (1000 * 60)) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    expired: diff === 0,
  }
}

function FlipUnit({ value, label, textColor }: { value: number; label: string; textColor: string }) {
  const formatted = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 20,
          padding: '20px 28px',
          minWidth: 90,
          backdropFilter: 'blur(12px)',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 56,
            fontWeight: 900,
            color: textColor,
            display: 'block',
            textAlign: 'center',
            lineHeight: 1,
            textShadow: `0 0 30px ${textColor}50`,
          }}
        >
          {formatted}
        </span>
      </div>
      <span
        style={{
          color: textColor,
          opacity: 0.65,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: 10,
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function CountdownSection({ data, colors, fonts }: Props) {
  const [time, setTime] = useState(getTimeLeft(data.target_date))

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(data.target_date)), 1000)
    return () => clearInterval(interval)
  }, [data.target_date])

  if (time.expired && data.on_expire === 'hide') return null

  const units = [
    { show: data.show_days, value: time.days, label: 'Jours' },
    { show: data.show_hours, value: time.hours, label: 'Heures' },
    { show: data.show_minutes, value: time.minutes, label: 'Min' },
    { show: data.show_seconds, value: time.seconds, label: 'Sec' },
  ].filter(u => u.show)

  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${data.bg_color} 0%, ${data.timer_bg} 100%)`,
        padding: '64px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* decorative glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${data.text_color}10 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="mx-auto max-w-4xl relative z-10 text-center">
        <p style={{ color: data.text_color, opacity: 0.6, fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>
          ⏰ Offre limitée
        </p>
        <h2 style={{ color: data.text_color, fontFamily: fonts.heading, fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
          {data.title}
        </h2>

        {time.expired && data.on_expire === 'message' ? (
          <p style={{ color: data.text_color, fontSize: 24, fontWeight: 600 }}>{data.expire_message}</p>
        ) : (
          <div className="flex items-start justify-center gap-4 md:gap-6 flex-wrap">
            {units.map(({ value, label }, i) => (
              <div key={label} className="flex items-start gap-4">
                <FlipUnit value={value} label={label} textColor={data.text_color} />
                {i < units.length - 1 && (
                  <span style={{ color: data.text_color, fontSize: 48, fontWeight: 900, opacity: 0.4, marginTop: 20, lineHeight: 1 }}>:</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
