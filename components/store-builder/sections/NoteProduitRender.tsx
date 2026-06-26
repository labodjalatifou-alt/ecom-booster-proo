'use client'

export default function NoteProduitRender({ settings }: { settings: any }) {
  const s = settings || {}
  if (s.show === false) return null
  const rating = s.rating ?? 5
  const starColor = s.star_color || '#facc15'

  return (
    <div className="flex items-center gap-2 px-5 py-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={i < rating ? starColor : 'none'}
            stroke={starColor}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-[15px] font-semibold" style={{ color: s.text_color || '#6b7280' }}>
        {s.reviews_count || '128 avis'}
      </span>
      <span className="text-[13px] text-green-600 font-semibold">· Achat vérifié</span>
    </div>
  )
}
