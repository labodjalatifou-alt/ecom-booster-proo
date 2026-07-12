'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ReelItem {
  id: string
  type: 'image' | 'video' | 'gif'
  url: string
  caption?: string
  author?: string
}

interface ReelMediaProps {
  settings: any
}

const DEFAULT_ITEMS: ReelItem[] = [
  { id: '1', type: 'image', url: 'https://placehold.co/400x600/E8527A/white?text=Témoignage+1', caption: 'Produit incroyable !', author: 'Aminata' },
  { id: '2', type: 'image', url: 'https://placehold.co/400x600/10B981/white?text=Témoignage+2', caption: 'Livraison rapide', author: 'Moussa' },
  { id: '3', type: 'image', url: 'https://placehold.co/400x600/6366f1/white?text=Témoignage+3', caption: 'Je recommande', author: 'Fatou' },
  { id: '4', type: 'image', url: 'https://placehold.co/400x600/f59e0b/white?text=Témoignage+4', caption: 'Qualité au top', author: 'Ibrahim' },
]

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes('youtube.com/embed')
}

export default function ReelMediaRender({ settings }: ReelMediaProps) {
  const s = settings || {}
  const rawItems: ReelItem[] = s.items?.length ? s.items : DEFAULT_ITEMS
  const items = rawItems.filter((it: ReelItem) => it.url)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })

  const bgColor = s.bg_color || '#ffffff'
  const accent = s.accent_color || '#E8527A'

  const scrollBy = (dir: 1 | -1) => {
    if (!scrollRef.current) return
    const cardW = scrollRef.current.querySelector('div')?.clientWidth || 260
    scrollRef.current.scrollBy({ left: dir * (cardW + 12), behavior: 'smooth' })
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    dragStart.current = { x: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - dragStart.current.x) * 1.5
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - walk
  }

  const onMouseUp = () => setIsDragging(false)

  if (!items.length) return null

  return (
    <div className="w-full py-6 overflow-hidden select-none" style={{ background: bgColor }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            {s.title && (
              <h2 className="text-lg font-black tracking-tight" style={{ color: s.title_color || 'var(--color-text)' }}>
                {s.title}
              </h2>
            )}
            {s.subtitle && (
              <p className="text-xs mt-0.5" style={{ color: s.subtitle_color || 'var(--color-text-soft)' }}>{s.subtitle}</p>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={() => scrollBy(-1)} className="p-1.5 rounded-lg hover:bg-black/5 text-gray-500 transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={() => scrollBy(1)} className="p-1.5 rounded-lg hover:bg-black/5 text-gray-500 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[220px] sm:w-[260px] md:w-[280px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                {isVideoUrl(item.url) ? (
                  <video src={item.url} muted loop playsInline className="w-full h-full object-cover" controls />
                ) : (
                  <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" loading="lazy" />
                )}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-xs font-semibold leading-tight drop-shadow-sm">{item.caption}</p>
                  </div>
                )}
              </div>
              {item.author && (
                <div className="px-3 py-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: accent }}>
                    {item.author[0]}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 truncate">{item.author}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {s.show_counter !== false && items.length > 1 && (
          <div className="flex justify-center mt-3 gap-1">
            {items.map((_, idx) => (
              <span key={idx} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: idx === 0 ? accent : '#d1d5db' }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  )
}