'use client'
export default function TextBlockRender({ settings }: { settings: any }) {
  const s = settings || {}
  return (
    <div className="w-full py-8 px-4" style={{ backgroundColor: s.bg_color || '#fff' }}>
      <div className="max-w-2xl mx-auto" style={{ textAlign: s.text_align || 'center', color: s.text_color || '#374151' }}>
        <p className="text-base leading-relaxed whitespace-pre-wrap">{s.content}</p>
      </div>
    </div>
  )
}
