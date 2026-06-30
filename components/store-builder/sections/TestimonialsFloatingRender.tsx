'use client'

import type { CSSProperties } from 'react'
import { Star, BadgeCheck } from 'lucide-react'

const TILTS = [-3.5, 2.8, -2.1, 3.2, -1.8, 2.4, -2.9, 1.7]
/** Positions desktop — 3 cartes éparpillées, pas alignées */
const DESKTOP_LAYOUT = [
  { left: '2%', top: 20, width: '30%' },
  { left: '34%', top: 55, width: '30%' },
  { left: '66%', top: 8, width: '30%' },
]

function resolveImageUrl(raw?: string): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
    return trimmed
  }
  return null
}

function TestimonialCard({
  item,
  i,
  s,
  className = '',
  style = {},
}: {
  item: any
  i: number
  s: any
  className?: string
  style?: CSSProperties
}) {
  const avatarUrl = resolveImageUrl(item.image)
  const productImgUrl = resolveImageUrl(item.product_image)
  const tilt = TILTS[i % TILTS.length]
  const anim = s.animation || 'float'

  return (
    <div
      className={`testimonial-leaf bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col transition-transform duration-300 hover:scale-[1.03] hover:rotate-0 hover:z-20 ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        boxShadow: `4px 8px 24px ${s.shadow_color || 'rgba(0,0,0,0.08)'}`,
        animation: anim === 'none' ? 'none' : undefined,
        ['--tilt' as string]: `${tilt}deg`,
        ['--i' as string]: i,
        ...style,
      }}
      data-anim={anim}
    >
      {productImgUrl && (
        <img
          src={productImgUrl}
          alt=""
          className="w-full rounded-xl mb-3 object-contain bg-gray-50"
          style={{ maxHeight: 200, minHeight: 80 }}
        />
      )}
      <div className="flex gap-0.5 mb-2" style={{ color: s.accent_color || '#facc15' }}>
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} size={13} fill={j < (item.rating || 5) ? 'currentColor' : 'none'} className={j < (item.rating || 5) ? '' : 'text-gray-200'} />
        ))}
      </div>
      <p className="text-[13px] leading-snug text-gray-600 flex-1 mb-3">&ldquo;{item.text}&rdquo;</p>
      <div className="flex items-center gap-2.5 pt-2 border-t border-gray-50 mt-auto">
        {avatarUrl ? (
          <img src={avatarUrl} alt={item.name || ''} className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm" />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: `${s.accent_color || '#6366f1'}22`, color: s.accent_color || '#6366f1' }}>
            {item.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 text-xs truncate">{item.name || 'Client'}</span>
            {item.verified !== false && <BadgeCheck size={12} className="text-blue-500 flex-shrink-0" />}
          </div>
          {item.location && <span className="text-[10px] text-gray-400 truncate block">📍 {item.location}</span>}
        </div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${s.accent_color || '#6366f1'}18`, color: s.accent_color || '#6366f1' }}>
          {item.rating || 5}★
        </span>
      </div>
    </div>
  )
}

export default function TestimonialsFloatingRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || []

  if (!items.length) {
    return (
      <div className="w-full py-12 px-4 text-center text-gray-400 text-sm">
        Ajoutez des témoignages depuis le panneau de droite.
      </div>
    )
  }

  const desktopItems = items.slice(0, Math.max(3, items.length))

  return (
    <div className="w-full py-12 px-4 overflow-hidden" style={{ backgroundColor: s.bg_color || '#fafafa' }}>
      {s.title && (
        <h2 className="text-xl md:text-2xl font-extrabold text-center mb-10 px-4" style={{ color: s.title_color || '#111827' }}>
          {s.title}
        </h2>
      )}

      {/* Desktop : 3 cartes éparpillées, positions différentes */}
      <div className="hidden md:block relative max-w-4xl mx-auto" style={{ minHeight: 340 }}>
        {desktopItems.slice(0, 3).map((item: any, i: number) => {
          const layout = DESKTOP_LAYOUT[i % 3]
          return (
            <div key={item.id || i} className="absolute" style={{ left: layout.left, top: layout.top, width: layout.width, zIndex: i + 1 }}>
              <TestimonialCard item={item} i={i} s={s} />
            </div>
          )
        })}
        {/* Cartes supplémentaires en dessous, toujours éparpillées */}
        {items.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-6 pt-4">
            {items.slice(3).map((item: any, i: number) => (
              <div key={item.id || i + 3} style={{ width: '28%', marginTop: (i % 2) * 16 }}>
                <TestimonialCard item={item} i={i + 3} s={s} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile : colonne simple */}
      <div className="md:hidden max-w-sm mx-auto flex flex-col gap-5">
        {items.map((item: any, i: number) => (
          <TestimonialCard key={item.id || i} item={item} i={i} s={s} style={{ transform: `rotate(${TILTS[i % TILTS.length] * 0.6}deg)` }} />
        ))}
      </div>

      <style>{`
        @keyframes leafFloat {
          0%, 100% { transform: rotate(var(--tilt, 0deg)) translateY(0); }
          50% { transform: rotate(calc(var(--tilt, 0deg) * 0.5)) translateY(-6px); }
        }
        @keyframes leafSway {
          0%, 100% { transform: rotate(var(--tilt, 0deg)) translateX(0); }
          33% { transform: rotate(calc(var(--tilt, 0deg) + 1deg)) translateX(3px); }
          66% { transform: rotate(calc(var(--tilt, 0deg) - 1deg)) translateX(-3px); }
        }
        .testimonial-leaf[data-anim="float"] { animation: leafFloat 5s ease-in-out infinite; animation-delay: calc(var(--i, 0) * 0.35s); }
        .testimonial-leaf[data-anim="sway"] { animation: leafSway 4s ease-in-out infinite; animation-delay: calc(var(--i, 0) * 0.35s); }
        .testimonial-leaf:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
}
