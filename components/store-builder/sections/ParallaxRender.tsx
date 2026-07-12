'use client'

import { useEffect, useRef, useState } from 'react'

export default function ParallaxRender({ settings }: { settings: any }) {
  const s = settings || {}
  const bgImage = s.bg_image || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2000'
  const title = s.title || 'Découvrez la Magie'
  const subtitle = s.subtitle || 'Un effet de profondeur luxueux qui capte l\'attention'
  const ctaText = s.cta_text || ''
  const fgImage = s.fg_image || ''
  const overlayOpacity = s.overlay_opacity ?? 40

  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // Calculate how far the component is from the center of the viewport
      const offset = (window.innerHeight / 2) - (rect.top + rect.height / 2)
      setScrollY(offset)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden rounded-3xl my-8 shadow-2xl flex items-center justify-center group"
    >
      {/* Background with CSS parallax (simpler & smoother) */}
      <div 
        className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center transition-transform duration-1000 ease-out"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          transform: `translateY(${scrollY * 0.15}px)` // Parallax move
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />

      {/* Foreground Content */}
      <div 
        className="relative z-10 text-center px-4 max-w-3xl flex flex-col items-center"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }} // Opposite move
      >
        {fgImage && (
          <img 
            src={fgImage} 
            alt="Foreground" 
            className="w-48 h-auto mb-6 object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
            style={{ transform: `translateY(${scrollY * -0.2}px) scale(1.1)` }} // Faster move
          />
        )}
        
        <h2 className="text-4xl @md:text-6xl font-display font-bold text-white mb-4 leading-tight drop-shadow-lg">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-lg @md:text-2xl text-white/90 font-medium mb-8 drop-shadow-md">
            {subtitle}
          </p>
        )}
        
        {ctaText && (
          <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
            {ctaText}
          </button>
        )}
      </div>
    </div>
  )
}
