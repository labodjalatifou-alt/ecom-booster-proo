'use client'
import { Play } from 'lucide-react'

function getYoutubeId(url: string) {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
  return m ? m[1] : null
}

export default function VideoRender({ settings }: { settings: any }) {
  const s = settings || {}
  const ytId = getYoutubeId(s.url)
  const isMp4 = s.url?.endsWith('.mp4')

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {s.title && (
          <h2 className="text-3xl @md:text-4xl font-black text-center mb-8 tracking-tight" style={{ color: 'var(--color-text)' }}>
            {s.title}
          </h2>
        )}

        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl relative bg-black group">
          {ytId ? (
            <iframe 
              src={`https://www.youtube.com/embed/${ytId}?rel=0`} 
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen 
            />
          ) : isMp4 ? (
            <video src={s.url} poster={s.poster_url} className="w-full h-full object-cover" controls />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 relative">
              {s.poster_url && <img src={s.poster_url} alt="Video Poster" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center z-10 border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                <Play fill="white" className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
