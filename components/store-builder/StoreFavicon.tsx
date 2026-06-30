'use client'

import { useEffect } from 'react'

/** Injecte le favicon de la boutique dans l'onglet navigateur (page publique /s/[slug]) */
export default function StoreFavicon({ url }: { url?: string | null }) {
  useEffect(() => {
    if (!url?.trim()) return
    const href = url.trim()
    const links = document.querySelectorAll("link[rel*='icon']")
    links.forEach(l => l.remove())
    ;['icon', 'shortcut icon', 'apple-touch-icon'].forEach(rel => {
      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      link.type = href.includes('.svg') ? 'image/svg+xml' : 'image/png'
      document.head.appendChild(link)
    })
  }, [url])
  return null
}
