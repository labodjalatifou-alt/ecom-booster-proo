'use client'
import { useState } from 'react'
export default function MediasRender({ settings }: { settings: any }) {
  const images: string[] = settings?.images?.length ? settings.images : []
  const [active, setActive] = useState(0)
  if (!images.length) return (
    <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">Aucune image</div>
  )
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50">
        <img src={images[active]} alt="produit" className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${active === i ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
