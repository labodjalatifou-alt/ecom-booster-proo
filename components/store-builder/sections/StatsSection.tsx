'use client'
import { useEffect, useRef, useState } from 'react'
import type { StatsProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: StatsProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function useCountUp(target: number, started: boolean, duration = 2000) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = 0
    const step = target / (duration / 16)
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(id)
  }, [target, started])
  return val
}

function StatCard({ item, started, accent }: { item: any; started: boolean; accent: string }) {
  const val = useCountUp(item.number, started)
  return (
    <div className="flex flex-col items-center gap-2 p-8">
      <span className="text-4xl mb-2">{item.icon}</span>
      <div className="text-5xl font-black tabular-nums" style={{ color: accent }}>
        {val.toLocaleString()}{item.suffix}
      </div>
      <div className="text-sm font-medium opacity-70">{item.label}</div>
    </div>
  )
}

export default function StatsSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.3 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const items = props.items || []

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || '#1e1b4b', color: props.text_color || '#fff' }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Statistiques</span>}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {props.title && (
          <h2 className="text-3xl font-bold text-center mb-12">{props.title}</h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-white/10">
          {items.map((item) => (
            <StatCard key={item.id} item={item} started={started} accent={props.accent_color || colors.accent} />
          ))}
        </div>
      </div>
    </div>
  )
}
