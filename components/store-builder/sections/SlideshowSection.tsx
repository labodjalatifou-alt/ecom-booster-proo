'use client'
import { useEffect, useRef, useState } from 'react'
import type { SlideshowProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: SlideshowProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function SlideshowSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [idx, setIdx] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const slides = props.slides || []
  const total = slides.length

  const goTo = (next: number) => {
    if (transitioning || next === idx) return
    setTransitioning(true)
    setTimeout(() => {
      setIdx(next)
      setTransitioning(false)
    }, 300)
  }

  useEffect(() => {
    if (!props.autoplay || total <= 1) return
    const id = setInterval(() => {
      goTo((idx + 1) % total)
    }, props.interval || 5000)
    return () => clearInterval(id)
  }, [idx, props.autoplay, props.interval, total])

  if (!total) return (
    <div onClick={onClick} className={`flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ height: props.height || 500, backgroundColor: colors.bgSection }}>
      <p style={{ color: colors.textLight }}>Ajoutez des slides dans les paramètres</p>
    </div>
  )

  const slide = slides[idx]

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ height: props.height || 500 }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-30 font-medium">Diaporama</span>}

      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundImage: s.image_url ? `url(${s.image_url})` : undefined,
            backgroundColor: s.image_url ? undefined : colors.bgSection,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === idx ? (transitioning ? 0 : 1) : 0,
            transition: 'opacity 0.4s ease',
            zIndex: i === idx ? 1 : 0,
          }}
        >
          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: s.overlay_color || 'rgba(0,0,0,0.4)' }} />

          {/* Content */}
          <div className="relative z-10 text-center text-white px-6" style={{ maxWidth: 700 }}>
            {s.title && <h2 className="font-black text-5xl mb-4 leading-tight">{s.title}</h2>}
            {s.subtitle && <p className="text-xl mb-8 opacity-85">{s.subtitle}</p>}
            {s.cta_text && (
              <a
                href={s.cta_link || '#'}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: colors.primary, color: '#fff' }}
              >
                {s.cta_text} →
              </a>
            )}
          </div>
        </div>
      ))}

      {/* Arrows */}
      {props.show_arrows && total > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); goTo((idx - 1 + total) % total) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
          >
            ←
          </button>
          <button
            onClick={e => { e.stopPropagation(); goTo((idx + 1) % total) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
          >
            →
          </button>
        </>
      )}

      {/* Dots */}
      {props.show_dots && total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); goTo(i) }}
              className="rounded-full transition-all"
              style={{
                width: i === idx ? 24 : 8,
                height: 8,
                backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
