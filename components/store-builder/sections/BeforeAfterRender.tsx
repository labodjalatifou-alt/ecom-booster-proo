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

  const beforeImg = s.before_image?.trim()
  const afterImg = s.after_image?.trim()

  return (
    <div 
      className="w-full py-8 @md:py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-4xl mx-auto">
        {s.title && (
          <h2 className="text-2xl @md:text-4xl font-black text-center mb-6 @md:mb-10 tracking-tight" style={{ color: 'var(--color-text)' }}>
            {s.title}
          </h2>
        )}

        <div 
          ref={ref}
          className="relative w-full aspect-square @md:aspect-video rounded-3xl overflow-hidden shadow-2xl cursor-ew-resize select-none touch-none"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleMove}
        >
          {/* After (Background) */}
          {afterImg ? (
            <img src={afterImg} alt="Après" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm pointer-events-none">Image « Après » — uploadez depuis le panneau</div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold shadow-sm pointer-events-none z-10">
            {s.after_label || 'APRÈS'}
          </div>

          {/* Before (Foreground) */}
          <div 
            className="absolute inset-0 h-full overflow-hidden border-r-4 border-white pointer-events-none z-20 shadow-[10px_0_15px_rgba(0,0,0,0.2)]"
            style={{ width: `${pos}%` }}
          >
            {beforeImg ? (
              <img
                src={beforeImg}
                alt="Avant"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: '100vw', maxWidth: ref.current?.offsetWidth || '1000px' }}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-xs px-4 text-center">Image « Avant »</div>
            )}
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
