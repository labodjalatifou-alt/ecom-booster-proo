'use client'
import { useEffect, useRef, useState } from 'react'
import type { IconGridProps, StoreColors } from '@/lib/store-builder/types'

// Icônes SVG inline légères
const icons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Truck: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Shield: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Headphones: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  ),
  Star: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Gift: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  Zap: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Heart: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Check: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
}

interface Props {
  props: IconGridProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function IconGridSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const items = props.items || []
  const cols = props.columns || 3
  const colsClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bg }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Grille d'icônes</span>}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {props.title && <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.text }}>{props.title}</h2>}
        <div className={`grid ${colsClass} gap-6`}>
          {items.map((item, i) => {
            const Icon = icons[item.icon] || icons['Star']
            return (
              <div
                key={item.id}
                className={`flex flex-col items-center text-center gap-4 p-6 transition-all group ${
                  props.card_style === 'card' ? 'bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1' :
                  props.card_style === 'bordered' ? 'rounded-2xl border-2 hover:border-current hover:-translate-y-1' :
                  'hover:-translate-y-1'
                }`}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? (props.card_style !== 'minimal' ? 'translateY(0)' : undefined) : 'translateY(20px)',
                  transition: `opacity 0.4s ease ${i * 0.08}s, transform 0.4s ease ${i * 0.08}s`,
                  ...(props.card_style === 'bordered' ? { borderColor: colors.border } : {}),
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group-hover:scale-110"
                  style={{ backgroundColor: `${props.icon_color || colors.primary}15`, transition: 'all 0.2s' }}
                >
                  <Icon size={28} color={props.icon_color || colors.primary} />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: colors.text }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: colors.textLight }}>{item.text}</p>
                </div>
                {item.link && item.link !== '#' && (
                  <a href={item.link} className="text-sm font-semibold transition-all hover:gap-3 flex items-center gap-1" style={{ color: props.icon_color || colors.primary }}>
                    En savoir plus →
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
