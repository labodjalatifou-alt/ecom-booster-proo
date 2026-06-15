'use client'
import { useEffect, useRef, useState } from 'react'
import type { ComparisonTableProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: ComparisonTableProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function ComparisonTableSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const rows = props.rows || []

  const renderVal = (val: boolean | string) => {
    if (val === true) return <span className="text-2xl">✅</span>
    if (val === false) return <span className="text-2xl text-red-400">❌</span>
    return <span className="font-medium text-sm">{val}</span>
  }

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bgSection, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'opacity 0.6s, transform 0.6s' }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Comparaison</span>}
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: colors.text }}>{props.title}</h2>

        <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: colors.border }}>
          {/* Header */}
          <div className="grid grid-cols-3 text-sm font-bold">
            <div className="px-6 py-4 bg-white" style={{ color: colors.textLight }}>Fonctionnalité</div>
            <div className="px-6 py-4 text-center text-white" style={{ backgroundColor: props.accent_color || colors.primary }}>
              {props.our_label || 'Nous'}
            </div>
            <div className="px-6 py-4 text-center bg-gray-100" style={{ color: colors.textLight }}>
              {props.competitor_label || 'Concurrents'}
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 border-t items-center"
              style={{ borderColor: colors.border, backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}
            >
              <div className="px-6 py-4 text-sm font-medium" style={{ color: colors.text }}>{row.feature}</div>
              <div className="px-6 py-4 flex justify-center">{renderVal(row.us)}</div>
              <div className="px-6 py-4 flex justify-center">{renderVal(row.them)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
