'use client'

export default function MarqueeRender({ settings }: { settings: any }) {
  const s = settings || {}
  // speed = durée (en secondes) d'un cycle complet. Grand = lent.
  const duration = s.speed ?? 20

  return (
    <div
      className="w-full relative overflow-hidden py-3 shadow-sm border-y border-black/5"
      style={{ backgroundColor: s.bg_color || 'var(--color-primary)', color: s.text_color || '#ffffff' }}
    >
      <div
        className="flex whitespace-nowrap will-change-transform"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="mx-6 text-lg md:text-xl font-black tracking-widest uppercase flex items-center gap-4">
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
