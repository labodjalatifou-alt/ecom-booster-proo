'use client'
import { useEffect, useRef, useState } from 'react'
import type { ProductGridProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: ProductGridProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

// Placeholder products for editor mode
const DEMO_PRODUCTS = [
  { id: '1', name: 'Produit Premium', price: 29900, compare_price: 49900, images: ['https://picsum.photos/seed/prod1/400/400'], badge: true },
  { id: '2', name: 'Best Seller', price: 19900, compare_price: 35000, images: ['https://picsum.photos/seed/prod2/400/400'], badge: true },
  { id: '3', name: 'Nouveau Arrivage', price: 39900, compare_price: null, images: ['https://picsum.photos/seed/prod3/400/400'], badge: false },
]

export default function ProductGridSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const cols = props.columns || 3
  const colsClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'
  const products = isEditing ? DEMO_PRODUCTS : DEMO_PRODUCTS.slice(0, Math.min(3, cols * 2))

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bgSection }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Grille produits</span>}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>{props.title}</h2>
          {props.subtitle && <p style={{ color: colors.textLight }}>{props.subtitle}</p>}
        </div>
        <div className={`grid ${colsClass} gap-6`}>
          {products.map((product, i) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all hover:-translate-y-1"
              style={{
                borderColor: colors.border,
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
              }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {props.show_badge && product.badge && (
                  <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: colors.danger }}>
                    {props.badge_text || 'PROMO'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                  <button
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Commander
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2 text-sm" style={{ color: colors.text }}>{product.name}</h3>
                {props.show_price && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-lg" style={{ color: colors.primary }}>
                      {product.price.toLocaleString()} FCFA
                    </span>
                    {product.compare_price && (
                      <span className="text-sm line-through" style={{ color: colors.textLight }}>
                        {product.compare_price.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
