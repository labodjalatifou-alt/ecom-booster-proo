'use client'
function getYoutubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
  return m ? m[1] : null
}
export default function VideoRender({ settings }: { settings: any }) {
  const s = settings || {}
  const ytId = s.url ? getYoutubeId(s.url) : null
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#000' }}>
      {s.title && <h2 className="text-2xl font-black text-center text-white mb-6">{s.title}</h2>}
      <div className="max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden bg-gray-900">
        {ytId ? <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen /> : s.url ? <video className="w-full h-full object-cover" src={s.url} controls poster={s.poster_url} /> : <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">▶ Ajoutez une URL vidéo</div>}
      </div>
    </div>
  )
}
