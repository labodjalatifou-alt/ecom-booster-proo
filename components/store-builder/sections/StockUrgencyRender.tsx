'use client'

export default function StockUrgencyRender({ settings }: { settings: any }) {
  const s = settings || {}
  const stock = s.stock_left ?? 6
  const total = s.stock_total ?? 20
  const percent = Math.min(100, Math.max(4, (stock / total) * 100))

  return (
    <div
      className="w-full px-5 py-4 rounded-2xl border my-3"
      style={{ backgroundColor: s.bg_color || '#FCEDE6', borderColor: s.border_color || '#F0D9D2' }}
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <span className="text-sm font-semibold" style={{ color: s.text_color || '#C23A5E' }}>
          🔥 {s.message || `Il ne reste que ${stock} articles en stock`}
        </span>
        {s.show_sold_count && (
          <span className="text-xs" style={{ color: s.muted_color || '#7A6469' }}>
            {s.sold_text || `${s.sold_count || 32} vendus aujourd'hui`}
          </span>
        )}
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: s.track_color || '#F4DCD4' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: s.bar_color || '#E8527A' }} />
      </div>
    </div>
  )
}
