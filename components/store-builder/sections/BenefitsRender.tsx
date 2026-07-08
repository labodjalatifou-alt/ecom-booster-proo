'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const LottieIcon = dynamic(() => import('@/components/store-builder/LottieIcon'), { ssr: false })

// Mapping emoji → clé d'animation Lottie
const EMOJI_TO_LOTTIE: Record<string, string> = {
  '🚚': 'truck', '🚀': 'truck', '📦': 'truck',
  '🔒': 'lock', '🛡️': 'shield', '✅': 'check',
  '⭐': 'star', '🌟': 'star', '💎': 'star',
  '💬': 'chat', '📞': 'chat',
  '🎁': 'gift', '🎀': 'gift',
}

export default function BenefitsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', icon: '🚚', title: 'Livraison Rapide', text: 'Expédition sous 24/48h' },
    { id: '2', icon: '🔒', title: 'Paiement Sécurisé', text: 'Via carte bancaire ou PayPal' },
    { id: '3', icon: '⭐', title: 'Qualité Premium', text: 'Satisfaction garantie à 100%' },
    { id: '4', icon: '↩️', title: 'Retours Faciles', text: 'Vous avez 30 jours pour changer d\'avis' },
  ]

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const cols = s.columns || 2
  const gridCols =
    cols >= 4 ? 'grid-cols-2 @md:grid-cols-4' :
    cols === 3 ? 'grid-cols-1 @sm:grid-cols-3' :
    'grid-cols-2'

  return (
    <div
      className="w-full py-10 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        {s.title && (
          <h2
            className="text-xl @md:text-2xl font-black text-center mb-8 tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading, inherit)' }}
          >
            {s.title}
          </h2>
        )}
        <div className={`grid ${gridCols} gap-4 @md:gap-6`}>
          {items.map((item: any) => {
            const lottieKey = EMOJI_TO_LOTTIE[item.icon]
            const isHovered = hoveredId === item.id
            return (
              <div
                key={item.id}
                className="flex flex-col items-center text-center p-4 rounded-xl transition-transform hover:-translate-y-1"
                style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mb-3 overflow-hidden">
                  {lottieKey ? (
                    <LottieIcon name={lottieKey} size={48} loop={isHovered} />
                  ) : (
                    <span className="text-2xl">{item.icon}</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.title}</h3>
                {(item.text || item.description) && (
                  <p className="text-xs text-gray-500 leading-snug mt-1">{item.text || item.description}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
