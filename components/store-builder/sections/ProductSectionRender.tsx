'use client'
import { useState } from 'react'
import { ShoppingCart, Star, ChevronLeft, ChevronRight, Minus, Plus, Shield, Truck, RotateCcw, Award } from 'lucide-react'
import { ImageIcon } from 'lucide-react'

interface ProductSectionRenderProps {
  product: any
  settings: any
}

export default function ProductSectionRender({ product, settings }: ProductSectionRenderProps) {
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)

  const s = settings || {}
  const ctaColor = s.cta_color || '#ef4444'
  const ctaText = s.cta_text || 'AJOUTER AU PANIER'
  const urgencyText = s.urgency_text || ''
  const showUrgency = s.show_urgency && urgencyText

  const title = product?.title || 'Titre du produit'
  const price = product?.price ? `${Number(product.price).toLocaleString('fr-FR')} FCFA` : '0 FCFA'
  const comparePrice = product?.compare_price && Number(product.compare_price) > Number(product.price)
    ? `${Number(product.compare_price).toLocaleString('fr-FR')} FCFA`
    : null
  const discountPct = comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : null
  const description = product?.description || ''
  const images: string[] = product?.images?.length
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : []

  const TRUST = [
    { icon: Truck, label: 'Livraison\nRapide' },
    { icon: Shield, label: 'Paiement\nSécurisé' },
    { icon: Award, label: 'Qualité\nPremium' },
    { icon: RotateCcw, label: 'Retours\nFaciles' },
  ]

  return (
    <div className="w-full bg-white">
      {/* ── Urgency bar ── */}
      {showUrgency && (
        <div className="w-full py-2 px-4 text-white text-sm font-bold text-center" style={{ backgroundColor: ctaColor }}>
          {urgencyText}
        </div>
      )}

      {/* ── Main 2-col layout: stacked on mobile, side-by-side on md+ ── */}
      <div className="flex flex-col @md:flex-row gap-6 @md:gap-10 px-4 @md:px-8 py-6 @md:py-10">

        {/* ── LEFT: Image Gallery ── */}
        <div className="w-full @md:w-5/12 flex flex-col gap-3 @md:sticky @md:top-6 self-start">
          {/* Main image */}
          <div className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={title}
                className="w-full h-full object-cover transition-opacity duration-200"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <span className="text-sm">Aucune image produit</span>
              </div>
            )}
            {discountPct && (
              <div className="absolute top-3 left-3 text-white text-xs font-black px-2.5 py-1 rounded-full" style={{ backgroundColor: ctaColor }}>
                -{discountPct}%
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 @md:w-20 @md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i ? 'opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                  style={{ borderColor: activeImg === i ? ctaColor : 'transparent' }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="w-full @md:w-7/12 flex flex-col gap-4">

          {/* Stars */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-sm text-gray-500 font-semibold">4.9 · <span className="text-gray-400">128 avis</span></span>
          </div>

          {/* Title */}
          <h1 className="text-xl @md:text-2xl @lg:text-3xl font-black leading-tight text-gray-900">{title}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl @md:text-3xl font-black text-gray-900">{price}</span>
            {comparePrice && (
              <span className="text-base text-gray-400 line-through font-medium">{comparePrice}</span>
            )}
            {discountPct && (
              <span className="text-xs font-black px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: ctaColor }}>
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Quantity + CTA */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-600">Quantité</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 transition">
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="px-4 py-2 font-bold min-w-[36px] text-center text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-gray-50 transition">
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <button
              className="w-full py-4 rounded-2xl text-white font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: ctaColor, boxShadow: `0 8px 25px -5px ${ctaColor}55` }}
            >
              <ShoppingCart className="w-5 h-5" />
              {ctaText}
            </button>
            <button className="w-full py-3.5 rounded-2xl bg-black text-white font-black text-sm hover:bg-gray-800 transition">
              💳 ACHETER MAINTENANT
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-4 gap-2 py-4 border-y border-gray-100 mt-2">
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 text-center leading-tight whitespace-pre-line">{label}</span>
              </div>
            ))}
          </div>

          {/* Description (visible on desktop in right col) */}
          {description && (
            <div
              className="hidden @md:block prose prose-sm max-w-none text-gray-700 mt-2
                [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-center [&_h1]:my-4
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-center [&_h2]:my-3
                [&_h3]:text-base [&_h3]:font-bold [&_h3]:my-2
                [&_p]:leading-relaxed [&_p]:my-2 [&_p]:text-sm
                [&_img]:w-full [&_img]:rounded-xl [&_img]:my-3
                [&_video]:w-full [&_video]:rounded-xl [&_video]:my-3
                [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_li]:text-sm"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>

      {/* Description (full width below on mobile) */}
      {description && (
        <div className="@md:hidden px-4 pb-8">
          <div
            className="prose prose-sm max-w-none text-gray-700
              [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-center [&_h1]:my-4
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-center [&_h2]:my-3
              [&_h3]:text-base [&_h3]:font-bold [&_h3]:my-2
              [&_p]:leading-relaxed [&_p]:my-2 [&_p]:text-sm
              [&_img]:w-full [&_img]:rounded-xl [&_img]:my-3
              [&_video]:w-full [&_video]:rounded-xl [&_video]:my-3
              [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_li]:text-sm"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}
    </div>
  )
}
