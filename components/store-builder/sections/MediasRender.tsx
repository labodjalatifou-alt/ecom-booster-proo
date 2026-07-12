'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ImageIcon, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'

interface MediasRenderProps {
  settings: any
  enableTilt?: boolean
}

export default function MediasRender({ settings, enableTilt = true }: MediasRenderProps) {
  const images: string[] = settings?.images?.length ? settings.images : []
  const [active, setActive] = useState(0)

  // 3D Tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isTilting, setIsTilting] = useState(false)
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const imgRef = useRef<HTMLDivElement>(null)

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const lbRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTilt({ x: (y - 0.5) * -40, y: (x - 0.5) * 40 })
    setGlare({ x: x * 100, y: y * 100 })
    setIsTilting(true)
  }, [enableTilt])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50 })
    setIsTilting(false)
  }, [])

  const tiltStyle = enableTilt ? {
    transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isTilting ? 1.1 : 1}, ${isTilting ? 1.1 : 1}, ${isTilting ? 1.1 : 1})`,
    transition: isTilting
      ? 'transform 0.05s ease-out, box-shadow 0.05s ease-out'
      : 'transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.7s cubic-bezier(0.22,1,0.36,1)',
    willChange: 'transform',
    boxShadow: isTilting
      ? `${tilt.y * -1.2}px ${tilt.x * 1.2}px 50px rgba(0,0,0,0.35), 0 30px 80px rgba(0,0,0,0.25)`
      : '0 4px 16px rgba(0,0,0,0.08)',
  } : {}

  const prevImage = () => setActive(i => (i - 1 + images.length) % images.length)
  const nextImage = () => setActive(i => (i + 1) % images.length)

  // Lightbox keyboard nav
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }) }
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  // Lightbox mouse wheel zoom
  useEffect(() => {
    if (!lightboxOpen) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.2 : 0.2
      setZoom(z => Math.max(1, Math.min(5, z + delta)))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [lightboxOpen])

  // Lightbox mouse pan
  const handleLbMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }
  const handleLbMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }
  const handleLbMouseUp = () => setIsPanning(false)

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <ImageIcon size={48} className="mb-2 opacity-50" />
        <span className="text-sm font-medium">Aucune image produit</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main Image */}
        <div
          ref={imgRef}
          className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group cursor-zoom-in"
          style={{ transformStyle: 'preserve-3d', ...tiltStyle }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => { setLightboxOpen(true); setZoom(1); setPan({ x: 0, y: 0 }) }}
        >
          <img
            src={images[active]}
            alt={`Product ${active}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ pointerEvents: 'none' }}
          />
          {/* Zoom hint */}
          <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={14} className="text-white" />
          </div>
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
                onClick={(e) => { e.stopPropagation(); prevImage() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage() }}
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
                  onClick={(e) => { e.stopPropagation(); setActive(i) }}
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

      {/* Lightbox overlay */}
      {lightboxOpen && (
        <div
          ref={lbRef}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          style={{ cursor: isPanning ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
          onMouseDown={handleLbMouseDown}
          onMouseMove={handleLbMouseMove}
          onMouseUp={handleLbMouseUp}
          onMouseLeave={handleLbMouseUp}
        >
          {/* Close */}
          <button
            onClick={() => { setLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }) }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 rounded-full px-4 py-2 z-10">
            <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="text-white/80 hover:text-white p-1"><ZoomOut size={18} /></button>
            <span className="text-white/60 text-xs min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="text-white/80 hover:text-white p-1"><ZoomIn size={18} /></button>
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 text-white/60 text-sm z-10">
              {active + 1} / {images.length}
            </div>
          )}

          {/* Prev/Next arrows */}
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); setPan({ x: 0, y: 0 }) }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10">
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); setPan({ x: 0, y: 0 }) }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10">
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={images[active]}
            alt={`Product ${active} fullscreen`}
            className="max-w-[90vw] max-h-[90vh] object-contain select-none transition-transform duration-100"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
            }}
            draggable={false}
          />
        </div>
      )}
    </>
  )
}