'use client'
export default function BenefitsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || []
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#f9fafb' }}>
      {s.title && <h2 className="text-2xl font-black text-center text-gray-900 mb-8">{s.title}</h2>}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item: any) => (
          <div key={item.id} className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
