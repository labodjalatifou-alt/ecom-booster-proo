'use client'

import { Menu, ShoppingCart, Search } from 'lucide-react'

export default function HeaderRender({ settings }: { settings: Record<string, any> }) {
  const bgColor = settings.bg_color ?? 'rgba(255, 255, 255, 0.9)'
  const textColor = settings.text_color ?? '#000000'
  const logoText = settings.logo_text ?? 'Nom de la boutique'
  const logoPosition = settings.logo_position ?? 'center' // left, center, right
  const showSearch = settings.show_search ?? true
  const showCart = settings.show_cart ?? true

  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-md border-b border-black/5"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          <button className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
            <Menu size={24} />
          </button>
          {logoPosition === 'left' && (
            <span className="font-bold text-xl tracking-tight truncate">{logoText}</span>
          )}
        </div>

        {/* Center Section */}
        {logoPosition === 'center' && (
          <div className="flex-1 text-center truncate">
            <span className="font-bold text-xl tracking-tight">{logoText}</span>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {logoPosition === 'right' && (
            <span className="font-bold text-xl tracking-tight truncate mr-2">{logoText}</span>
          )}
          {showSearch && (
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Search size={20} />
            </button>
          )}
          {showCart && (
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors relative">
              <ShoppingCart size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          )}
        </div>
        
      </div>
    </header>
  )
}
