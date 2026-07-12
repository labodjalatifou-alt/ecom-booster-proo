'use client'

import React from 'react'
import { renderBlock } from '@/lib/store-builder/renderBlock'
import { partitionTemplate, resolveLayout } from '@/lib/store-builder/layout-engine'
import RevealSection from '@/components/store-builder/RevealSection'

const LAYOUT_CSS = `
  .landing-template { width: 100%; }
  .landing-template--single { max-width: 100%; }
  .landing-template--full-width { max-width: 100%; }
  .landing-template-rest { width: 100%; }

  /* ── Full-width: sections pleine largeur avec fond alterné ── */
  .landing-template--full-width .landing-full-section {
    width: 100%;
    padding: 48px 24px;
  }
  .landing-template--full-width .landing-full-section--padded {
    padding: 48px 24px;
  }
  @media (min-width: 768px) {
    .landing-template--full-width .landing-full-section--padded {
      padding: 64px 48px;
    }
  }
  .landing-template--full-width .landing-full-section--no-pad {
    padding: 0;
  }

  /* ── Hero split : galerie | colonne achat ── */
  .landing-hero--split .landing-hero-split-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  @media (min-width: 900px) {
    .landing-hero--split .landing-hero-split-grid {
      flex-direction: row;
      align-items: stretch;
      gap: 32px;
      padding: 24px 24px 24px 48px;
    }
    .landing-hero--split .landing-hero-split-gallery {
      flex: 0 0 48%;
      min-width: 0;
      position: sticky;
      top: 24px;
      max-height: calc(100vh - 48px);
      overflow: hidden;
      border-radius: 12px;
    }
    .landing-hero--split .landing-hero-split-buy {
      flex: 1 1 52%;
      min-width: 0;
      padding: 8px 16px;
      display: flex;
      flex-direction: column;
    }
  }
  .landing-hero--split.force-mobile .landing-hero-split-grid {
    flex-direction: column !important;
    padding: 0 !important;
    gap: 0 !important;
  }
  .landing-hero--split.force-mobile .landing-hero-split-gallery {
    position: static !important;
    max-height: none !important;
    border-radius: 0 !important;
  }
  .landing-hero--split.force-mobile .landing-hero-split-buy {
    padding: 16px !important;
  }

  /* ── Hero triple : galerie | form sticky | marketing ── */
  .landing-hero--triple .landing-hero-triple-desktop {
    display: none;
  }
  .landing-hero--triple .landing-hero-triple-mobile {
    display: block;
  }
  @media (min-width: 900px) {
    .landing-hero--triple .landing-hero-triple-desktop {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 32px;
      padding: 24px 24px 24px 48px;
    }
    .landing-hero--triple .landing-hero-triple-gallery-col {
      flex: 0 0 48%;
      min-width: 0;
      position: sticky;
      top: 24px;
      max-height: calc(100vh - 48px);
      overflow: hidden;
      border-radius: 12px;
    }
    .landing-hero--triple .landing-hero-triple-right-col {
      flex: 1 1 52%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 16px;
    }
    .landing-hero--triple .landing-hero-triple-mobile {
      display: none;
    }

  }
  .landing-hero--triple.force-mobile .landing-hero-triple-desktop {
    display: none !important;
  }
  .landing-hero--triple.force-mobile .landing-hero-triple-mobile {
    display: block !important;
  }

  /* Sections pleine largeur hors hero */
  .landing-template-rest .landing-full-bleed {
    margin-left: calc(-1 * var(--landing-pad, 0px));
    margin-right: calc(-1 * var(--landing-pad, 0px));
    width: calc(100% + 2 * var(--landing-pad, 0px));
  }
`

interface TemplateLayoutRendererProps {
  template: any[]
  themeSettings?: Record<string, any>
  product: any
  storeId?: string | null
  /** Éditeur en mode mobile */
  forceMobile?: boolean
  wrapBlock?: (block: any, node: React.ReactNode) => React.ReactNode
  /** Active les animations de scroll (désactivé dans l'éditeur) */
  enableReveal?: boolean
  /** Tous les produits de la boutique (pour upsell / popup) */
  allProducts?: any[]
}

