'use client'
import { useEffect, useRef, useState } from 'react'
import type { GuaranteesProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: GuaranteesProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function GuaranteesSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const items = props.items || []
  const isRow = props.layout === 'row'

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-12 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bgSection }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Garanties</span>}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {props.title && (
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: colors.text }}>{props.title}</h2>
        )}
        <div className={`${isRow ? 'flex flex-wrap justify-center gap-6' : 'grid grid-cols-2 md:grid-cols-4 gap-6'}`}>
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 transition-all ${
                props.style === 'cards' ? 'bg-white rounded-2xl p-5 shadow-sm hover:shadow-md' :
                props.style === 'bordered' ? 'rounded-2xl p-5 border-2' :
                'p-4'
              }`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(16px)',
                transition: `opacity 0.4s ease ${i * 0.1}s, transform 0.4s ease ${i * 0.1}s`,
                ...(props.style === 'bordered' ? { borderColor: props.icon_color || colors.primary } : {}),
              }}
            >
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="font-bold text-sm" style={{ color: colors.text }}>{item.title}</div>
                <div className="text-xs mt-0.5" style={{ color: colors.textLight }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
