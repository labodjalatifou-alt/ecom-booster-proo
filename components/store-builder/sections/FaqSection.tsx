'use client'

import { useState } from 'react'
import type { FaqProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: FaqProps
  colors: StoreColors
  fonts: StoreFonts
}

export default function FaqSection({ data, colors, fonts }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section style={{ backgroundColor: data.bg_color || '#fff', padding: '80px 24px' }}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black" style={{ color: colors.text, fontFamily: fonts.heading }}>
            {data.title}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.items.map(item => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `2px solid ${isOpen ? data.accent_color : 'rgba(0,0,0,0.08)'}`,
                  transition: 'border-color 0.25s ease',
                  background: '#fff',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, padding: '20px 24px',
                    textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700, fontSize: 16,
                      color: isOpen ? data.accent_color : colors.text,
                      fontFamily: fonts.heading,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.question}
                  </span>
                  <span
                    style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isOpen ? data.accent_color : `${data.accent_color}15`,
                      color: isOpen ? '#fff' : data.accent_color,
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? 500 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  <div
                    style={{
                      padding: '0 24px 24px',
                      color: colors.textLight,
                      fontSize: 15, lineHeight: 1.75,
                      fontFamily: fonts.body,
                    }}
                  >
                    {item.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
