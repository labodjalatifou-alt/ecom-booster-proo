'use client'
import { Menu, Search, ShoppingBag } from 'lucide-react'

export default function HeaderRender({ settings }: { settings: any }) {
  const s = settings || {}
  const pos = s.logo_position || 'center'
  
  return (
    <header 
      className="sticky top-0 z-40 w-full border-b shadow-sm transition-all duration-300"
      style={{ 
        backgroundColor: s.bg_color || 'var(--color-bg)', 
        color: s.text_color || 'var(--color-text)',
        borderColor: s.bg_color ? 'rgba(0,0,0,0.05)' : 'var(--color-secondary)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center h-16 md:h-20 ${pos === 'center' ? 'justify-between' : 'justify-start gap-8'}`}>
          
          {/* Menu Mobile */}
          <div className={`flex items-center ${pos === 'center' ? 'flex-1' : ''}`}>
            <button className="p-2 -ml-2 rounded-md hover:bg-black/5 transition-colors">
              <Menu size={24} strokeWidth={1.5} />
            </button>
            {s.show_search && (
              <button className="p-2 ml-2 hidden sm:block rounded-md hover:bg-black/5 transition-colors">
                <Search size={20} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            {s.logo_image ? (
              <img src={s.logo_image} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl md:text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                {s.logo_text || 'MA BOUTIQUE'}
              </span>
            )}
          </div>

          {/* Actions (Panier) */}
          <div className="flex items-center justify-end flex-1 gap-2">
            {s.show_search && (
              <button className="p-2 sm:hidden rounded-md hover:bg-black/5 transition-colors">
                <Search size={20} strokeWidth={1.5} />
              </button>
            )}
            {s.show_cart !== false && (
              <button className="relative p-2 rounded-md hover:bg-black/5 transition-colors flex items-center gap-2 group">
                <div className="relative">
                  <ShoppingBag size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    0
                  </span>
                </div>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
