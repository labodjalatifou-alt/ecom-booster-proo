'use client'

import type { BenefitsProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: BenefitsProps
  colors: StoreColors
  fonts: StoreFonts
}

export default function BenefitsSection({ data, colors, fonts }: Props) {
  const cols = data.layout === 'grid' ? Math.min(data.items.length, 4) : Math.min(data.items.length, 4)

  return (
    <section style={{ backgroundColor: data.bg_color || colors.bgSection, padding: '80px 24px' }}>
      <div className="mx-auto max-w-6xl">
        {data.title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black" style={{ color: colors.text, fontFamily: fonts.heading }}>
              {data.title}
            </h2>
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
            gap: 24,
          }}
        >
          {data.items.map(item => (
            <div
              key={item.id}
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: '36px 28px',
                textAlign: 'center',
                boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-8px)'
                el.style.boxShadow = `0 20px 40px ${colors.primary}20`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'
              }}
            >
              {/* Icon bubble */}
              <div
                style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, margin: '0 auto 20px',
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                {item.icon}
              </div>
              <h3
                className="font-bold text-lg mb-3"
                style={{ color: colors.text, fontFamily: fonts.heading }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: colors.textLight, fontFamily: fonts.body }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
