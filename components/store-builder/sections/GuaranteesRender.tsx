'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const LottieIcon = dynamic(() => import('@/components/store-builder/LottieIcon'), { ssr: false })

const EMOJI_TO_LOTTIE: Record<string, string> = {
  '🚚': 'truck', '🚀': 'truck', '📦': 'truck',
  '🔒': 'lock', '🛡️': 'shield', '✅': 'check',
  '⭐': 'star', '🌟': 'star', '💎': 'star',
  '💬': 'chat', '📞': 'chat',
  '🎁': 'gift', '🎀': 'gift',
  '↩️': 'shield', // Fallback for returns
}

export default function GuaranteesRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', icon: '🛡️', title: 'Paiement 100% Sécurisé', text: 'Vos données sont cryptées' },
    { id: '2', icon: '📦', title: 'Suivi de commande', text: 'Suivez votre colis en temps réel' },
    { id: '3', icon: '↩️', title: 'Retours sous 30 jours', text: 'Garantie satisfait ou remboursé' },
    { id: '4', icon: '📞', title: 'Service Client 7j/7', text: 'Une équipe à votre écoute' },
  ]

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const iconOnly = s.style === 'icons' || items.every((i: any) => !i.text)

  return (
    <div 
      className={`w-full py-8 px-4 ${iconOnly ? '' : 'border-y'}`}
      style={{ 
        backgroundColor: s.bg_color || 'var(--color-bg)',
        borderColor: s.bg_color ? 'rgba(0,0,0,0.05)' : 'var(--color-secondary)',
        color: s.icon_color === '#FFFFFF' ? '#fff' : undefined,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {s.title && (
          <h2 className="text-lg font-black text-center mb-6" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {s.title}
          </h2>
        )}
        <div className={`flex ${iconOnly ? 'flex-wrap justify-around' : 'flex-wrap justify-center'} gap-6 @md:gap-10`}>
          {items.map((item: any) => {
            const lottieKey = EMOJI_TO_LOTTIE[item.icon]
            const isHovered = hoveredId === item.id
            return (
              <div 
                key={item.id} 
                className={`flex flex-col items-center text-center transition-transform hover:-translate-y-1 ${iconOnly ? 'max-w-[140px]' : 'max-w-[200px]'}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={`${iconOnly ? 'w-10 h-10' : 'w-12 h-12'} mb-2 flex items-center justify-center overflow-hidden rounded-full`}>
                  {lottieKey ? (
                    <LottieIcon name={lottieKey} size={iconOnly ? 36 : 48} loop={isHovered} />
                  ) : (
                    <span className={iconOnly ? 'text-2xl' : 'text-3xl'}>{item.icon}</span>
                  )}
                </div>
                <h4 className={`font-bold text-sm ${iconOnly ? 'leading-tight' : 'mb-1'}`} style={{ color: s.icon_color === '#FFFFFF' ? '#fff' : undefined }}>
                  {item.title}
                </h4>
                {!iconOnly && item.text && <p className="text-xs opacity-70">{item.text}</p>}
              </div>
            )
          })}
        {s.show_cta && s.cta_text && (
          <div className="mt-8 text-center flex justify-center w-full">
            <a
              href="#order-form"
              className="inline-block px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: s.cta_color || 'var(--color-primary)' }}
            >
              {s.cta_text}
            </a>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

