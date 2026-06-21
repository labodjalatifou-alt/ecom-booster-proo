'use client'

export default function ImageTextRender({ settings }: { settings: any }) {
  const s = settings || {}
  const isRight = s.image_position === 'right'

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className={`max-w-6xl mx-auto flex flex-col gap-12 items-center ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        
        {/* Image Column */}
        <div className="w-full md:w-1/2">
          {s.image_url ? (
            <img src={s.image_url} alt={s.title || "Image"} className="w-full rounded-2xl shadow-xl object-cover aspect-[4/3]" />
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl shadow-inner border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
              [Image]
            </div>
          )}
        </div>

        {/* Text Column */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          {s.title && (
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
              {s.title}
            </h2>
          )}
          {s.text && (
            <div className="prose prose-lg text-gray-600 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-text)', opacity: 0.8 }}>
              {s.text}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
