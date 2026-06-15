'use client'
import { useEffect, useRef } from 'react'
import type { HeroProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: HeroProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function HeroSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('hero-visible') },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hasImage = !!props.image_url
  const isBackground = props.image_position === 'background'
  const isSplit = !isBackground && hasImage && props.image_position !== 'none'

  const bgStyle = isBackground && hasImage
    ? { backgroundImage: `url(${props.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: props.bg_color || colors.bg }

  const align = props.text_align === 'center' ? 'items-center text-center' : props.text_align === 'right' ? 'items-end text-right' : 'items-start text-left'

  return (
    <>
      <style>{`
        .hero-animate { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .hero-visible .hero-animate { opacity: 1; transform: none; }
        .hero-animate-delay-1 { transition-delay: 0.1s; }
        .hero-animate-delay-2 { transition-delay: 0.25s; }
        .hero-animate-delay-3 { transition-delay: 0.4s; }
        .hero-animate-delay-4 { transition-delay: 0.55s; }
        .hero-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; border: none; }
        .hero-btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .hero-btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; transition: all 0.2s; cursor: pointer; background: transparent; border: 2px solid currentColor; }
        .hero-btn-secondary:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
        @keyframes badge-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .badge-anim { animation: badge-pulse 2s infinite; }
      `}</style>

      <div
        ref={ref}
        style={{ ...bgStyle, color: props.text_color || colors.text, position: 'relative' }}
        className={`relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={onClick}
      >
        {isSelected && (
          <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Hero</span>
        )}

        {/* Overlay pour mode background */}
        {isBackground && hasImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${props.overlay_opacity || 0.4})`, zIndex: 1 }} />
        )}

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
          <div className={`flex gap-12 ${isSplit ? (props.image_position === 'left' ? 'flex-row-reverse' : 'flex-row') : 'flex-col'} items-center flex-wrap`}>
            {/* Texte */}
            <div className={`flex flex-col gap-6 flex-1 min-w-[280px] ${align}`}>
              {props.show_badge && props.badge_text && (
                <div className="hero-animate hero-animate-delay-1 badge-anim self-start inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{ backgroundColor: props.badge_color || colors.accent, color: '#fff' }}>
                  ✨ {props.badge_text}
                </div>
              )}

              <h1 className="hero-animate hero-animate-delay-2 font-black leading-tight"
                style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.1 }}>
                {props.headline || 'Titre principal de votre boutique'}
              </h1>

              <p className="hero-animate hero-animate-delay-3 text-lg leading-relaxed opacity-80" style={{ maxWidth: 540 }}>
                {props.subheadline || 'Votre sous-titre percutant ici'}
              </p>

              <div className="hero-animate hero-animate-delay-4 flex flex-wrap gap-4">
                <button className="hero-btn-primary" style={{ backgroundColor: colors.primary, color: '#fff' }}>
                  {props.cta_text || 'Commander maintenant'} →
                </button>
                {props.cta_text_2 && (
                  <button className="hero-btn-secondary" style={{ color: props.text_color || colors.text }}>
                    {props.cta_text_2}
                  </button>
                )}
              </div>
            </div>

            {/* Image */}
            {isSplit && hasImage && (
              <div className="hero-animate hero-animate-delay-2 flex-1 min-w-[280px]" style={{ maxWidth: 540 }}>
                <img
                  src={props.image_url}
                  alt="Hero"
                  style={{ width: '100%', height: 'auto', borderRadius: 24, objectFit: 'cover', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
