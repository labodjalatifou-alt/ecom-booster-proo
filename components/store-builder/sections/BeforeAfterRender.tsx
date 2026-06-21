'use client'
import { useState, useRef, useEffect } from 'react'

export default function BeforeAfterRender({ settings }: { settings: any }) {
  const s = settings || {}
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (e: any) => {
    if (!isDragging || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    let x = ((clientX - rect.left) / rect.width) * 100
    x = Math.max(0, Math.min(x, 100))
    setPos(x)
  }

  const defaultBefore = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&grayscale'
  const defaultAfter = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80'

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-4xl mx-auto">
        {s.title && (
          <h2 className="text-3xl md:text-4xl font-black text-center mb-10 tracking-tight" style={{ color: 'var(--color-text)' }}>
            {s.title}
          </h2>
        )}

        <div 
          ref={ref}
          className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl cursor-ew-resize select-none touch-none"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleMove}
        >
          {/* After (Background) */}
          <img 
            src={s.after_image || defaultAfter} 
            alt="Après" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold shadow-sm pointer-events-none z-10">
            {s.after_label || 'APRÈS'}
          </div>

          {/* Before (Foreground) */}
          <div 
            className="absolute inset-0 h-full overflow-hidden border-r-4 border-white pointer-events-none z-20 shadow-[10px_0_15px_rgba(0,0,0,0.2)]"
            style={{ width: `${pos}%` }}
          >
            <img 
              src={s.before_image || defaultBefore} 
              alt="Avant" 
              className="absolute inset-0 w-full h-full object-cover" 
              style={{ width: '100vw', maxWidth: ref.current?.offsetWidth || '1000px' }}
            />
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              {s.before_label || 'AVANT'}
            </div>
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl z-30 pointer-events-none"
            style={{ left: `${pos}%` }}
          >
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-gray-300 rounded-full" />
              <div className="w-1 h-3 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
