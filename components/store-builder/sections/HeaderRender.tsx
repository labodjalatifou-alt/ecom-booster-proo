'use client'
import { Menu, ShoppingCart, Search } from 'lucide-react'
export default function HeaderRender({ settings }: { settings: any }) {
  const s = settings || {}
  const pos = s.logo_position || 'center'
  return (
    <header style={{ backgroundColor: s.bg_color || '#fff', color: s.text_color || '#111' }} className="sticky top-0 z-40 w-full border-b border-gray-100 backdrop-blur bg-white/95">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 w-10"><Menu size={22} /></div>
        <div className={`flex-1 flex ${pos === 'left' ? 'justify-start' : pos === 'right' ? 'justify-end' : 'justify-center'}`}>
          <span className="text-xl font-black tracking-tight" style={{ color: s.text_color || '#111' }}>{s.logo_text || 'MA BOUTIQUE'}</span>
        </div>
        <div className="flex items-center gap-3 w-10 justify-end">
          {s.show_search && <Search size={18} />}
          <ShoppingCart size={20} />
        </div>
      </div>
    </header>
  )
}
