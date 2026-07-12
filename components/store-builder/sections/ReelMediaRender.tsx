'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

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
  { id: '1', type: 'image', url: 'https://placehold.co/400x600/E8527A/white?text=Client+1', caption: 'Résultat après 2 semaines ✨', author: 'Aminata' },
  { id: '2', type: 'image', url: 'https://placehold.co/400x600/10B981/white?text=Client+2', caption: 'Livraison rapide ! 🚚', author: 'Moussa' },
  { id: '3', type: 'image', url: 'https://placehold.co/400x600/6366f1/white?text=Client+3', caption: 'Mes enfants adorent 💛', author: 'Fatou' },
  { id: '4', type: 'image', url: 'https://placehold.co/400x600/f59e0b/white?text=Client+4', caption: 'Je recommande à 100%', author: 'Ibrahim' },
  { id: '5', type: 'image', url: 'https://placehold.co/400x600/8b5cf6/white?text=Client+5', caption: 'Meilleur achat de l\'année', author: 'Kadiatou' },
  { id: '6', type: 'image', url: 'https://placehold.co/400x600/ec4899/white?text=Client+6', caption: 'Exactly what I needed', author: 'Ousmane' },
]

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || /youtube\.com\/embed/i.test(url)
}

function isGifUrl(url: string) {
  return /\.gif(\?|$)/i.test(url)
}

export default function ReelMediaRender({ settings }: ReelMediaProps) {
  const s = settings || {}
  const items: ReelItem[] = (s.items || DEFAULT_ITEMS).filter((it: ReelItem) => it.url)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const scrollSpeed = s.speed ?? 40 // px per second
  const autoPlay = s.auto_play !== false
  const bgColor = s.bg_color || 'var(--color-bg)'
  const accent = s.accent_color || '#E8527A'

  useEffect(() => {
    if (!autoPlay || isPaused || !scrollRef.current) return
    const el = scrollRef.current
    let rafId: number
    let lastTime = performance.now()

    const step = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now
      el.scrollLeft += scrollSpeed * dt * 0.3
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        el.scrollLeft = 0
      }
      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [autoPlay, isPaused, scrollSpeed])

  const scrollBy = (dir: 1 | -1) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <div className="w-full py-6 overflow-hidden select-none" style={{ background: bgColor }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
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
          <div className="flex items-center gap-2">
            {autoPlay && (
              <button
                onClick={() => setIsPaused(p => !p)}
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                title={isPaused ? 'Reprendre' : 'Pause'}
              >
                {isPaused ? <Play size={16} className="text-gray-500" /> : <Pause size={16} className="text-gray-500" />}
              </button>
            )}
            <div className="flex gap-1">
              <button onClick={() => scrollBy(-1)} className="p-1.5 rounded-lg hover:bg-black/5 text-gray-500 transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={() => scrollBy(1)} className="p-1.5 rounded-lg hover:bg-black/5 text-gray-500 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        {/* Reel container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {items.map((item, idx) => {
            const isVideo = isVideoUrl(item.url)
            const isGif = isGifUrl(item.url)
            return (
              <div
                key={item.id}
                className="flex-shrink-0 w-[220px] sm:w-[260px] md:w-[280px] rounded-2xl overflow-hidden relative group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#ffffff' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Media */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  {isVideo ? (
                    <video
                      src={item.url}
                      muted
                      loop
                      autoPlay={hoveredIndex === idx}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || ''}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  {isGif && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">GIF</span>
                  )}

                  {/* Hover play indicator for video */}
                  {isVideo && hoveredIndex !== idx && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={32} className="text-white drop-shadow-lg" fill="white" />
                    </div>
                  )}

                  {/* Caption overlay bottom */}
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs font-semibold leading-tight drop-shadow-sm">{item.caption}</p>
                    </div>
                  )}
                </div>

                {/* Author */}
                {item.author && (
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: accent }}
                    >
                      {item.author[0]}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600 truncate">{item.author}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Compteur */}
        {s.show_counter !== false && (
          <div className="flex justify-center mt-3 gap-1">
            {items.slice(0, Math.min(items.length, 12)).map((_, idx) => (
              <span
                key={idx}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: idx === 0 ? accent : '#d1d5db' }}
              />
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