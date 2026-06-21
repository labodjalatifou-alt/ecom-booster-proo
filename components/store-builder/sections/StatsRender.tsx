'use client'
export default function StatsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || []
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#fff' }}>
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
        {items.map((item: any) => (
          <div key={item.id} className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">{item.icon}</span>
            <span className="text-4xl md:text-5xl font-black text-gray-900">{item.number}{item.suffix}</span>
            <span className="text-sm text-gray-500 mt-1 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
