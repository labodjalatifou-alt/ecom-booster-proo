'use client'
export default function ImageTextRender({ settings }: { settings: any }) {
  const s = settings || {}
  const isRight = s.image_position === 'right'
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#fff' }}>
      <div className={`max-w-5xl mx-auto flex flex-col ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 items-center`}>
        <div className="w-full md:w-1/2">
          {s.image_url ? <img src={s.image_url} alt="" className="w-full rounded-2xl object-cover aspect-square" /> : <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">Image</div>}
        </div>
        <div className="w-full md:w-1/2">
          {s.title && <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">{s.title}</h2>}
          {s.text && <p className="text-gray-600 leading-relaxed">{s.text}</p>}
        </div>
      </div>
    </div>
  )
}
