'use client'

export default function PrixRender({ settings, product }: { settings: any; product: any }) {
  const s = settings || {}
  const price = s.price || (product?.price ? `${parseInt(product.price).toLocaleString('fr-FR')} FCFA` : '15 000 FCFA')
  const comparePrice = s.compare_at_price || (product?.compare_price ? `${parseInt(product.compare_price).toLocaleString('fr-FR')} FCFA` : null)
  const showBadge = s.show_badge !== false && comparePrice
  const badgeBg = s.badge_bg || '#fee2e2'
  const badgeColor = s.badge_color || '#ef4444'

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <span className="text-2xl font-black" style={{ color: s.price_color || '#111827' }}>
        {price}
      </span>
      {comparePrice && (
        <span className="text-lg line-through" style={{ color: s.compare_color || '#9ca3af' }}>
          {comparePrice}
        </span>
      )}
      {showBadge && (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {s.badge_text || '-50%'}
        </span>
      )}
    </div>
  )
}
