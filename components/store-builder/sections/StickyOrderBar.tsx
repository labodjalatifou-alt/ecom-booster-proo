'use client'

import { useEffect, useRef, useState } from 'react'

interface StickyOrderBarProps {
  product: any
  ctaColor: string
  ctaAccent: string
  cardBg: string
}

/**
 * Bandeau de commande collant premium — apparaît quand le formulaire
 * principal sort du viewport (scroll vers le bas).
 * Affiche : miniature produit + titre court + prix + bouton CTA pulsant.
 */
export default function StickyOrderBar({ product, ctaColor, ctaAccent, cardBg }: StickyOrderBarProps) {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const formEl = document.getElementById('order-form')
    if (!formEl) {
      // Si pas de formulaire, afficher directement
      setVisible(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Visible uniquement quand le formulaire est HORS de l'écran
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0.1, rootMargin: '0px 0px 0px 0px' }
    )
    observerRef.current.observe(formEl)
    return () => observerRef.current?.disconnect()
  }, [])

  const title = product?.title || 'Commander maintenant'
  const price = product?.price ? `${Number(product.price).toLocaleString('fr-FR')} FCFA` : ''
  const imageUrl = product?.images?.[0] || product?.image_url || ''

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'transform',
      }}
    >
      {/* Fond dégradé pour se fondre avec la page */}
      <div
        style={{
          background: `linear-gradient(to top, ${cardBg} 65%, transparent)`,
          padding: '18px 16px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 18,
            padding: '10px 10px 10px 12px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Miniature produit */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          )}

          {/* Titre + prix */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111827',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {title.length > 40 ? title.slice(0, 38) + '…' : title}
            </div>
            {price && (
              <div style={{ fontSize: 15, fontWeight: 800, color: ctaColor, marginTop: 1 }}>
                {price}
              </div>
            )}
          </div>

          {/* Bouton CTA */}
          <a
            href="#order-form"
            style={{
              flexShrink: 0,
              padding: '11px 18px',
              background: `linear-gradient(135deg, ${ctaColor} 0%, ${ctaAccent} 100%)`,
              color: '#fff',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 4px 16px ${ctaColor}55`,
              animation: 'stickyCtaPulse 2.8s ease-in-out infinite',
            }}
          >
            🛒 Commander
          </a>
        </div>
      </div>

      <style>{`
        @keyframes stickyCtaPulse {
          0%, 100% { box-shadow: 0 4px 16px ${ctaColor}55; }
          50% { box-shadow: 0 6px 24px ${ctaColor}88; }
        }
      `}</style>
    </div>
  )
}
