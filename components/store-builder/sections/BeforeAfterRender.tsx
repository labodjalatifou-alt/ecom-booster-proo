'use client'
import { useState, useRef } from 'react'
export default function BeforeAfterRender({ settings }: { settings: any }) {
  const s = settings || {}
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)))
  }
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#fff' }}>
      {s.title && <h2 className="text-2xl font-black text-center text-gray-900 mb-6">{s.title}</h2>}
      <div ref={ref} className="max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden relative cursor-col-resize select-none" onMouseMove={handleMove}>
        {s.before_image ? <img src={s.before_image} alt="avant" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500 text-sm">Avant</div>}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          {s.after_image ? <img src={s.after_image} alt="après" className="absolute inset-0 w-full h-full object-cover" style={{ width: ref.current?.offsetWidth + 'px' }} /> : <div className="absolute inset-0 bg-indigo-200 flex items-center justify-center text-indigo-700 text-sm">Après</div>}
        </div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-gray-700">⟺</div>
        </div>
        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{s.before_label || 'Avant'}</span>
        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{s.after_label || 'Après'}</span>
      </div>
    </div>
  )
}
