'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
]

export default function MediasRender({ settings }: { settings?: Record<string, any> }) {
  const images = settings?.images?.length ? settings.images : DEFAULT_IMAGES
  const [activeImage, setActiveImage] = useState(images[0])

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative">
        {activeImage ? (
          <img 
            src={activeImage} 
            alt="Produit principal" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={48} />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {images.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                activeImage === img ? 'border-blue-600 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
