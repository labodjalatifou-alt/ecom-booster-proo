'use client'

import { useEffect, useState, useMemo } from 'react'

/** Stock urgence avec chiffre qui varie automatiquement pour créer l'urgence */
export default function StockUrgencyRender({ settings }: { settings: any }) {
  const s = settings || {}
  const baseStock = s.stock_left ?? 7
  const minStock = s.stock_min ?? Math.max(3, baseStock - 15)
  const maxStock = s.stock_max ?? baseStock + 5
  const intervalSec = s.tick_interval ?? 8

  const pool = useMemo(() => {
    const arr: number[] = []
    for (let n = minStock; n <= maxStock; n++) arr.push(n)
    return arr.length ? arr : [baseStock]
  }, [minStock, maxStock, baseStock])

  const [stock, setStock] = useState(baseStock)
  const [pulse, setPulse] = useState(false)
  const total = s.stock_total ?? 30
  const percent = Math.min(100, Math.max(6, (stock / total) * 100))

  useEffect(() => {
    setStock(baseStock)
  }, [baseStock])

  useEffect(() => {
    const id = setInterval(() => {
      setStock(prev => {
        const others = pool.filter(n => n !== prev)
        const next = others[Math.floor(Math.random() * others.length)] ?? prev
        return next
      })
      setPulse(true)
      setTimeout(() => setPulse(false), 400)
    }, intervalSec * 1000)
    return () => clearInterval(id)
  }, [pool, intervalSec])

  const message = (s.message || 'Il ne reste que {stock} articles en stock').replace('{stock}', String(stock))

  return (
    <div
      className="w-full px-5 py-4 rounded-2xl border my-3 transition-all duration-300"
      style={{
        backgroundColor: s.bg_color || '#FCEDE6',
        borderColor: s.border_color || '#F0D9D2',
        transform: pulse ? 'scale(1.01)' : 'scale(1)',
        boxShadow: pulse ? `0 4px 20px ${s.bar_color || '#E8527A'}25` : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: s.text_color || '#C23A5E' }}>
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {message}
        </span>
        {s.show_sold_count !== false && (
          <span className="text-xs font-semibold" style={{ color: s.muted_color || '#7A6469' }}>
            {s.sold_text || `${s.sold_count || 32} vendus aujourd'hui`}
          </span>
        )}
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: s.track_color || '#F4DCD4' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${s.bar_color || '#E8527A'}, ${s.bar_color || '#E8527A'}cc)` }}
        />
      </div>
      <p className="text-[10px] mt-1.5 font-medium" style={{ color: s.muted_color || '#7A6469' }}>
        ⚡ Stock limité — commandez avant rupture
      </p>
    </div>
  )
}
