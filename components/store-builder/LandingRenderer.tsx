'use client'

import React from 'react'
import { renderBlock } from '@/lib/store-builder/renderBlock'
import { getLandingPageStyles, hexToRgba, normalizeHexColor } from '@/lib/store-builder/landing-theme'
import StoreFavicon from '@/components/store-builder/StoreFavicon'
import StoreTracking from '@/components/store-builder/StoreTracking'
import ThemeLogoBar from '@/components/store-builder/sections/ThemeLogoBar'
import TemplateLayoutRenderer from '@/components/store-builder/TemplateLayoutRenderer'
import StickyOrderBar from '@/components/store-builder/sections/StickyOrderBar'
import { resolveLayout } from '@/lib/store-builder/layout-engine'

export interface LandingTheme {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  textSoftColor?: string
  fontFamily?: string
  headingFont?: string
  border?: string
  surface?: string
  favicon_url?: string
  favicon?: string
  logo_url?: string
  logo_height?: number
  meta_pixel_id?: string
  show_whatsapp?: boolean
  whatsapp_number?: string
  cardMaxWidth?: number
  layout?: string
  headingColor?: string
  priceColor?: string
  accentDeep?: string
  gold?: string
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
 * LandingRenderer — rendu par layout de thème (single / hero-split / hero-triple).
 * Partagé entre l'éditeur (Canvas) et la page publique (/s/[slug]) → WYSIWYG.
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
  const layout = resolveLayout(theme)
  const mainMaxWidth = layout === 'single-column' ? (theme.cardMaxWidth ?? 720) : '100%'
  // Enrichir le thème avec les flags de la page publique
  const publicTheme = showFloating ? { ...theme, __enableTilt: true } : theme

  // Couleur du bouton = btn_color du formulaire de commande, sinon couleur principale du thème
  const orderFormBlock = [...header, ...template, ...footer].find(
    (b: any) => b.type === 'OrderForm' || b.type === 'order_form'
  )
  const ctaColor = orderFormBlock?.settings?.btn_color
    ? normalizeHexColor(orderFormBlock.settings.btn_color, accent)
    : accent
  const ctaAccent = orderFormBlock?.settings?.accent_color
    ? normalizeHexColor(orderFormBlock.settings.accent_color, ctaColor)
    : ctaColor

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
          <div key={block.id}>{renderBlock(block, product, storeId, publicTheme)}</div>
        ))}

        <main className="@container" style={{ maxWidth: mainMaxWidth, width: '100%', margin: '0 auto', background: cardBg, paddingBottom: 24 }}>
          <TemplateLayoutRenderer
            template={template}
            themeSettings={publicTheme}
            product={product}
            storeId={storeId}
            enableReveal={showFloating}
          />
        </main>

        {footer.map((block) => (
          <div key={block.id}>{renderBlock(block, product, storeId, publicTheme)}</div>
        ))}
      </div>

      {/* ── STICKY ORDER BAR PREMIUM (page publique) ── */}
      {showFloating && (
        <StickyOrderBar
          product={product}
          ctaColor={ctaColor}
          ctaAccent={ctaAccent}
          cardBg={cardBg}
        />
      )}

      {/* ── BOUTON WHATSAPP ── */}
      {showFloating && theme.show_whatsapp !== false && (whatsappNumber || theme.whatsapp_number) && (
        <a
          href={`https://wa.me/${(whatsappNumber || theme.whatsapp_number || '').replace(/\D/g, '')}`}
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
          {/* Logo officiel WhatsApp */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="white"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      )}
    </div>
  )
}
