'use client'
import { useEffect, useRef, useState } from 'react'
import type { PricingTableProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: PricingTableProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function PricingTableSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

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
      style={{ backgroundColor: props.bg_color || colors.bgSection }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Tableau de prix</span>}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.text }}>{props.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{
                backgroundColor: item.highlighted ? (props.accent_color || colors.primary) : '#fff',
                border: `2px solid ${item.highlighted ? (props.accent_color || colors.primary) : colors.border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? (item.highlighted ? 'scale(1.04)' : 'none') : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                boxShadow: item.highlighted ? `0 20px 60px ${props.accent_color || colors.primary}40` : undefined,
              }}
            >
              {item.highlighted && (
                <div className="text-center py-2 text-xs font-bold tracking-widest uppercase text-white/80 bg-black/10">
                  ⭐ Plus populaire
                </div>
              )}
              <div className="p-8">
                <h3 className="font-bold text-xl mb-2" style={{ color: item.highlighted ? '#fff' : colors.text }}>{item.name}</h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black" style={{ color: item.highlighted ? '#fff' : (props.accent_color || colors.primary) }}>
                    {item.price}
                  </span>
                  <span className="text-sm mb-1" style={{ color: item.highlighted ? 'rgba(255,255,255,0.7)' : colors.textLight }}>{item.period}</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8">
                  {(item.features || []).map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm">
                      <span style={{ color: item.highlighted ? '#fff' : colors.success }}>✓</span>
                      <span style={{ color: item.highlighted ? 'rgba(255,255,255,0.85)' : colors.text }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: item.highlighted ? '#fff' : (props.accent_color || colors.primary),
                    color: item.highlighted ? (props.accent_color || colors.primary) : '#fff',
                  }}
                >
                  {item.cta_text || 'Choisir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