export default function TemplateLayoutRenderer({
  template,
  themeSettings = {},
  product,
  storeId,
  forceMobile = false,
  wrapBlock,
  enableReveal = false,
  allProducts,
}: TemplateLayoutRendererProps) {
  const layout = resolveLayout(themeSettings)
  const parts = partitionTemplate(template, layout)

  const render = (block: any, revealVariant?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'zoomIn', revealDelay?: number) => {
    const node = renderBlock(block, product, storeId, themeSettings, allProducts)
    if (!node) return null
    if (wrapBlock) return wrapBlock(block, node)
    if (enableReveal && revealVariant) {
      return (
        <RevealSection key={block.id} variant={revealVariant} delay={revealDelay ?? 0}>
          {node}
        </RevealSection>
      )
    }
    return <div key={block.id}>{node}</div>
  }

  const renderList = (blocks: any[]) => blocks.map(b => render(b)).filter(Boolean)

  // Liste avec animations de scroll staggersées pour les sections sous le hero
  const REVEAL_VARIANTS: Array<'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'zoomIn' | 'fadeIn'> = [
    'fadeInUp', 'fadeInLeft', 'fadeInRight', 'fadeInUp', 'zoomIn', 'fadeIn'
  ]
  const renderRevealList = (blocks: any[]) =>
    blocks.map((b, i) => render(b, REVEAL_VARIANTS[i % REVEAL_VARIANTS.length], i * 80)).filter(Boolean)

  // Fonction pour trier un groupe de blocs selon leur ordre dans le template d'origine
  const sortByTemplateOrder = (blocks: any[]) => {
    return [...blocks].sort((a, b) => template.indexOf(a) - template.indexOf(b))
  }

  if (layout === 'single-column') {
    return (
      <>
        <main className="landing-template landing-template--single">{renderRevealList(template)}</main>
        <style>{LAYOUT_CSS}</style>
      </>
    )
  }

  if (layout === 'full-width') {
    return (
      <>
        <main className="landing-template landing-template--full-width">
          {template.map((block, i) => {
            const node = renderBlock(block, product, storeId, themeSettings, allProducts)
            if (!node) return null
            const wrapped = wrapBlock ? wrapBlock(block, node) : <div key={block.id}>{node}</div>
            if (enableReveal) {
              const variant = REVEAL_VARIANTS[i % REVEAL_VARIANTS.length]
              return (
                <RevealSection key={block.id} variant={variant} delay={i * 80}>
                  {wrapped}
                </RevealSection>
              )
            }
            return wrapped
          })}
        </main>
        <style>{LAYOUT_CSS}</style>
      </>
    )
  }

  if (layout === 'hero-split') {
    const forceClass = forceMobile ? ' force-mobile' : ''
    // Right column = ALL hero blocks (productInfo) + form, sorted by their original position
    const rightColBlocks = sortByTemplateOrder([...parts.productInfo, ...parts.form])
    return (
      <>
        <section className={`landing-hero landing-hero--split${forceClass}`}>
          <div className="landing-hero-split-grid">
            <div className="landing-hero-split-gallery">{renderList(parts.gallery)}</div>
            <div className="landing-hero-split-buy">
              {renderList(rightColBlocks)}
            </div>
          </div>
        </section>
        <div className="landing-template-rest">{renderRevealList(parts.rest)}</div>
        <style>{LAYOUT_CSS}</style>
      </>
    )
  }

  // hero-triple: galerie | form sticky | resto du hero (titre, prix, etc.)
  const forceClass = forceMobile ? ' force-mobile' : ''
  // Mobile: all hero blocks in one vertical flow, sorted by template order
  const allHeroBlocksMobile = sortByTemplateOrder([...parts.gallery, ...parts.form, ...parts.productInfo])
  return (
    <>
      <section className={`landing-hero landing-hero--triple${forceClass}`}>
        {/* Mobile : tous les blocs hero dans l'ordre du template */}
        <div className="landing-hero-triple-mobile">
          {renderList(allHeroBlocksMobile)}
        </div>
        {/* Desktop : galerie | form sticky | productInfo */}
        <div className="landing-hero-triple-desktop">
          <div className="landing-hero-triple-gallery-col">{renderList(parts.gallery)}</div>
          <div className="landing-hero-triple-right-col">
            {renderList(sortByTemplateOrder([...parts.productInfo, ...parts.form]))}
          </div>
        </div>
      </section>
      <div className="landing-template-rest">{renderRevealList(parts.rest)}</div>
      <style>{LAYOUT_CSS}</style>
    </>
  )
}
