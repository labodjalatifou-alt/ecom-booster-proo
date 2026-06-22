'use client'

export default function StockUrgencyRender({ settings }: { settings: any }) {
  const s = settings || {}
  const stock = s.stock_left ?? 7
  const total = s.stock_total ?? 20
  const percent = Math.min(100, Math.max(4, (stock / total) * 100))

  return (
    <div
      className="w-full max-w-lg mx-auto px-5 py-4 rounded-2xl border my-2"
      style={{ backgroundColor: s.bg_color || '#fff7ed', borderColor: s.border_color || '#fed7aa' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: s.text_color || '#c2410c' }}>
          🔥 {s.message || `Plus que ${stock} articles en stock !`}
        </span>
        {s.show_sold_count && (
          <span className="text-xs" style={{ color: s.muted_color || '#9a3412' }}>
            {s.sold_text || `${s.sold_count || 38} vendus aujourd'hui`}
          </span>
        )}
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: s.track_color || '#fed7aa' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: s.bar_color || '#ea580c' }}
        />
      </div>
    </div>
  )
}
