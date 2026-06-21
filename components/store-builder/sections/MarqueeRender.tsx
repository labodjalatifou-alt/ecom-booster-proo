'use client'

export default function MarqueeRender({ settings }: { settings: Record<string, any> }) {
  const bgColor = settings.bg_color ?? '#000000'
  const textColor = settings.text_color ?? '#ffffff'
  const speed = settings.speed ?? 30
  const text = settings.text ?? '⭐ Offre spéciale aujourd\'hui ⭐'

  return (
    <div 
      className="relative flex items-center overflow-hidden w-full py-3"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="whitespace-nowrap flex" style={{ animation: `marquee ${speed}s linear infinite` }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="text-lg md:text-xl font-bold uppercase tracking-widest px-8">
            {text}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
