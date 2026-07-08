'use client'

import React from 'react'
import { renderBlock } from '@/lib/store-builder/renderBlock'
import { partitionTemplate, resolveLayout } from '@/lib/store-builder/layout-engine'

const LAYOUT_CSS = `
  .landing-template { width: 100%; }
  .landing-template--single { max-width: 100%; }
  .landing-template-rest { width: 100%; }

  /* ── Hero split (Heline / Cellagen) : galerie | colonne achat ── */
  .landing-hero--split .landing-hero-split-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  @media (min-width: 900px) {
    .landing-hero--split .landing-hero-split-grid {
      flex-direction: row;
      align-items: flex-start;
      gap: 32px;
      padding: 28px 32px 12px;
    }
    .landing-hero--split .landing-hero-split-gallery {
      flex: 1 1 52%;
      min-width: 0;
      position: sticky;
      top: 88px;
    }
    .landing-hero--split .landing-hero-split-buy {
      flex: 1 1 48%;
      min-width: 0;
    }
  }
  .landing-hero--split.force-mobile .landing-hero-split-grid {
    flex-direction: column !important;
    padding: 0 !important;
    gap: 0 !important;
  }
  .landing-hero--split.force-mobile .landing-hero-split-gallery {
    position: static !important;
  }

  /* ── Hero triple (Pelo-Bio) : galerie | form sticky | marketing ── */
  .landing-hero--triple .landing-hero-triple-desktop {
    display: none;
  }
  .landing-hero--triple .landing-hero-triple-mobile {
    display: block;
  }
  @media (min-width: 900px) {
    .landing-hero--triple .landing-hero-triple-desktop {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px minmax(0, 1fr);
      gap: 20px;
      align-items: start;
      padding: 20px 24px 8px;
    }
    .landing-hero--triple .landing-hero-triple-mobile {
      display: none;
    }
    .landing-hero--triple .landing-hero-triple-form-col {
      position: sticky;
      top: 88px;
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
}

export default function TemplateLayoutRenderer({
  template,
  themeSettings = {},
  product,
  storeId,
  forceMobile = false,
  wrapBlock,
}: TemplateLayoutRendererProps) {
  const layout = resolveLayout(themeSettings)
  const parts = partitionTemplate(template, layout)

  const render = (block: any) => {
    const node = renderBlock(block, product, storeId, themeSettings)
    if (!node) return null
    if (wrapBlock) return wrapBlock(block, node)
    return <div key={block.id}>{node}</div>
  }

  const renderList = (blocks: any[]) => blocks.map(render).filter(Boolean)

  // Fonction pour trier un groupe de blocs selon leur ordre dans le template d'origine
  const sortByTemplateOrder = (blocks: any[]) => {
    return [...blocks].sort((a, b) => template.indexOf(a) - template.indexOf(b))
  }

  if (layout === 'single-column') {
    return (
      <>
        <main className="landing-template landing-template--single">{renderList(template)}</main>
        <style>{LAYOUT_CSS}</style>
      </>
    )
  }

  if (layout === 'hero-split') {
    const forceClass = forceMobile ? ' force-mobile' : ''
    return (
      <>
        <section className={`landing-hero landing-hero--split${forceClass}`}>
          <div className="landing-hero-split-grid">
            <div className="landing-hero-split-gallery">{renderList(parts.gallery)}</div>
            <div className="landing-hero-split-buy">
              {renderList(sortByTemplateOrder([
                ...parts.productInfo,
                ...parts.heroSidebar,
                ...parts.form,
                ...parts.heroBuyColumn
              ]))}
            </div>
          </div>
        </section>
        <div className="landing-template-rest">{renderList(parts.rest)}</div>
        <style>{LAYOUT_CSS}</style>
      </>
    )
  }

  // hero-triple
  const forceClass = forceMobile ? ' force-mobile' : ''
  return (
    <>
      <section className={`landing-hero landing-hero--triple${forceClass}`}>
        {/* Mobile : galerie, form, infos, marketing (ordonnés selon le template) */}
        <div className="landing-hero-triple-mobile">
          {renderList(sortByTemplateOrder([
            ...parts.form,
            ...parts.gallery,
            ...parts.productInfo,
            ...parts.heroMarketing
          ]))}
        </div>
        {/* Desktop : galerie | form sticky | infos + marketing */}
        <div className="landing-hero-triple-desktop">
          <div className="landing-hero-triple-gallery-col">{renderList(parts.gallery)}</div>
          <div className="landing-hero-triple-form-col">{renderList(parts.form)}</div>
          <div className="landing-hero-triple-marketing-col">
            {renderList(sortByTemplateOrder([
              ...parts.productInfo,
              ...parts.heroMarketing
            ]))}
          </div>
        </div>
      </section>
      <div className="landing-template-rest">{renderList(parts.rest)}</div>
      <style>{LAYOUT_CSS}</style>
    </>
  )
}
