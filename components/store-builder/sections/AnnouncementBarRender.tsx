'use client'
import { useEffect, useRef } from 'react'
export default function AnnouncementBarRender({ settings }: { settings: any }) {
  const s = settings || {}
  return (
    <div style={{ backgroundColor: s.bg_color || '#000', color: s.text_color || '#fff' }} className="w-full overflow-hidden py-2.5 relative">
      <div className="flex whitespace-nowrap" style={{ animation: `marquee ${120 / (s.speed || 30)}s linear infinite` }}>
        {[...Array(3)].map((_, i) => (
          <span key={i} className="mx-8 text-sm font-medium tracking-wide">{s.text || '⭐ Livraison gratuite ⭐'}</span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
    </div>
  )
}
