'use client'

import type { VideoProps, StoreColors, StoreFonts } from '@/lib/store-builder/types'

interface Props {
  data: VideoProps
  colors: StoreColors
  fonts: StoreFonts
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

export default function VideoSection({ data, colors, fonts }: Props) {
  const youtubeId = data.url ? getYoutubeId(data.url) : null
  const isMp4 = data.url && !youtubeId && (data.url.includes('.mp4') || data.url.includes('.webm'))

  return (
    <section style={{ padding: '80px 24px', backgroundColor: colors.bgSection }}>
      <div className="mx-auto max-w-4xl">
        {data.title && (
          <h2 className="text-3xl font-black text-center mb-10"
            style={{ color: colors.text, fontFamily: fonts.heading }}>
            {data.title}
          </h2>
        )}
        <div
          style={{
            borderRadius: 28, overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            aspectRatio: '16/9', backgroundColor: '#000',
            position: 'relative',
          }}
        >
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0${data.autoplay ? '&autoplay=1' : ''}${data.loop ? `&loop=1&playlist=${youtubeId}` : ''}${data.muted ? '&mute=1' : ''}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isMp4 ? (
            <video
              src={data.url}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay={data.autoplay}
              loop={data.loop}
              muted={data.muted}
              controls={!data.autoplay}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', gap: 16, padding: 32,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p style={{ opacity: 0.5, fontSize: 14, textAlign: 'center' }}>
                Ajoutez une URL YouTube ou MP4 dans les propriétés
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
