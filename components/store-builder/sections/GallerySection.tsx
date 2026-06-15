'use client'
import { useEffect, useRef, useState } from 'react'
import type { GalleryProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: GalleryProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function GallerySection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const images = props.images || []
  const cols = props.columns || 3
  const gap = props.gap || 12
  const radius = props.border_radius || 12

  const placeholder = Array.from({ length: 6 }).map((_, i) => `https://picsum.photos/seed/${i + 10}/400/300`)
  const displayImages = images.length ? images : (isEditing ? placeholder : [])

  return (
    <>
      <div
        ref={ref}
        onClick={onClick}
        className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ backgroundColor: colors.bg }}
      >
        {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Galerie</span>}
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {props.title && (
            <h2 className="text-3xl font-bold text-center mb-10" style={{ color: colors.text }}>{props.title}</h2>
          )}

          {props.layout === 'carousel' ? (
            <CarouselGallery images={displayImages} radius={radius} colors={colors} />
          ) : props.layout === 'masonry' ? (
            <MasonryGallery images={displayImages} cols={cols} gap={gap} radius={radius} onOpen={props.show_lightbox ? setLightbox : undefined} visible={visible} />
          ) : (
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}
            >
              {displayImages.map((img, i) => (
                <div
                  key={i}
                  className="overflow-hidden group"
                  style={{
                    borderRadius: radius,
                    aspectRatio: '4/3',
                    cursor: props.show_lightbox ? 'pointer' : 'default',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'scale(0.95)',
                    transition: `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`,
                  }}
                  onClick={(e) => { e.stopPropagation(); if (props.show_lightbox) setLightbox(img) }}
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          )}

          {!displayImages.length && (
            <div className="flex items-center justify-center h-48 rounded-2xl border-2 border-dashed" style={{ borderColor: colors.border }}>
              <p className="text-sm" style={{ color: colors.textLight }}>Ajoutez des images dans les paramètres</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Lightbox" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" />
          <button className="absolute top-6 right-6 text-white text-3xl font-light" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </>
  )
}

function CarouselGallery({ images, radius, colors }: any) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % images.length), 3500)
    return () => clearInterval(id)
  }, [images.length])
  if (!images.length) return null
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 480 }}>
      <img src={images[idx]} alt="" className="w-full h-full object-cover transition-opacity duration-500" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_: any, i: number) => (
          <button key={i} onClick={() => setIdx(i)} className="w-2.5 h-2.5 rounded-full transition-all"
            style={{ backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.5)' }} />
        ))}
      </div>
    </div>
  )
}

function MasonryGallery({ images, cols, gap, radius, onOpen, visible }: any) {
  const columns: string[][] = Array.from({ length: cols }, () => [])
  images.forEach((img: string, i: number) => columns[i % cols].push(img))
  return (
    <div className="flex" style={{ gap }}>
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col flex-1" style={{ gap }}>
          {col.map((img, i) => (
            <div key={i} className="overflow-hidden group" style={{ borderRadius: radius, cursor: onOpen ? 'pointer' : 'default', opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${(ci + i) * 0.1}s` }} onClick={() => onOpen?.(img)}>
              <img src={img} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ height: `${200 + (i % 2) * 80}px` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
