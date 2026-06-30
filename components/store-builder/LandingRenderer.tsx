'use client'

import React from 'react'
import { renderBlock } from '@/lib/store-builder/renderBlock'
import { getLandingPageStyles, hexToRgba, normalizeHexColor } from '@/lib/store-builder/landing-theme'
import StoreFavicon from '@/components/store-builder/StoreFavicon'
import StoreTracking from '@/components/store-builder/StoreTracking'
import ThemeLogoBar from '@/components/store-builder/sections/ThemeLogoBar'

export interface LandingTheme {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  textSoftColor?: string
  fontFamily?: string
  border?: string
  surface?: string
  favicon_url?: string
  logo_url?: string
  logo_height?: number
}

interface LandingRendererProps {
  /** builder_json = { header, template, footer, themeSettings, selectedProductId } */
  builderJson: any
  /** Produit sélectionné pour la landing */
  product: any
  /** Nom de la boutique (pour header/footer par défaut) */
  storeName?: string
  /** ID de la boutique (pour les commandes, page publique) */
  storeId?: string | null
  /** Meta Pixel ID (Facebook) */
  metaPixelId?: string | null
  showFloating?: boolean
  /** Numéro WhatsApp */
  whatsappNumber?: string
}

/**
 * LandingRenderer — moteur de rendu linéaire mobile-first (type Deal224).
 *
 * Une seule colonne centrée, flux vertical :
 *   en-tête → (toutes les sections du template dans l'ordre) → pied
 *
 * Tous les blocks — y compris galerie, titre, prix, formulaire — sont
 * traités comme des sections normales et rendus dans l'ordre du `template`.
 *
 * Partagé entre l'éditeur (Canvas preview) et la page publique (/s/[slug]) → WYSIWYG.
 */
export default function LandingRenderer({
  builderJson,
  product,
  storeName,
  storeId,
  metaPixelId,
  showFloating = false,
  whatsappNumber,
}: LandingRendererProps) {
  const theme: LandingTheme = builderJson?.themeSettings || {}

  const header: any[] = builderJson?.header || []
  const template: any[] = builderJson?.template || []
  const footer: any[] = builderJson?.footer || []
  const hasHeaderBlock = header.some(b => b.type === 'Header' || b.type === 'header')

  const accent = normalizeHexColor(theme.primaryColor, '#ea580c')
  const styles = getLandingPageStyles(theme)
  const cardBg = normalizeHexColor(theme.surface, '#ffffff')

  return (
    <div style={{ ...styles.outer, ...styles.cssVars, minHeight: '100vh' }} className="landing-root">
      <StoreFavicon url={theme.favicon_url || theme.favicon} />
      <StoreTracking pixelId={metaPixelId || theme.meta_pixel_id} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
        .landing-root * { box-sizing: border-box; }
        .landing-root img { max-width: 100%; display: block; }
        .landing-root body { overflow-x: hidden; }
        @keyframes landingCtaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0,0,0,.18); }
          50% { transform: scale(1.02); box-shadow: 0 8px 30px rgba(0,0,0,.28); }
        }
        .landing-cta-pulse { animation: landingCtaPulse 3s ease-in-out infinite; }
        @keyframes landingPopIn {
          0% { transform: scale(.85); opacity: 0; }
          60% { transform: scale(1.03); opacity: 1; }
          100% { transform: scale(1); }
        }
        .landing-pop { animation: landingPopIn .4s cubic-bezier(.2,.8,.2,1) both; }
        .landing-confetti {
          position: absolute; width: 8px; height: 8px; border-radius: 2px;
          animation: confettiFall 2.5s ease-out forwards;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0); opacity: 1; }
          100% { transform: translateY(160px) rotate(420deg); opacity: 0; }
        }
      `}</style>

      {/* ── CARTE CENTRÉE (la "feuille" posée sur le fond) ──
          Large sur desktop (max ~960px), pleine largeur sur mobile.
          Ombre + bordure discrète pour l'effet Deal224. */}
      <div className="landing-card" style={{ ...styles.card, paddingBottom: showFloating ? `calc(${styles.card?.paddingBottom || '0px'} + 90px)` : styles.card?.paddingBottom }}>
        {!hasHeaderBlock && theme.logo_url?.trim() && (
          <ThemeLogoBar
            logoUrl={theme.logo_url}
            logoHeight={theme.logo_height}
            storeName={storeName}
            bgColor={theme.surface}
          />
        )}
        {header.map((block) => (
          <div key={block.id}>{renderBlock(block, product, storeId, theme)}</div>
        ))}

        <main style={{ maxWidth: 720, width: '100%', margin: '0 auto', background: cardBg, paddingBottom: 24 }}>
          {template.map((block) => (
            <div key={block.id}>{renderBlock(block, product, storeId, theme)}</div>
          ))}
        </main>

        {footer.map((block) => (
          <div key={block.id}>{renderBlock(block, product, storeId, theme)}</div>
        ))}
      </div>

      {/* ── CTA FLOTTANT (page publique) ── */}
      {showFloating && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: '14px 16px 18px',
            background: `linear-gradient(to top, ${hexToRgba(cardBg, 1)} 55%, ${hexToRgba(cardBg, 0)})`,
          }}
        >
          <a
            href="#order-form"
            className="landing-cta-pulse"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 720,
              margin: '0 auto',
              padding: '16px',
              background: accent,
              color: '#fff',
              textAlign: 'center',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 16,
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            🛒 COMMANDER MAINTENANT
          </a>
        </div>
      )}

      {/* ── BOUTON WHATSAPP ── */}
      {showFloating && theme.show_whatsapp !== false && (whatsappNumber || theme.whatsapp_number) && (
        <a
          href={`https://wa.me/${(whatsappNumber || theme.whatsapp_number).replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 52,
            height: 52,
            background: '#25d366',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,.2)',
            zIndex: 50,
            textDecoration: 'none',
            fontSize: 26,
          }}
        >
          💬
        </a>
      )}
    </div>
  )
}
