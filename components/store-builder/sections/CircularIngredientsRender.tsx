'use client'

import React from 'react'
import Image from 'next/image'

export default function CircularIngredientsRender({ settings = {} }: { settings?: any }) {
  const title = settings.title || 'Ingrédients 100% naturels'
  const subtitle = settings.subtitle
  const items = settings.items || []
  const bgColor = settings.bg_color || '#ffffff'

  return (
    <section className="landing-circular-ingredients landing-full-bleed" style={{ backgroundColor: bgColor, padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: subtitle ? 8 : 32 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>{subtitle}</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}>
          {items.map((item: any, idx: number) => (
            <div key={item.id || idx} style={{ width: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  backgroundColor: '#f3f4f6',
                  marginBottom: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 32 }}>🌱</div>
                )}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.4 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
