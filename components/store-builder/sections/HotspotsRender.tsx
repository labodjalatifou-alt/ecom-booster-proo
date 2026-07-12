'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

interface Hotspot {
  x: number // percentage 0-100
  y: number // percentage 0-100
  title: string
  description: string
}

export default function HotspotsRender({ settings }: { settings: any }) {
  const [activeSpot, setActiveSpot] = useState<number | null>(null)

  const s = settings || {}
  const hotspots: Hotspot[] = s.hotspots || [
    { x: 30, y: 40, title: 'Bénéfice Clé', description: 'Une explication détaillée de ce composant.' },
    { x: 70, y: 60, title: 'Technologie Premium', description: 'Conçu avec les meilleurs matériaux.' }
  ]
  const image = s.image_url

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center min-h-[400px]">
      {!image ? (
        <div className="flex flex-col items-center justify-center text-gray-400 p-12">
          <ImageIcon size={48} className="mb-2 opacity-50" />
          <span className="text-sm font-medium">Image non définie</span>
        </div>
      ) : (
        <div className="relative w-full h-full max-w-4xl mx-auto">
          <img src={image} alt="Hotspots" className="w-full h-auto object-cover rounded-2xl shadow-xl" />
          
          {hotspots.map((spot, idx) => (
            <div 
              key={idx}
              className="absolute"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setActiveSpot(idx)}
              onMouseLeave={() => setActiveSpot(null)}
              onClick={() => setActiveSpot(activeSpot === idx ? null : idx)}
            >
              {/* Dot */}
              <div className="relative cursor-pointer group">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                <div className="relative w-6 h-6 bg-white rounded-full border-4 border-primary shadow-lg z-10 flex items-center justify-center transition-transform hover:scale-125">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
              </div>

              {/* Tooltip */}
              <div 
                className={`absolute z-20 left-1/2 -translate-x-1/2 mt-4 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 transition-all duration-300 pointer-events-none
                ${activeSpot === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45"></div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 relative">{spot.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed relative">{spot.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
