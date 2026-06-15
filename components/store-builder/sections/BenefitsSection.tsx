'use client'
import { useEffect, useRef, useState } from 'react'
import type { BenefitsProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: BenefitsProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function BenefitsSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const items = props.items || []
  const isGrid = props.layout === 'grid' || props.layout === 'cards'
  const isNumbered = props.layout === 'numbered'

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bgSection }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Avantages</span>}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: colors.text }}>{props.title}</h2>
          {props.subtitle && <p className="text-lg" style={{ color: colors.textLight }}>{props.subtitle}</p>}
        </div>

        <div className={`${isGrid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-wrap gap-6 justify-center'}`}>
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex ${isGrid ? 'flex-col items-center text-center' : 'flex-row items-start'} gap-4 ${props.layout === 'cards' ? 'bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow' : ''}`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                ...(props.layout === 'cards' ? { borderColor: colors.border } : {}),
              }}
            >
              {/* Icône */}
              <div
                className="flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: props.icon_style === 'square' ? 12 : '50%',
                  backgroundColor: `${item.color || colors.primary}20`,
                }}
              >
                {isNumbered ? (
                  <span className="font-black text-xl" style={{ color: item.color || colors.primary }}>{i + 1}</span>
                ) : (
                  <span>{item.icon}</span>
                )}
              </div>

              <div className={`${isGrid ? 'text-center' : ''}`}>
                <h3 className="font-bold text-lg mb-1" style={{ color: colors.text }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.textLight }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
