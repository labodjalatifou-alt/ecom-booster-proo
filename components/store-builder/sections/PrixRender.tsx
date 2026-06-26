'use client'

export default function PrixRender({ settings, product }: { settings: any; product?: any }) {
  const s = settings || {}
  const price = s.price || (product?.price ? `${Number(product.price).toLocaleString('fr-FR')} ${product?.currency || 'FCFA'}` : '15 000 FCFA')
  const rawCompare = s.compare_at_price || product?.compare_price
  const comparePrice = rawCompare ? `${Number(rawCompare).toLocaleString('fr-FR')} ${product?.currency || 'FCFA'}` : null
  const discountPct =
    rawCompare && product?.price && Number(rawCompare) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(rawCompare)) * 100)
      : null

  const priceSize = s.price_font_size ? `${s.price_font_size}px` : '28px'
  const compareSize = s.compare_font_size ? `${s.compare_font_size}px` : '15px'

  return (
    <div className="px-5 py-3 flex items-center gap-2.5 flex-wrap">
      <span className="font-black" style={{ fontFamily: s.price_font || 'inherit', color: s.price_color || '#111827', fontSize: priceSize, fontWeight: s.price_weight || 900 }}>
        {price}
      </span>
      {comparePrice && (
        <span className="line-through" style={{ color: s.compare_color || '#9ca3af', fontSize: compareSize }}>
          {comparePrice}
        </span>
      )}
      {s.show_badge !== false && comparePrice && (
        <span
          className="text-[11px] font-black px-2.5 py-1 rounded-full"
          style={{ backgroundColor: s.badge_bg || '#dc2626', color: s.badge_text_color || '#ffffff' }}
        >
          {discountPct ? `-${discountPct}%` : (s.badge_text || 'Promo')}
        </span>
      )}
    </div>
  )
}
