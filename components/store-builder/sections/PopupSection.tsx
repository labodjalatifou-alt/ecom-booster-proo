'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface PopupSettings {
  enabled?: boolean
  trigger?: 'delay' | 'exit' | 'scroll'
  delay_seconds?: number
  scroll_percent?: number
  title?: string
  subtitle?: string
  bg_color?: string
  text_color?: string
  cta_text?: string
  cta_link?: string
  cta_color?: string
  cta_text_color?: string
  image_url?: string
  overlay_color?: string
  border_radius?: number
  discount_code?: string
  body_text?: string
}

function usePopupTrigger(trigger: string, delayS: number, scrollPct: number) {
  const [show, setShow] = useState(false)
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current) return

    const fire = () => {
      if (!shown.current) { shown.current = true; setShow(true) }
    }

    if (trigger === 'delay') {
      const t = setTimeout(fire, delayS * 1000)
      return () => clearTimeout(t)
    }

    if (trigger === 'exit') {
      const onMove = (e: MouseEvent) => {
        if (e.clientY < 10) fire()
      }
      document.addEventListener('mousemove', onMove)
      return () => document.removeEventListener('mousemove', onMove)
    }

    if (trigger === 'scroll') {
      const onScroll = () => {
        const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        if (pct >= scrollPct) { fire(); window.removeEventListener('scroll', onScroll) }
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [trigger, delayS, scrollPct])

  return { show, setShow }
}

export default function PopupRender({ settings }: { settings?: PopupSettings }) {
  const s = settings || {}
  if (s.enabled === false) return null

  const trigger = s.trigger || 'delay'
  const delayS = s.delay_seconds ?? 5
  const scrollPct = s.scroll_percent ?? 50

  const { show, setShow } = usePopupTrigger(trigger, delayS, scrollPct)

  if (!show) return null

  const overlayColor = s.overlay_color || 'rgba(0,0,0,0.55)'
  const bgColor = s.bg_color || '#ffffff'
  const textColor = s.text_color || '#1a1a1a'
  const ctaColor = s.cta_color || 'var(--color-primary, #6366f1)'
  const ctaTextColor = s.cta_text_color || '#ffffff'
  const borderRadius = s.border_radius ?? 20

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style={{ background: overlayColor, backdropFilter: 'blur(4px)' }}
        onClick={() => setShow(false)}
      >
        {/* Card */}
        <div
          className="relative w-full max-w-md shadow-2xl overflow-hidden animate-popup-in"
          style={{ background: bgColor, borderRadius, color: textColor }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          >
            <X size={16} style={{ color: textColor }} />
          </button>

          {/* Image */}
          {s.image_url && (
            <div className="w-full h-48 overflow-hidden">
              <img src={s.image_url} alt="Popup" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="p-7 text-center">
            {s.title && (
              <h2 className="text-2xl font-black mb-2 leading-tight" style={{ color: textColor }}>
                {s.title}
              </h2>
            )}
            {s.subtitle && (
              <p className="text-sm opacity-75 mb-4 leading-relaxed" style={{ color: textColor }}>
                {s.subtitle}
              </p>
            )}
            {s.body_text && (
              <p className="text-base font-medium mb-5" style={{ color: textColor }}>
                {s.body_text}
              </p>
            )}
            {s.discount_code && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed font-mono font-bold text-lg mb-5 tracking-widest"
                style={{ borderColor: ctaColor, color: ctaColor, background: `${ctaColor}15` }}
              >
                {s.discount_code}
              </div>
            )}
            {s.cta_text && (
              <a
                href={s.cta_link || '#order-form'}
                onClick={() => setShow(false)}
                className="block w-full py-3 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
                style={{ background: ctaColor, color: ctaTextColor }}
              >
                {s.cta_text}
              </a>
            )}
            <button
              onClick={() => setShow(false)}
              className="mt-3 text-xs opacity-50 hover:opacity-75 transition-opacity underline"
              style={{ color: textColor }}
            >
              Non merci
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popup-in {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popup-in { animation: popup-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </>
  )
}
