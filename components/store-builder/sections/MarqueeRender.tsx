'use client'
export default function MarqueeRender({ settings }: { settings: any }) {
  const s = settings || {}
  const speed = 120 / (s.speed || 30)
  return (
    <div className="w-full overflow-hidden py-3" style={{ backgroundColor: s.bg_color || '#000', color: s.text_color || '#fff' }}>
      <div className="flex whitespace-nowrap" style={{ animation: `marquee2 ${speed}s linear infinite` }}>
        {[...Array(4)].map((_, i) => <span key={i} className="mx-6 text-sm font-semibold">⭐ {s.text || 'Livraison gratuite'}</span>)}
      </div>
      <style>{`@keyframes marquee2 { from{transform:translateX(0)} to{transform:translateX(-25%)} }`}</style>
    </div>
  )
}
