'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
export default function FaqRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || []
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#fff' }}>
      {s.title && <h2 className="text-2xl font-black text-center text-gray-900 mb-8">{s.title}</h2>}
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {items.map((item: any) => (
          <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors" onClick={() => setOpen(open === item.id ? null : item.id)}>
              {item.question}
              {open === item.id ? <X size={18} className="flex-shrink-0 text-indigo-600" /> : <Plus size={18} className="flex-shrink-0 text-gray-400" />}
            </button>
            {open === item.id && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
