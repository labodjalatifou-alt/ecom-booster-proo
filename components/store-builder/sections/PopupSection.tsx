'use client'
import { useEffect, useState } from 'react'
import type { PopupProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: PopupProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function PopupSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isEditing) { setOpen(true); return }
    if (dismissed) return

    const storageKey = `popup_dismissed_${props.trigger}`
    if (props.show_once && sessionStorage.getItem(storageKey)) return

    if (props.trigger === 'timer') {
      const t = setTimeout(() => setOpen(true), (props.delay || 5) * 1000)
      return () => clearTimeout(t)
    }

    if (props.trigger === 'scroll') {
      const handler = () => {
        if (window.scrollY > window.innerHeight * 0.5) {
          setOpen(true)
          window.removeEventListener('scroll', handler)
        }
      }
      window.addEventListener('scroll', handler, { passive: true })
      return () => window.removeEventListener('scroll', handler)
    }

    if (props.trigger === 'exit') {
      const handler = (e: MouseEvent) => {
        if (e.clientY <= 5) setOpen(true)
      }
      document.addEventListener('mouseleave', handler)
      return () => document.removeEventListener('mouseleave', handler)
    }
  }, [props.trigger, props.delay, props.show_once, isEditing, dismissed])

  const handleDismiss = () => {
    setOpen(false)
    setDismissed(true)
    if (props.show_once) sessionStorage.setItem(`popup_dismissed_${props.trigger}`, '1')
  }

  // In editor, show a placeholder button to preview the popup
  if (isEditing && !open) {
    return (
      <div
        onClick={onClick}
        className={`py-6 px-4 relative ${isSelected ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
        style={{ backgroundColor: colors.bgSection }}
      >
        {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Pop-up</span>}
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="font-bold text-sm" style={{ color: colors.text }}>Pop-up : {props.title}</p>
            <p className="text-xs" style={{ color: colors.textLight }}>Déclencheur : {props.trigger} · {props.delay}s</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setOpen(true) }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Prévisualiser
          </button>
        </div>
      </div>
    )
  }

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes popup-in { from { opacity:0; transform:scale(0.92) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .popup-modal { animation: popup-in 0.35s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="popup-modal relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: props.bg_color || '#fff' }}>
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-sm font-bold transition-all z-10"
            style={{ color: colors.text }}
          >✕</button>

          {props.image_url && (
            <img src={props.image_url} alt={props.title} className="w-full h-48 object-cover" />
          )}

          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: colors.text }}>{props.title}</h2>
            {props.subtitle && <p className="mb-6 text-sm" style={{ color: colors.textLight }}>{props.subtitle}</p>}
            <button
              onClick={handleDismiss}
              className="w-full py-4 rounded-2xl font-black text-base text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              {props.cta_text || 'Profiter de l\'offre'}
            </button>
            <button onClick={handleDismiss} className="mt-3 text-xs underline" style={{ color: colors.textLight }}>
              Non merci
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
