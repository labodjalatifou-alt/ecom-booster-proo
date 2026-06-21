'use client'

import { useState, useRef, useEffect } from 'react'

export default function BeforeAfterRender({ settings }: { settings: Record<string, any> }) {
  const title = settings.title ?? 'La différence'
  const beforeLabel = settings.before_label ?? 'Avant'
  const afterLabel = settings.after_label ?? 'Après'
  const bgColor = settings.bg_color ?? '#ffffff'
  const beforeImage = settings.before_image
  const afterImage = settings.after_image

  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percentage)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX)
  }
  const onTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX)
  }
  const onMouseUp = () => setIsDragging(false)

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [isDragging])

  return (
    <div className="w-full py-8 px-4 rounded-xl" style={{ backgroundColor: bgColor }}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
      )}
      
      <div 
        ref={containerRef}
        className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden cursor-ew-resize select-none bg-gray-200"
        onMouseDown={(e) => {
          setIsDragging(true)
          handleMove(e.clientX)
        }}
        onTouchStart={(e) => {
          setIsDragging(true)
          if(e.touches[0]) handleMove(e.touches[0].clientX)
        }}
      >
        {/* AFTER Image (Background) */}
        {afterImage ? (
          <img src={afterImage} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-blue-100 flex items-center justify-end pr-8">
            <span className="text-blue-500 font-bold opacity-50 text-2xl uppercase">Après</span>
          </div>
        )}

        {/* BEFORE Image (Foreground clipped) */}
        <div 
          className="absolute inset-0 top-0 left-0 h-full overflow-hidden border-r-2 border-white"
          style={{ width: \`\${position}%\` }}
        >
          {beforeImage ? (
            <img src={beforeImage} alt={beforeLabel} className="absolute inset-0 w-[100vw] max-w-[none] h-full object-cover" 
              style={{ width: containerRef.current?.offsetWidth || '100%' }} draggable={false} />
          ) : (
            <div className="absolute inset-0 h-full bg-gray-300 flex items-center pl-8"
              style={{ width: containerRef.current?.offsetWidth || '100%' }}>
              <span className="text-gray-500 font-bold opacity-50 text-2xl uppercase">Avant</span>
            </div>
          )}
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider z-10 pointer-events-none">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider z-10 pointer-events-none">
          {afterLabel}
        </div>

        {/* Handle */}
        <div 
          className="absolute top-0 bottom-0 flex items-center justify-center z-20 pointer-events-none"
          style={{ left: \`\${position}%\`, transform: 'translateX(-50%)' }}
        >
          <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-0.5 h-3 bg-gray-400 rounded-full"></div>
              <div className="w-0.5 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
