'use client'
import type { MarqueeProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: MarqueeProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function MarqueeSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const items = props.items || []
  const doubled = [...items, ...items, ...items]
  const duration = Math.max(10, 200 / Math.max(1, props.speed || 40))

  return (
    <>
      <style>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
        @keyframes marquee-right { from { transform: translateX(-33.33%); } to { transform: translateX(0); } }
        .marquee-track-left { animation: marquee-left ${duration}s linear infinite; }
        .marquee-track-right { animation: marquee-right ${duration}s linear infinite; }
        .marquee-track-left:hover, .marquee-track-right:hover { animation-play-state: paused; }
      `}</style>

      <div
        onClick={onClick}
        className={`overflow-hidden py-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ backgroundColor: props.bg_color || colors.bgSection }}
      >
        {isSelected && (
          <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Marquee</span>
        )}
        <div className={`flex whitespace-nowrap ${props.direction === 'right' ? 'marquee-track-right' : 'marquee-track-left'}`}>
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-8 text-sm font-semibold"
              style={{ color: props.text_color || colors.text }}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
              <span className="opacity-40">•</span>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
