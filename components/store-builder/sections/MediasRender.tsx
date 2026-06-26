'use client'
import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

export default function MediasRender({ settings }: { settings: any }) {
  const images: string[] = settings?.images?.length ? settings.images : []
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <ImageIcon size={48} className="mb-2 opacity-50" />
        <span className="text-sm font-medium">Aucune image produit</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Image Principale */}
      <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <img 
          src={images[active]} 
          alt={`Product ${active}`} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Miniatures (Desktop) & Carousel (Mobile) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden snap-center transition-all ${
                active === idx ? 'ring-2 ring-black ring-offset-2' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
