'use client'

import type { TestimonialsProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: TestimonialsProps
  colors: StoreColors
  fonts: StoreFonts
}

function Stars({ rating, accent }: { rating: number; accent: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill={i < rating ? accent : '#e5e7eb'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection({ data, colors, fonts }: Props) {
  const cols = data.layout === 'list' ? 1 : data.items.length >= 3 ? 3 : data.items.length

  return (
    <section style={{ backgroundColor: data.bg_color || colors.bgSection, padding: '80px 24px' }}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          {/* Stars summary */}
          <div className="flex justify-center mb-4">
            <Stars rating={5} accent={colors.accent} />
          </div>
          <h2
            className="text-4xl font-black"
            style={{ color: colors.text, fontFamily: fonts.heading }}
          >
            {data.title}
          </h2>
          <p className="mt-3 text-base" style={{ color: colors.textLight }}>
            {data.items.length} avis vérifiés
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: 24,
          }}
        >
          {data.items.map((item, idx) => (
            <div
              key={item.id}
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: 28,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-6px)'
                el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
              }}
            >
              {data.show_stars && (
                <div className="mb-4">
                  <Stars rating={item.rating} accent={colors.accent} />
                </div>
              )}
              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: colors.text, fontStyle: 'italic', fontFamily: fonts.body }}
              >
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: colors.primary, fontSize: 16 }}
                >
                  {item.avatar_url
                    ? <img src={item.avatar_url} alt={item.name} className="w-full h-full object-cover rounded-full" />
                    : item.name.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: colors.text, fontFamily: fonts.heading }}>{item.name}</p>
                  {item.location && (
                    <p className="text-xs" style={{ color: colors.textLight }}>📍 {item.location}</p>
                  )}
                </div>
                {/* Verified badge */}
                <div className="ml-auto">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: colors.success + '20', color: colors.success }}>
                    ✓ Vérifié
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
