'use client'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function AnnouncementBarRender({ settings }: { settings: any }) {
  const s = settings || {}
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  // speed = durée (en secondes) d'un cycle complet de défilement.
  // Grand = lent, petit = rapide. Plage conseillée : 5s (rapide) → 60s (très lent).
  const duration = s.speed ?? 18

  const text = s.text || 'LIVRAISON GRATUITE AUJOURD\'HUI SEULEMENT ⚡'

  return (
    <div
      className="w-full relative overflow-hidden flex items-center shadow-sm"
      style={{ backgroundColor: s.bg_color || 'var(--color-primary)', color: s.text_color || '#ffffff', minHeight: '42px' }}
    >
      <div
        className="flex whitespace-nowrap will-change-transform"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="mx-6 text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            {text}
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
