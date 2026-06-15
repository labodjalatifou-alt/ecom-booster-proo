'use client'
import { useEffect, useRef, useState } from 'react'
import type { TextBlockProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: TextBlockProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function TextBlockSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const alignClass = props.text_align === 'center' ? 'text-center' : props.text_align === 'right' ? 'text-right' : 'text-left'

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-12 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor: props.bg_color || colors.bg,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.6s, transform 0.6s',
      }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Bloc texte</span>}
      <div style={{ maxWidth: props.max_width || 720, margin: '0 auto' }} className={alignClass}>
        {props.show_divider && (
          <div className="mb-8 flex justify-center">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: colors.primary }} />
          </div>
        )}
        {props.title && (
          <h2 className="text-3xl font-bold mb-6" style={{ color: props.text_color || colors.text }}>{props.title}</h2>
        )}
        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: props.text_color || colors.text }}>
          {props.content}
        </p>
        {props.show_divider && (
          <div className="mt-8 flex justify-center">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: colors.primary }} />
          </div>
        )}
      </div>
    </div>
  )
}
