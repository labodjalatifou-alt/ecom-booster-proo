'use client'

import { Play } from 'lucide-react'

export default function VideoRender({ settings }: { settings: Record<string, any> }) {
  const title = settings.title ?? 'Voyez-le en action'
  const url = settings.url ?? ''
  const bgColor = settings.bg_color ?? '#000000'
  const poster = settings.poster_url

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  
  const getYouTubeId = (u: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = u.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }
  
  const ytId = isYouTube ? getYouTubeId(url) : null

  return (
    <div className="w-full py-8 px-4 rounded-xl" style={{ backgroundColor: bgColor }}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: bgColor === '#000000' ? '#ffffff' : '#111827' }}>
          {title}
        </h2>
      )}
      
      <div className="max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden bg-gray-900 relative shadow-xl border border-gray-800">
        {!url ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Play size={64} className="mb-4 opacity-50" />
            <p className="font-medium">Ajouter une URL de vidéo</p>
          </div>
        ) : isYouTube && ytId ? (
          <iframe 
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <video 
            src={url} 
            poster={poster}
            controls 
            className="w-full h-full object-cover"
          >
            Votre navigateur ne supporte pas la balise vidéo.
          </video>
        )}
      </div>
    </div>
  )
}
