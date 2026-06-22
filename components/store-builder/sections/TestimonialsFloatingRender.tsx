'use client'

export default function TestimonialsFloatingRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || []
  const speed = s.animation_time || 30

  if (!items.length) {
    return (
      <div className="w-full py-12 px-4 text-center text-gray-400 text-sm">
        Ajoutez des témoignages depuis le panneau de droite.
      </div>
    )
  }

  const doubled = [...items, ...items]

  return (
    <div className="w-full py-12 overflow-hidden" style={{ backgroundColor: s.bg_color || '#fafafa' }}>
      {s.title && (
        <h2
          className="text-2xl md:text-3xl font-extrabold text-center mb-10 px-6"
          style={{ color: s.title_color || '#111827' }}
        >
          {s.title}
        </h2>
      )}

      <div className="relative w-full" style={{ height: 90 }}>
        <div
          className="flex absolute whitespace-nowrap"
          style={{ animation: `floatingTestimonials ${speed}s linear infinite` }}
        >
          {doubled.map((item: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white rounded-full shadow-md px-5 py-2.5 mx-3 flex-shrink-0"
              style={{ minWidth: 340, boxShadow: `4px 4px 18px ${s.shadow_color || 'rgba(0,0,0,0.06)'}` }}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    item.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: s.accent_color || '#6366f1' }}
                >
                  {item.rating || 5}★
                </div>
              </div>
              <p className="text-sm leading-snug whitespace-normal" style={{ color: s.text_color || '#374151' }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatingTestimonials {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
