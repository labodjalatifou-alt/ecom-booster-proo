'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SlideshowRender({ settings }: { settings: any }) {
  const s = settings || {}
  const slides = s.slides || []
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (s.autoplay && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [s.autoplay, slides.length])

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full bg-gray-100 flex items-center justify-center text-gray-400" style={{ height: s.height ?? 600 }}>
        Ajoutez des slides dans le menu de droite
      </div>
    )
  }

  const next = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="relative w-full overflow-hidden" style={{ height: s.height ?? 600 }}>
      {slides.map((slide: any, index: number) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 flex items-center justify-center"
          style={{
            opacity: current === index ? 1 : 0,
            zIndex: current === index ? 10 : 0,
          }}
        >
          {slide.image_url ? (
            <img src={slide.image_url} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gray-200" />
          )}
          <div className="absolute inset-0" style={{ backgroundColor: slide.overlay_color || 'rgba(0,0,0,0.4)' }} />
          
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
            {slide.title && (
              <h2 className="text-3xl @md:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                {slide.title}
              </h2>
            )}
            {slide.subtitle && (
              <p className="text-lg @md:text-xl text-white/90 mb-8 max-w-2xl">
                {slide.subtitle}
              </p>
            )}
            {slide.cta_text && (
              <a href="#order-form" className="inline-block px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-colors">
                {slide.cta_text}
              </a>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
            <ChevronLeft size={32} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
            <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className="w-3 h-3 rounded-full transition-colors"
                style={{ backgroundColor: current === idx ? 'white' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
