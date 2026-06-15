'use client'

import type { BadgeTrustProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: BadgeTrustProps
  colors: StoreColors
  fonts: StoreFonts
}

export default function BadgeTrustSection({ data, colors, fonts }: Props) {
  return (
    <section style={{ backgroundColor: data.bg_color || colors.bgSection, padding: '40px 24px' }}>
      <div className="mx-auto max-w-5xl">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          {data.items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 24px',
                borderRadius: 50,
                background: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1.5px solid rgba(0,0,0,0.06)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 8px 24px ${colors.primary}25`
                el.style.borderColor = `${colors.primary}30`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
                el.style.borderColor = 'rgba(0,0,0,0.06)'
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span
                style={{
                  fontWeight: 700, fontSize: 14,
                  color: colors.text, fontFamily: fonts.body,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
