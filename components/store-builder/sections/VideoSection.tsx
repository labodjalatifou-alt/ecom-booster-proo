'use client'
import { useState } from 'react'
import type { VideoProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: VideoProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function getEmbedUrl(url: string, autoplay: boolean, loop: boolean): string {
  if (!url) return ''
  try {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
    if (ytMatch) {
      const id = ytMatch[1]
      const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
      if (autoplay) params.set('autoplay', '1')
      if (loop) { params.set('loop', '1'); params.set('playlist', id) }
      return `https://www.youtube.com/embed/${id}?${params}`
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      const params = new URLSearchParams()
      if (autoplay) params.set('autoplay', '1')
      if (loop) params.set('loop', '1')
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?${params}`
    }
  } catch {}
  return url // mp4 direct
}

const aspectRatios: Record<string, string> = { '16:9': '56.25%', '9:16': '177.77%', '1:1': '100%' }

export default function VideoSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [playing, setPlaying] = useState(false)
  const ratio = aspectRatios[props.aspect_ratio || '16:9'] || '56.25%'
  const embedUrl = getEmbedUrl(props.url, props.autoplay, props.loop)
  const isMP4 = props.url && !embedUrl.includes('youtube') && !embedUrl.includes('vimeo') && props.url.endsWith('.mp4')

  return (
    <div
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || '#111827' }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Vidéo</span>}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {props.title && (
          <h2 className="text-3xl font-bold text-center mb-3 text-white">{props.title}</h2>
        )}
        {props.subtitle && (
          <p className="text-center mb-8 text-white/60 text-sm">{props.subtitle}</p>
        )}

        <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: ratio }}>
          {!props.url ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-800">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <p className="text-white/50 text-sm">Ajoutez une URL vidéo dans les paramètres</p>
            </div>
          ) : isMP4 ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={props.url}
              poster={props.poster_image || undefined}
              autoPlay={props.autoplay}
              loop={props.loop}
              muted={props.autoplay}
              controls={props.show_controls}
            />
          ) : !playing ? (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              style={{ backgroundImage: props.poster_image ? `url(${props.poster_image})` : undefined, backgroundColor: '#1f2937', backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={e => { e.stopPropagation(); setPlaying(true) }}
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          ) : (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`${embedUrl}${props.autoplay ? '' : ''}&autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  )
}
