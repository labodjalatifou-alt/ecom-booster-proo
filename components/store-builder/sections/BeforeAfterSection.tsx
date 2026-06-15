'use client'
import { useRef, useState } from 'react'
import type { BeforeAfterProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: BeforeAfterProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function BeforeAfterSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setPosition(pct)
  }

  const hasImages = props.before_image || props.after_image

  return (
    <div
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bg }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Avant / Après</span>}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {props.title && <h2 className="text-3xl font-bold text-center mb-8" style={{ color: colors.text }}>{props.title}</h2>}

        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl select-none"
          style={{ aspectRatio: '16/9', backgroundColor: colors.bgSection, cursor: 'ew-resize' }}
          onMouseMove={e => handleMove(e.clientX)}
          onTouchMove={e => handleMove(e.touches[0].clientX)}
        >
          {hasImages ? (
            <>
              {/* After (fond) */}
              <img src={props.after_image || props.before_image} alt="After" className="absolute inset-0 w-full h-full object-cover" />
              {/* Before (clip) */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
                <img src={props.before_image || props.after_image} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (position / 100)}%`, maxWidth: 'none' }} />
              </div>
              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-lg">{props.before_label || 'Avant'}</div>
              <div className="absolute top-4 right-4 bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-lg">{props.after_label || 'Après'}</div>
              {/* Handle */}
              <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 4l-4 6 4 6M14 4l4 6-4 6" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center" style={{ color: colors.textLight }}>
                <div className="text-5xl mb-4">🖼️</div>
                <p className="font-medium">Ajoutez vos images Avant/Après dans les paramètres</p>
              </div>
              {/* Simulation split */}
              <div className="absolute inset-0 grid grid-cols-2">
                <div className="flex items-center justify-center text-lg font-bold" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>{props.before_label || 'Avant'}</div>
                <div className="flex items-center justify-center text-lg font-bold" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>{props.after_label || 'Après'}</div>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-sm mt-3" style={{ color: colors.textLight }}>← Glissez pour comparer</p>
      </div>
    </div>
  )
}
