'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

export default function AnnouncementBarRender({ settings }: { settings: Record<string, any> }) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const bgColor = settings.bg_color ?? '#000000'
  const textColor = settings.text_color ?? '#ffffff'
  const speed = settings.speed ?? 30
  const text = settings.text ?? '⭐ Livraison gratuite ⭐'
  const showClose = settings.close_button ?? false

  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden w-full"
      style={{ backgroundColor: bgColor, color: textColor, height: 40 }}
    >
      <div className="absolute whitespace-nowrap w-full overflow-hidden">
        <div 
          className="inline-block"
          style={{ animation: `marquee ${speed}s linear infinite` }}
        >
          <span className="text-sm font-medium px-4">{text}</span>
          <span className="text-sm font-medium px-4">{text}</span>
          <span className="text-sm font-medium px-4">{text}</span>
          <span className="text-sm font-medium px-4">{text}</span>
        </div>
      </div>
      
      {showClose && (
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full z-10 transition-colors"
        >
          <X size={16} />
        </button>
      )}

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}
