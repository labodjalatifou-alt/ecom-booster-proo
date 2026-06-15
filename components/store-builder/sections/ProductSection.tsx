'use client'
import { useState } from 'react'
import type { ProductProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: ProductProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

const DEMO = {
  name: 'Nom de votre produit',
  description: 'Description complète du produit. Mettez en avant les bénéfices clés, les matériaux, la qualité et ce qui rend votre produit unique.',
  price: 29900,
  compare_price: 49900,
  images: [
    'https://picsum.photos/seed/product-main/600/600',
    'https://picsum.photos/seed/product-2/600/600',
    'https://picsum.photos/seed/product-3/600/600',
  ],
  variants: [{ name: 'Taille', options: ['S', 'M', 'L', 'XL'] }, { name: 'Couleur', options: ['Noir', 'Blanc', 'Bleu'] }],
  stock: 8,
}

export default function ProductSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [mainImg, setMainImg] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const product = DEMO
  const images = Array.isArray(props.images) && props.images.length > 0 ? props.images : DEMO.images
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  return (
    <div
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: colors.bg }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Fiche produit</span>}
      {isEditing && (
        <div className="text-center mb-4">
          <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
            Aperçu démo — configurez votre produit dans les paramètres
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-12 items-start" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Galerie images */}
        {props.show_images && (
          <div className="flex-1 flex flex-col gap-4" style={{ maxWidth: 520 }}>
            <div className="rounded-3xl overflow-hidden bg-gray-100 relative" style={{ aspectRatio: '1/1' }}>
              {images[mainImg] ? (
                <img src={images[mainImg]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">Aucune image</div>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setMainImg(i) }}
                  className="rounded-xl overflow-hidden border-2 transition-all"
                  style={{ width: 80, height: 80, borderColor: i === mainImg ? colors.primary : colors.border }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Infos produit */}
        <div className="flex-1 flex flex-col gap-5">
          {props.show_reviews_count && (
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: 18 }}>★</span>)}
              <span className="text-sm font-medium" style={{ color: colors.textLight }}>4.9 (247 avis)</span>
            </div>
          )}

          <h1 className="text-3xl font-black leading-tight" style={{ color: colors.text }}>{product.name}</h1>

          {props.show_price && (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-4xl font-black" style={{ color: colors.primary }}>
                {product.price.toLocaleString()} FCFA
              </span>
              {props.show_compare_price && product.compare_price && (
                <>
                  <span className="text-xl line-through" style={{ color: colors.textLight }}>
                    {product.compare_price.toLocaleString()} FCFA
                  </span>
                  {discount && (
                    <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: colors.danger }}>
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {props.show_urgency && props.urgency_text && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: `${colors.danger}12`, color: colors.danger }}>
              {props.urgency_text}
            </div>
          )}

          {props.show_description && (
            <p className="text-sm leading-relaxed" style={{ color: colors.textLight }}>{product.description}</p>
          )}

          {props.show_variants && product.variants.map(variant => (
            <div key={variant.name}>
              <p className="font-bold text-sm mb-2" style={{ color: colors.text }}>
                {variant.name} : <span style={{ color: colors.primary }}>{selectedVariants[variant.name] || 'Choisir'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variant.options.map(opt => (
                  <button
                    key={opt}
                    onClick={e => { e.stopPropagation(); setSelectedVariants(v => ({ ...v, [variant.name]: opt })) }}
                    className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all"
                    style={{
                      borderColor: selectedVariants[variant.name] === opt ? colors.primary : colors.border,
                      backgroundColor: selectedVariants[variant.name] === opt ? `${colors.primary}10` : '#fff',
                      color: colors.text,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {props.show_stock_counter && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < product.stock ? colors.danger : colors.border }} />
                ))}
              </div>
              <span className="text-sm font-semibold" style={{ color: colors.danger }}>
                Plus que {product.stock} en stock !
              </span>
            </div>
          )}

          <button
            className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105 hover:shadow-xl mt-2"
            style={{
              backgroundColor: props.cta_color || colors.primary,
              boxShadow: `0 8px 32px ${props.cta_color || colors.primary}50`,
            }}
          >
            {props.cta_text || 'Commander maintenant'} 🛒
          </button>

          <div className="flex gap-4 flex-wrap text-xs" style={{ color: colors.textLight }}>
            {['🚚 Livraison 2-5 jours', '✅ Paiement à la livraison', '↩️ Retour facile'].map(b => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
