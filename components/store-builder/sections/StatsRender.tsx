'use client'

import { useEffect, useState } from 'react'

function CountUpItem({ number, duration = 2000 }: { number: number, duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(number.toString().replace(/[^0-9]/g, '')) || 0
    if (end === 0) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out quad
      const easeOut = progress * (2 - progress)
      setCount(Math.floor(easeOut * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [number, duration])

  return <span>{count}</span>
}

export default function StatsRender({ settings }: { settings: Record<string, any> }) {
  const bgColor = settings.bg_color ?? '#ffffff'
  const items = settings.items || [
    { id: '1', number: 2000, suffix: '+', label: 'Clients satisfaits', icon: '😊' },
    { id: '2', number: 98, suffix: '%', label: 'Satisfaction', icon: '⭐' },
    { id: '3', number: 5, suffix: 'j', label: 'Délai livraison', icon: '🚚' }
  ]

  return (
    <div className="w-full py-12 px-4 rounded-xl" style={{ backgroundColor: bgColor }}>
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        {items.map((item: any, idx: number) => (
          <div key={item.id || idx} className="flex flex-col items-center text-center">
            <span className="text-3xl md:text-4xl mb-2">{item.icon}</span>
            <div className="text-4xl md:text-5xl font-black text-gray-900 mb-1 flex items-baseline">
              <CountUpItem number={Number(item.number)} />
              <span className="text-2xl md:text-3xl ml-1 text-blue-600">{item.suffix}</span>
            </div>
            <p className="font-medium text-gray-500 uppercase tracking-wide text-sm">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
