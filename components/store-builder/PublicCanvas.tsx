'use client'

import AnnouncementBarRender from './sections/AnnouncementBarRender'
import CountdownTopBarRender from './sections/CountdownTopBarRender'
import TitreRender from './sections/TitreRender'
import NoteProduitRender from './sections/NoteProduitRender'
import PrixRender from './sections/PrixRender'
import DescriptionRender from './sections/DescriptionRender'
import OrderFormRender from './sections/OrderFormRender'
import StockUrgencyRender from './sections/StockUrgencyRender'
import BenefitsRender from './sections/BenefitsRender'
import TestimonialsRender from './sections/TestimonialsRender'
import TestimonialsFloatingRender from './sections/TestimonialsFloatingRender'
import ComparisonRender from './sections/ComparisonRender'
import FaqRender from './sections/FaqRender'
import FooterRender from './sections/FooterRender'
import TrustBarRender from './sections/TrustBarRender'
import MarqueeRender from './sections/MarqueeRender'
import VideoRender from './sections/VideoRender'
import ImageTextRender from './sections/ImageTextRender'
import TextBlockRender from './sections/TextBlockRender'
import CountdownRender from './sections/CountdownRender'
import BeforeAfterRender from './sections/BeforeAfterRender'
import StatsRender from './sections/StatsRender'
import GuaranteesRender from './sections/GuaranteesRender'
import MediasRender from './sections/MediasRender'
import HeaderRender from './sections/HeaderRender'
import { useState } from 'react'

interface PublicCanvasProps {
  builderJson: any
  products: any[]
  storeName?: string
}

function renderBlock(block: any, product: any) {
  if (block.hidden) return null
  const s = block.settings || {}

  switch (block.type) {
    case 'AnnouncementBar':
    case 'announcement_bar':
      return <AnnouncementBarRender settings={s} />
    case 'countdown_top_bar':
      return <CountdownTopBarRender settings={s} />
    case 'Header':
    case 'header':
      return <HeaderRender settings={s} />
    case 'trust_bar':
      return <TrustBarRender settings={s} />
    case 'marquee':
      return <MarqueeRender settings={s} />
    case 'countdown':
      return <CountdownRender settings={s} />
    case 'stock_urgency':
      return <StockUrgencyRender settings={s} />
    case 'Titre':
      return <TitreRender settings={s} product={product} />
    case 'Note de produit':
      return <NoteProduitRender settings={s} />
    case 'Prix':
      return <PrixRender settings={s} product={product} />
    case 'Description':
      return <DescriptionRender settings={s} product={product} />
    case 'OrderForm':
    case 'order_form':
      return <OrderFormRender settings={s} />
    case 'benefits':
    case 'icon_grid':
      return <BenefitsRender settings={s} />
    case 'before_after':
      return <BeforeAfterRender settings={s} />
    case 'testimonials':
      return <TestimonialsRender settings={s} />
    case 'testimonials_floating':
      return <TestimonialsFloatingRender settings={s} />
    case 'comparison':
    case 'comparison_table':
      return <ComparisonRender settings={s} />
    case 'faq':
      return <FaqRender settings={s} />
    case 'stats':
      return <StatsRender settings={s} />
    case 'guarantees':
      return <GuaranteesRender settings={s} />
    case 'image_text':
    case 'image_with_text':
      return <ImageTextRender settings={s} />
    case 'video':
      return <VideoRender settings={s} />
    case 'text_block':
      return <TextBlockRender settings={s} />
    case 'spacer':
      return <div style={{ height: s.height || 48 }} />
    case 'Footer':
    case 'footer':
      return <FooterRender settings={s} />
    default:
      return null
  }
}

const PRODUCT_BLOCK_TYPES = ['Titre', 'Note de produit', 'Prix', 'Description']

export default function PublicCanvas({ builderJson, products, storeName }: PublicCanvasProps) {
  const product = products?.[0] || null

  const { header = [], template = [], footer = [] } = builderJson

  const productBlocks = template.filter((b: any) => PRODUCT_BLOCK_TYPES.includes(b.type))
  const sectionBlocks = template.filter((b: any) => !PRODUCT_BLOCK_TYPES.includes(b.type))

  const productImages: string[] = product?.images?.length
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : []

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#FFF8F3', minHeight: '100vh', color: '#3A2A2E' }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        img { max-width: 100%; display: block; }

        /* ── Responsive helpers ── */
        @media (max-width: 768px) {
          .public-product-grid { flex-direction: column !important; }
          .public-product-grid > * { width: 100% !important; }
          .public-product-info { padding-top: 1.5rem !important; }
        }
      `}</style>

      {/* HEADER */}
      {header.map((block: any) => (
        <div key={block.id}>{renderBlock(block, product)}</div>
      ))}

      {/* PRODUCT SECTION */}
      {product && (
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 24px' }}>
          <div
            className="public-product-grid"
            style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}
          >
            {/* LEFT — Images */}
            <div style={{ width: '50%', flexShrink: 0 }}>
              <MediasRender settings={{ images: productImages }} />
            </div>

            {/* RIGHT — Product info blocks */}
            <div className="public-product-info" style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {productBlocks.map((block: any) => (
                <div key={block.id}>{renderBlock(block, product)}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTIONS */}
      <div>
        {sectionBlocks.map((block: any) => (
          <div key={block.id}>{renderBlock(block, product)}</div>
        ))}
      </div>

      {/* FOOTER */}
      {footer.map((block: any) => (
        <div key={block.id}>{renderBlock(block, product)}</div>
      ))}
    </div>
  )
}
