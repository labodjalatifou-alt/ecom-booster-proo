'use client'

import type { GalleryProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: GalleryProps
  colors: StoreColors
  fonts: StoreFonts
}

export default function GallerySection({ data, colors, fonts }: Props) {
  const images = data.images.length > 0 ? data.images : Array.from({ length: data.columns }, () => '')

  return (
    <section style={{ padding: '80px 24px', backgroundColor: colors.bgSection }}>
      <div className="mx-auto max-w-6xl">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${data.columns}, 1fr)`,
            gap: data.gap,
          }}
        >
          {images.map((url, i) => (
            <div
              key={i}
              style={{
                borderRadius: data.border_radius,
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                background: url ? 'transparent' : `${colors.primary}10`,
                position: 'relative',
              }}
            >
              {url ? (
                <img
                  src={url}
                  alt={`Galerie ${i + 1}`}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
                    display: 'block',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ) : (
                <div
                  style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 8,
                  }}
                >
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke={colors.primary} strokeWidth={1} opacity={0.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span style={{ fontSize: 11, color: colors.textLight }}>Photo {i + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
