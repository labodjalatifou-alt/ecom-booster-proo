'use client'

import { useState, useRef, useCallback } from 'react'
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface MediasRenderProps {
  settings: any
  enableTilt?: boolean
}

export default function MediasRender({ settings, enableTilt = true }: MediasRenderProps) {
  const images: string[] = settings?.images?.length ? settings.images : []
  const [active, setActive] = useState(0)

  // 3D Tilt state — intensified
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isTilting, setIsTilting] = useState(false)
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const imgRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  // 0..1
    const y = (e.clientY - rect.top) / rect.height   // 0..1
    // Intensified tilt: ±22 degrees
    setTilt({ x: (y - 0.5) * -28, y: (x - 0.5) * 28 })
    setGlare({ x: x * 100, y: y * 100 })
    setIsTilting(true)
  }, [enableTilt])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50 })
    setIsTilting(false)
  }, [])

  const tiltStyle = enableTilt ? {
    transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isTilting ? 1.05 : 1}, ${isTilting ? 1.05 : 1}, ${isTilting ? 1.05 : 1})`,
    transition: isTilting
      ? 'transform 0.05s ease-out, box-shadow 0.05s ease-out'
      : 'transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.7s cubic-bezier(0.22,1,0.36,1)',
    willChange: 'transform',
    boxShadow: isTilting
      ? `${tilt.y * -0.8}px ${tilt.x * 0.8}px 40px rgba(0,0,0,0.25), 0 20px 60px rgba(0,0,0,0.15)`
      : '0 4px 16px rgba(0,0,0,0.08)',
  } : {}

  const prevImage = () => setActive(i => (i - 1 + images.length) % images.length)
  const nextImage = () => setActive(i => (i + 1) % images.length)

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <ImageIcon size={48} className="mb-2 opacity-50" />
        <span className="text-sm font-medium">Aucune image produit</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Image Principale — with intensified 3D tilt + glare */}
      <div
        ref={imgRef}
        className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group"
        style={{ transformStyle: 'preserve-3d', ...tiltStyle }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={images[active]}
          alt={`Product ${active}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ pointerEvents: 'none' }}
        />
        {/* Glare overlay */}
        {enableTilt && isTilting && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        {/* Dot indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-white' : 'bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar snap-x snap-mandatory">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden snap-center transition-all duration-200 ${
                active === idx
                  ? 'ring-2 ring-offset-1 opacity-100'
                  : 'opacity-60 hover:opacity-90'
              }`}
              style={active === idx ? { '--tw-ring-color': 'var(--color-primary, #6366f1)' } as React.CSSProperties : {}}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
