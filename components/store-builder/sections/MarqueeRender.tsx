'use client'

export default function MarqueeRender({ settings }: { settings: any }) {
  const s = settings || {}
  const speed = s.speed || 30
  const duration = 120 / speed

  return (
    <div 
      className="w-full relative overflow-hidden py-4 shadow-sm border-y border-black/5"
      style={{ backgroundColor: s.bg_color || 'var(--color-primary)', color: s.text_color || '#ffffff' }}
    >
      <div 
        className="flex whitespace-nowrap will-change-transform"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="mx-8 text-xl md:text-2xl font-black tracking-widest uppercase flex items-center gap-4">
            {s.text || '✨ SOLDES D\'HIVER - JUSQU\'À 50% DE RÉDUCTION ✨'}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
