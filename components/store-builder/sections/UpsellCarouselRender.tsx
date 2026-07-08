'use client'

import React from 'react'
import Image from 'next/image'

interface UpsellItem {
  id?: string
  title: string
  price: string
  image_url?: string
  link?: string
}

export default function UpsellCarouselRender({ settings = {}, products }: { settings?: any; products?: any[] }) {
  const title = settings.title || 'Complétez votre routine'
  const subtitle = settings.subtitle || 'Nos clients achètent souvent ces produits ensemble'
  const bgColor = settings.bg_color || 'var(--color-bg, #f9fafb)'
  const accentColor = settings.accent_color || 'var(--color-primary, #6366f1)'
  const ptPx = settings.padding_top ?? 48
  const pbPx = settings.padding_bottom ?? 48

  // Build display items: prefer manually selected products from DB, fallback to manual items
  const selectedIds: string[] = settings.selected_product_ids || []
  let displayItems: UpsellItem[] = []

  if (selectedIds.length > 0 && products && products.length > 0) {
    displayItems = selectedIds
      .map((id: string) => products.find((p: any) => p.id === id))
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        title: p.title || p.name || 'Produit',
        price: p.price ? `${p.price} ${p.currency || 'FCFA'}` : '',
        image_url: p.images?.[0] || p.image_url || '',
        link: `/boutiques/${p.slug || p.id}` || '#',
      }))
  }

  // Fallback to manually entered items
  if (displayItems.length === 0 && settings.items?.length > 0) {
    displayItems = settings.items
  }

  return (
    <section
      className="landing-full-bleed overflow-hidden"
      style={{ backgroundColor: bgColor, paddingLeft: 20, paddingRight: 20 }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--color-heading, var(--color-text))' }}>
            {title}
          </h2>
          {subtitle && <p className="text-sm" style={{ color: 'var(--color-text-soft, #6b7280)' }}>{subtitle}</p>}
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-3xl mb-2">🛍️</div>
            <p className="font-medium">Aucun produit upsell sélectionné.</p>
            <p className="text-xs mt-1">Choisissez des produits dans le panneau de droite.</p>
          </div>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayItems.map((item: UpsellItem, idx: number) => (
              <div
                key={item.id || idx}
                className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white snap-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ width: 240 }}
              >
                <div className="relative w-full overflow-hidden" style={{ height: 200, background: '#f3f4f6' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-4xl text-gray-300">📦</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold mb-1 flex-1 leading-tight" style={{ color: 'var(--color-text)' }}>
                    {item.title}
                  </h3>
                  {item.price && (
                    <div className="text-lg font-black mb-3" style={{ color: accentColor }}>
                      {item.price}
                    </div>
                  )}
                  <a
                    href={item.link || '#'}
                    className="block text-center py-2.5 px-4 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accentColor }}
                  >
                    Ajouter
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
