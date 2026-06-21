'use client'

import { ImageIcon } from 'lucide-react'

export default function ImageTextRender({ settings }: { settings: Record<string, any> }) {
  const title = settings.title ?? 'Notre Histoire'
  const text = settings.text ?? 'Découvrez notre engagement envers la qualité et nos clients...'
  const imageUrl = settings.image_url
  const imagePosition = settings.image_position ?? 'left' // left, right
  const bgColor = settings.bg_color ?? '#ffffff'

  return (
    <div className="w-full py-12 px-4 md:px-8 rounded-xl" style={{ backgroundColor: bgColor }}>
      <div className={`flex flex-col gap-8 md:gap-12 items-center ${imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        
        {/* Image Side */}
        <div className="flex-1 w-full">
          <div className="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100 shadow-sm">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={48} className="text-gray-300" />
            )}
          </div>
        </div>

        {/* Text Side */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <div className="prose prose-blue text-gray-600 whitespace-pre-wrap">
            {text}
          </div>
        </div>
        
      </div>
    </div>
  )
}
