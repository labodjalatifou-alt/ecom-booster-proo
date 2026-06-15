'use client'
import { useEffect, useRef, useState } from 'react'
import type { ImageWithTextProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: ImageWithTextProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function ImageWithTextSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const imgOnLeft = props.image_position !== 'right'
  const imgRadius = props.image_style === 'circle' ? '50%' : props.image_style === 'rounded' ? '24px' : '0'

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bg, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'opacity 0.7s, transform 0.7s' }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Image + Texte</span>}

      <div
        className="flex flex-col md:flex-row items-center gap-12"
        style={{ maxWidth: 1100, margin: '0 auto', flexDirection: imgOnLeft ? 'row' : 'row-reverse' }}
      >
        {/* Image */}
        <div className="flex-1 w-full" style={{ maxWidth: 480 }}>
          {props.image_url ? (
            <img
              src={props.image_url}
              alt={props.title}
              className="w-full object-cover shadow-xl hover:scale-105 transition-transform duration-500"
              style={{ borderRadius: imgRadius, aspectRatio: props.image_style === 'circle' ? '1/1' : '4/3' }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{ borderRadius: imgRadius, aspectRatio: '4/3', backgroundColor: colors.bgSection, border: `2px dashed ${colors.border}` }}
            >
              <span style={{ color: colors.textLight }}>🖼️ Image ici</span>
            </div>
          )}
        </div>

        {/* Texte */}
        <div className="flex-1 flex flex-col gap-5">
          {props.subtitle && (
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: colors.primary }}>{props.subtitle}</span>
          )}
          <h2 className="text-3xl font-bold leading-tight" style={{ color: props.text_color || colors.text }}>{props.title}</h2>
          <p className="text-base leading-relaxed" style={{ color: props.text_color ? `${props.text_color}99` : colors.textLight }}>{props.text}</p>
          {props.cta_text && (
            <a
              href={props.cta_link || '#'}
              className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-4"
              style={{ color: colors.primary }}
            >
              {props.cta_text} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
