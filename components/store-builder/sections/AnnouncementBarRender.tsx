'use client'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function AnnouncementBarRender({ settings }: { settings: any }) {
  const s = settings || {}
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const speed = s.speed || 30
  const duration = 120 / speed

  return (
    <div 
      className="w-full relative overflow-hidden flex items-center shadow-sm"
      style={{ backgroundColor: s.bg_color || 'var(--color-primary)', color: s.text_color || '#ffffff', minHeight: '40px' }}
    >
      {/* Marquee Animation */}
      <div 
        className="flex whitespace-nowrap will-change-transform"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="mx-8 text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            {s.text || 'LIVRAISON GRATUITE AUJOURD\'HUI SEULEMENT ⚡'}
          </span>
        ))}
      </div>

      {s.close_button && (
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors z-10"
        >
          <X size={16} />
        </button>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
