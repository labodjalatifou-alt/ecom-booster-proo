'use client'
export default function TestimonialsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || []
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#f9fafb' }}>
      {s.title && <h2 className="text-2xl md:text-3xl font-black text-center text-gray-900 mb-8">{s.title}</h2>}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item: any) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-full" /> : item.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{item.location}</p>
              </div>
              {item.verified && <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✓ Vérifié</span>}
            </div>
            <div className="flex text-yellow-400 mb-2">{'★'.repeat(item.rating || 5)}</div>
            <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
