'use client'

export default function PrixRender({ settings, product }: { settings: any; product?: any }) {
  const s = settings || {}
  const price = s.price || (product?.price ? `${Number(product.price).toLocaleString('fr-FR')} ${product?.currency || 'FCFA'}` : '15 000 FCFA')
  const rawCompare = s.compare_at_price || product?.compare_price
  const comparePrice = rawCompare ? `${Number(rawCompare).toLocaleString('fr-FR')} ${product?.currency || 'FCFA'}` : null

  return (
    <div className="flex items-center gap-3 mb-2 flex-wrap">
      <span className="text-3xl font-extrabold" style={{ fontFamily: s.price_font || 'inherit', color: s.price_color || '#111827' }}>
        {price}
      </span>
      {comparePrice && (
        <span className="text-lg line-through" style={{ color: s.compare_color || '#9ca3af' }}>
          {comparePrice}
        </span>
      )}
      {s.show_badge !== false && comparePrice && (
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: s.badge_bg || '#E8527A', color: s.badge_text_color || '#ffffff' }}
        >
          {s.badge_text || 'Promo'}
        </span>
      )}
    </div>
  )
}
