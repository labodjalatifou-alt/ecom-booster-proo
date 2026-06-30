'use client'

export default function ImageTextRender({ settings }: { settings: any }) {
  const s = settings || {}
  const isRight = s.image_position === 'right'
  const imgRadius = s.image_radius ?? 16

  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}>
      <div className={`max-w-6xl mx-auto flex flex-col gap-8 items-center ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        <div className="w-full md:w-1/2">
          {s.image_url ? (
            <img
              src={s.image_url}
              alt={s.title || 'Image'}
              className="w-full shadow-lg object-cover aspect-[4/3]"
              style={{ borderRadius: imgRadius }}
            />
          ) : (
            <div
              className="w-full aspect-[4/3] bg-gray-100 shadow-inner border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm"
              style={{ borderRadius: imgRadius }}
            >
              Ajoutez une image depuis le panneau de droite →
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          {s.title && (
            <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tight leading-tight" style={{ color: s.title_color || 'var(--color-heading, var(--color-text))' }}>
              {s.title}
            </h2>
          )}
          {s.text && (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed" style={{ color: s.text_color || 'var(--color-text)', opacity: 0.85 }}>
              {s.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
