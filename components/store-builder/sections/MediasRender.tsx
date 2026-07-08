'use client'

import { useState, useRef, useCallback } from 'react'
import { ImageIcon } from 'lucide-react'

interface MediasRenderProps {
  settings: any
  enableTilt?: boolean
}

export default function MediasRender({ settings, enableTilt = false }: MediasRenderProps) {
  const images: string[] = settings?.images?.length ? settings.images : []
  const [active, setActive] = useState(0)

  // 3D Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isTilting, setIsTilting] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  // 0..1
    const y = (e.clientY - rect.top) / rect.height   // 0..1
    // rotateY: positif quand souris à droite, négatif à gauche
    // rotateX: positif quand souris en bas, négatif en haut
    setTilt({ x: (y - 0.5) * -14, y: (x - 0.5) * 14 })
    setIsTilting(true)
  }, [enableTilt])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setIsTilting(false)
  }, [])

  const tiltStyle = enableTilt ? {
    transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isTilting ? 1.025 : 1})`,
    transition: isTilting
      ? 'transform 0.08s ease-out'
      : 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
    willChange: 'transform',
  } : {}

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
      {/* Image Principale — avec effet 3D tilt */}
      <div
        ref={imgRef}
        className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
        style={{ ...tiltStyle }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={images[active]}
          alt={`Product ${active}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* Miniatures (Desktop) & Carousel (Mobile) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden snap-center transition-all ${
                active === idx ? 'ring-2 ring-black ring-offset-2' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
