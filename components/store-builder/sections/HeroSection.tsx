'use client'

import { useEffect, useRef } from 'react'
import type { HeroProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: HeroProps
  colors: StoreColors
  fonts: StoreFonts
}

export default function HeroSection({ data, colors, fonts }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el || data.animation === 'none') return
    el.style.opacity = '0'
    el.style.transform = data.animation === 'slideUp' ? 'translateY(48px)' : 'scale(0.96)'
    const timer = setTimeout(() => {
      el.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0) scale(1)'
    }, 120)
    return () => clearTimeout(timer)
  }, [data.animation])

  const isBackground = data.image_position === 'background'
  const isNone = data.image_position === 'none'
  const isSplit = data.image_position === 'left' || data.image_position === 'right'
  const textColor = isBackground && data.image_url ? '#ffffff' : (data.text_color || colors.text)

  const ImagePlaceholder = () => (
    <div
      className="rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-100"
      style={{ minHeight: 380 }}
    >
      <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )

  return (
    <section style={{ backgroundColor: data.bg_color || colors.bg, position: 'relative', overflow: 'hidden' }}>
      {isBackground && data.image_url && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${data.image_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000', opacity: data.overlay_opacity }} />
        </>
      )}

      <div
        ref={contentRef}
        className={`relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-36 ${isSplit ? 'grid md:grid-cols-2 gap-16 items-center' : 'flex flex-col'}`}
        style={{
          alignItems: data.text_align === 'center' ? 'center' : data.text_align === 'right' ? 'flex-end' : 'flex-start',
          textAlign: data.text_align,
        }}
      >
        {data.image_position === 'left' && (
          data.image_url
            ? <div className="rounded-3xl overflow-hidden shadow-2xl order-first"><img src={data.image_url} alt="Hero" className="w-full h-96 object-cover" /></div>
            : <ImagePlaceholder />
        )}

        <div className="space-y-8" style={{ maxWidth: (isNone || isBackground) ? 720 : '100%' }}>
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
              ✨ Nouveau
            </span>
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight"
              style={{ fontFamily: fonts.heading, color: textColor, lineHeight: 1.1 }}>
              {data.headline}
            </h1>
          </div>
          <p className="text-xl leading-relaxed" style={{ color: textColor, opacity: 0.85, fontFamily: fonts.body }}>
            {data.subheadline}
          </p>
          <div>
            <a
              href={data.cta_link || '#order-form'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                backgroundColor: colors.primary, color: '#fff',
                padding: '18px 40px', borderRadius: 50,
                fontSize: 18, fontWeight: 700, fontFamily: fonts.body,
                boxShadow: `0 12px 32px ${colors.primary}55`,
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(-4px) scale(1.04)'
                el.style.boxShadow = `0 24px 48px ${colors.primary}70`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(0) scale(1)'
                el.style.boxShadow = `0 12px 32px ${colors.primary}55`
              }}
            >
              {data.cta_text}
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {data.image_position === 'right' && (
          data.image_url
            ? <div className="rounded-3xl overflow-hidden shadow-2xl"><img src={data.image_url} alt="Hero" className="w-full h-96 object-cover" /></div>
            : <ImagePlaceholder />
        )}
      </div>
    </section>
  )
}
