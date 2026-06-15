'use client'
import { useEffect, useRef, useState } from 'react'
import type { AnnouncementBarProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: AnnouncementBarProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function AnnouncementBarSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [closed, setClosed] = useState(false)
  const [offset, setOffset] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>()

  useEffect(() => {
    if (!trackRef.current) return
    const speed = Math.max(10, props.speed || 30)
    let pos = 0
    const animate = () => {
      pos -= 0.5 * (speed / 30)
      const trackW = trackRef.current?.scrollWidth ?? 0
      const half = trackW / 2
      if (Math.abs(pos) >= half) pos = 0
      setOffset(pos)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [props.speed])

  if (closed) return null

  const style = {
    backgroundColor: props.bg_color || colors.primary,
    color: props.text_color || '#ffffff',
  }

  const items = [...(props.messages || []), ...(props.messages || [])]

  return (
    <div
      style={style}
      onClick={onClick}
      className={[
        'relative overflow-hidden py-2 select-none',
        isEditing ? 'cursor-pointer hover:opacity-90' : '',
        isSelected ? 'ring-2 ring-blue-500' : '',
      ].join(' ')}
    >
      {isSelected && (
        <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">
          Bandeau annonce
        </span>
      )}

      <div
        ref={trackRef}
        style={{ transform: `translateX(${offset}px)`, display: 'flex', whiteSpace: 'nowrap' }}
      >
        {items.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm font-medium">
            <span>⭐</span>
            <span>{msg}</span>
          </span>
        ))}
      </div>

      {props.show_close && (
        <button
          onClick={e => { e.stopPropagation(); setClosed(true) }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      )}
    </div>
  )
}
