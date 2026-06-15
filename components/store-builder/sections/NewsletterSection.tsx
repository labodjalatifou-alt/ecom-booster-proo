'use client'
import { useEffect, useRef, useState } from 'react'
import type { NewsletterProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: NewsletterProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function NewsletterSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [value, setValue] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing || !value.trim()) return
    setDone(true)
  }

  const isFullwidth = props.style === 'fullwidth'
  const bgColor = props.bg_color || colors.primary

  return (
    <div
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: isFullwidth ? bgColor : colors.bgSection }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Newsletter</span>}

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div
          className={`${props.style === 'card' ? 'bg-white rounded-3xl p-10 shadow-xl' : ''}`}
          style={{ borderRadius: props.style === 'card' ? 24 : undefined }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3"
              style={{ color: isFullwidth ? '#fff' : colors.text }}>
              {props.title}
            </h2>
            {props.subtitle && (
              <p style={{ color: isFullwidth ? 'rgba(255,255,255,0.75)' : colors.textLight }}>
                {props.subtitle}
              </p>
            )}
          </div>

          {done ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-bold text-lg" style={{ color: isFullwidth ? '#fff' : colors.text }}>
                Merci pour votre inscription !
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              {props.type === 'whatsapp' ? (
                <div className="flex-1 flex items-center rounded-xl overflow-hidden border-2 bg-white"
                  style={{ borderColor: isFullwidth ? 'rgba(255,255,255,0.3)' : colors.border }}>
                  <span className="px-4 text-green-500 text-xl">📱</span>
                  <input
                    type="tel"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={props.placeholder || 'Votre numéro WhatsApp'}
                    className="flex-1 py-4 pr-4 text-sm outline-none bg-transparent"
                    style={{ color: colors.text }}
                  />
                </div>
              ) : (
                <input
                  type="email"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={props.placeholder || 'Votre email'}
                  className="flex-1 px-5 py-4 rounded-xl text-sm outline-none border-2 bg-white"
                  style={{ borderColor: isFullwidth ? 'rgba(255,255,255,0.3)' : colors.border, color: colors.text }}
                />
              )}
              <button
                type="submit"
                className="px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:shadow-lg whitespace-nowrap"
                style={{
                  backgroundColor: isFullwidth ? '#fff' : (colors.primary),
                  color: isFullwidth ? bgColor : '#fff',
                }}
              >
                {props.button_text || 'S\'inscrire'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
