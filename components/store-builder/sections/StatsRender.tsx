'use client'

export default function StatsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', icon: '😊', number: '10 000', suffix: '+', label: 'Clients satisfaits' },
    { id: '2', icon: '⭐', number: '4.9', suffix: '/5', label: 'Note moyenne' },
    { id: '3', icon: '🚚', number: '24', suffix: 'h', label: 'Expédition rapide' },
  ]

  const isBar = !s.title && items.length >= 4

  if (isBar) {
    return (
      <div className="w-full py-6 px-4" style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="text-center">
              <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: s.accent_color || 'var(--color-primary)' }}>
                {item.number}{item.suffix}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item: any) => (
            <div key={item.id} className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-4xl font-black text-gray-900 mb-2 flex items-baseline gap-1" style={{ color: 'var(--color-primary)' }}>
                {item.number}
                <span className="text-2xl font-bold opacity-80">{item.suffix}</span>
              </div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
