'use client'
import { useEffect, useRef, useState } from 'react'
import type { TestimonialsProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: TestimonialsProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < count ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>★</span>
      ))}
    </div>
  )
}

function Avatar({ name, url }: { name: string; url: string }) {
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']
  const color = colors[name.charCodeAt(0) % colors.length]
  if (url) return <img src={url} alt={name} className="w-12 h-12 rounded-full object-cover" />
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
      style={{ backgroundColor: color }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function TestimonialCard({ item, show_stars, show_verified, colors }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-1"
      style={{ borderColor: colors.border }}>
      {show_stars && <Stars count={item.rating} />}
      <p className="text-sm leading-relaxed" style={{ color: colors.text }}>"{item.text}"</p>
      <div className="flex items-center gap-3 mt-auto">
        <Avatar name={item.name} url={item.avatar_url} />
        <div>
          <div className="font-semibold text-sm" style={{ color: colors.text }}>{item.name}</div>
          <div className="text-xs" style={{ color: colors.textLight }}>
            {item.location} • {item.date}
          </div>
        </div>
        {show_verified && item.verified && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full font-medium"
            style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            ✓ Vérifié
          </span>
        )}
      </div>
    </div>
  )
}

export default function TestimonialsSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (props.layout !== 'carousel') return
    const id = setInterval(() => setSlide(s => (s + 1) % (props.items?.length || 1)), 4000)
    return () => clearInterval(id)
  }, [props.layout, props.items?.length])

  const items = props.items || []

  const gridCols = items.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative transition-all ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bg, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Témoignages</span>}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: colors.text }}>{props.title}</h2>
          {props.subtitle && <p className="text-lg" style={{ color: colors.textLight }}>{props.subtitle}</p>}
        </div>

        {props.layout === 'carousel' ? (
          <div className="relative max-w-2xl mx-auto">
            <TestimonialCard item={items[slide] || items[0]} show_stars={props.show_stars} show_verified={props.show_verified} colors={colors} />
            <div className="flex justify-center gap-2 mt-6">
              {items.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{ backgroundColor: i === slide ? colors.primary : colors.border }} />
              ))}
            </div>
          </div>
        ) : props.layout === 'floating' ? (
          <div className={`grid gap-6 ${gridCols}`}>
            {items.map((item, i) => (
              <div key={item.id} style={{ animation: `float-card ${2 + i * 0.5}s ease-in-out infinite alternate` }}>
                <TestimonialCard item={item} show_stars={props.show_stars} show_verified={props.show_verified} colors={colors} />
              </div>
            ))}
            <style>{`@keyframes float-card { from { transform: translateY(0); } to { transform: translateY(-8px); } }`}</style>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridCols}`}>
            {items.map((item, i) => (
              <div key={item.id} style={{ transitionDelay: `${i * 0.1}s` }}>
                <TestimonialCard item={item} show_stars={props.show_stars} show_verified={props.show_verified} colors={colors} />
              </div>
            ))}
          </div>
        )}

        {/* Rating global */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <Stars count={5} />
          <span className="font-bold" style={{ color: colors.text }}>4.9/5</span>
          <span style={{ color: colors.textLight }}>· {items.length * 150}+ avis vérifiés</span>
        </div>
      </div>
    </div>
  )
}
