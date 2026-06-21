'use client'
export default function GuaranteesRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || []
  return (
    <div className="w-full py-10 px-4 border-y border-gray-100" style={{ backgroundColor: s.bg_color || '#fff' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item: any) => (
          <div key={item.id} className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">{item.icon}</span>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
