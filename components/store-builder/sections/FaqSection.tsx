'use client'
import { useEffect, useRef, useState } from 'react'
import type { FaqProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: FaqProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function FaqSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const items = props.items || []

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bg, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'opacity 0.6s, transform 0.6s' }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">FAQ</span>}
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: colors.text }}>{props.title}</h2>
          {props.subtitle && <p style={{ color: colors.textLight }}>{props.subtitle}</p>}
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  border: props.style !== 'minimal' ? `1px solid ${isOpen ? props.accent_color || colors.primary : colors.border}` : 'none',
                  borderBottom: props.style === 'minimal' ? `1px solid ${colors.border}` : undefined,
                  transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={e => { e.stopPropagation(); setOpenId(isOpen ? null : item.id) }}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  style={{ backgroundColor: isOpen ? `${props.accent_color || colors.primary}08` : 'transparent' }}
                >
                  <span className="font-semibold pr-4" style={{ color: isOpen ? (props.accent_color || colors.primary) : colors.text }}>
                    {item.question}
                  </span>
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-transform"
                    style={{
                      backgroundColor: isOpen ? (props.accent_color || colors.primary) : colors.bgSection,
                      color: isOpen ? '#fff' : colors.textLight,
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                    }}
                  >
                    +
                  </span>
                </button>
                <div style={{
                  maxHeight: isOpen ? 400 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease',
                }}>
                  <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: colors.textLight }}>{item.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
