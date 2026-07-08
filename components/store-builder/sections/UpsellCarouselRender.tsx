'use client'

import React from 'react'
import Image from 'next/image'

export default function UpsellCarouselRender({ settings = {} }: { settings?: any }) {
  const title = settings.title || 'Complétez votre routine'
  const subtitle = settings.subtitle || 'Nos clients achètent souvent ces produits ensemble'
  const items = settings.items || []
  const bgColor = settings.bg_color || '#ffffff'
  const accentColor = settings.accent_color || '#6366f1'

  return (
    <section className="landing-upsell-carousel landing-full-bleed" style={{ backgroundColor: bgColor, padding: '48px 20px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 16, color: '#6b7280' }}>{subtitle}</p>}
        </div>

        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: 16,
          paddingBottom: 24,
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {items.map((item: any, idx: number) => (
            <div key={item.id || idx} style={{ 
              flex: '0 0 280px', 
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              overflow: 'hidden',
              scrollSnapAlign: 'start',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ width: '100%', height: 200, position: 'relative', backgroundColor: '#e5e7eb' }}>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 32, color: '#9ca3af' }}>📦</div>
                )}
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, flex: 1 }}>{item.title}</h3>
                <div style={{ fontSize: 18, fontWeight: '800', color: accentColor, marginBottom: 16 }}>
                  {item.price}
                </div>
                <a 
                  href={item.link || '#'}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    backgroundColor: accentColor,
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontWeight: 'bold',
                    textDecoration: 'none'
                  }}
                >
                  Ajouter
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
