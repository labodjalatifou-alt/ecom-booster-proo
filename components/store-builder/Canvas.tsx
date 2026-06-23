'use client'

import React from 'react'
import type { EditorData, EditorBlock } from './Editor'
import AnnouncementBarRender from './sections/AnnouncementBarRender'
import HeaderRender from './sections/HeaderRender'
import MediasRender from './sections/MediasRender'
import CountdownRender from './sections/CountdownRender'
import TestimonialsRender from './sections/TestimonialsRender'
import TestimonialsFloatingRender from './sections/TestimonialsFloatingRender'
import BenefitsRender from './sections/BenefitsRender'
import BeforeAfterRender from './sections/BeforeAfterRender'
import ComparisonRender from './sections/ComparisonRender'
import StatsRender from './sections/StatsRender'
import FaqRender from './sections/FaqRender'
import GuaranteesRender from './sections/GuaranteesRender'
import TrustBarRender from './sections/TrustBarRender'
import StockUrgencyRender from './sections/StockUrgencyRender'
import MarqueeRender from './sections/MarqueeRender'
import ImageTextRender from './sections/ImageTextRender'
import VideoRender from './sections/VideoRender'
import FooterRender from './sections/FooterRender'
import TextBlockRender from './sections/TextBlockRender'
import TitreRender from './sections/TitreRender'
import NoteProduitRender from './sections/NoteProduitRender'
import PrixRender from './sections/PrixRender'
import DescriptionRender from './sections/DescriptionRender'
import OrderFormRender from './sections/OrderFormRender'
import ProductSectionRender from './sections/ProductSectionRender'
import CountdownTopBarRender from './sections/CountdownTopBarRender'

interface CanvasProps {
  data: EditorData
  selectedBlockId: string | null
  previewMode: 'desktop' | 'mobile'
  onSelectBlock: (id: string) => void
  products?: any[]
  selectedProductId?: string | null
  themeSettings?: Record<string, any>
}

export default function Canvas({
  data,
  selectedBlockId,
  previewMode,
  onSelectBlock,
  products,
  selectedProductId,
  themeSettings,
}: CanvasProps) {
  const product = selectedProductId
    ? products?.find((p) => p.id === selectedProductId) || products?.[0]
    : products?.[0] || null

  const BlockWrapper = ({ block, children }: { block: EditorBlock; children: React.ReactNode }) => {
    if (block.hidden) return null
    const isSelected = selectedBlockId === block.id
    return (
      <div
        className={`relative group cursor-pointer transition-shadow ${
          isSelected
            ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white'
            : 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-indigo-300 hover:outline-offset-2'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelectBlock(block.id)
        }}
      >
        <div
          className={`absolute -top-6 left-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-t-md z-50 transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {block.title}
        </div>
        {children}
      </div>
    )
  }

  const renderBlockContent = (block: EditorBlock) => {
    switch (block.type) {
      case 'AnnouncementBar':
      case 'announcement_bar':
        return <AnnouncementBarRender settings={block.settings} />
      case 'Header':
      case 'header':
        return <HeaderRender settings={block.settings} />
      case 'countdown':
        return <CountdownRender settings={block.settings} />
      case 'testimonials':
        return <TestimonialsRender settings={block.settings} />
      case 'testimonials_floating':
        return <TestimonialsFloatingRender settings={block.settings} />
      case 'benefits':
      case 'icon_grid':
        return <BenefitsRender settings={block.settings} />
      case 'before_after':
        return <BeforeAfterRender settings={block.settings} />
      case 'comparison':
      case 'comparison_table':
        return <ComparisonRender settings={block.settings} />
      case 'stats':
        return <StatsRender settings={block.settings} />
      case 'faq':
        return <FaqRender settings={block.settings} />
      case 'guarantees':
        return <GuaranteesRender settings={block.settings} />
      case 'trust_bar':
        return <TrustBarRender settings={block.settings} />
      case 'stock_urgency':
        return <StockUrgencyRender settings={block.settings} />
      case 'marquee':
        return <MarqueeRender settings={block.settings} />
      case 'image_text':
      case 'image_with_text':
        return <ImageTextRender settings={block.settings} />
      case 'video':
        return <VideoRender settings={block.settings} />
      case 'text_block':
        return <TextBlockRender settings={block.settings} />
      case 'spacer':
        return <div style={{ height: block.settings?.height || 48 }} />
      case 'Footer':
      case 'footer':
        return <FooterRender settings={block.settings} />

      // Product info blocks
      case 'Titre':
        return <TitreRender settings={block.settings} product={product} />
      case 'Note de produit':
        return <NoteProduitRender settings={block.settings} />
      case 'Prix':
        return <PrixRender settings={block.settings} product={product} />
      case 'Description':
        return <DescriptionRender settings={block.settings} product={product} />
      case 'OrderForm':
      case 'order_form':
        return <OrderFormRender settings={block.settings} />

      case 'countdown_top_bar':
        return <CountdownTopBarRender settings={block.settings} />

      default:
        return (
          <div className="p-8 my-4 bg-indigo-50 text-indigo-500 rounded-3xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center">
            <span className="font-bold mb-1">{block.type}</span>
            <span className="text-sm opacity-80">Section en construction</span>
          </div>
        )
    }
  }

  const PRODUCT_BLOCK_TYPES = ['Titre', 'Note de produit', 'Prix', 'Description']
  const productBlocks = data.template.filter((b) => PRODUCT_BLOCK_TYPES.includes(b.type))
  const sectionBlocks = data.template.filter((b) => !PRODUCT_BLOCK_TYPES.includes(b.type))

  if (!product) {
    return (
      <div
        className="flex-1 bg-[#eceef1] flex items-center justify-center p-8 relative"
        onClick={() => onSelectBlock('')}
      >
        <div
          className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aucun produit</h2>
          <p className="text-gray-500 text-sm">
            Ajoutez un produit depuis la section Produits pour prévisualiser votre boutique.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex-1 bg-[#eceef1] overflow-y-auto p-4 flex flex-col items-center custom-scrollbar relative"
      onClick={() => onSelectBlock('')}
      style={{
        // Allow theme settings to propagate via CSS vars
        '--color-primary': themeSettings?.primaryColor || '#6366f1',
        '--color-secondary': themeSettings?.secondaryColor || '#f3f4f6',
        '--color-bg': themeSettings?.backgroundColor || '#ffffff',
        '--color-text': themeSettings?.textColor || '#111827',
        fontFamily: themeSettings?.fontFamily || 'Inter, sans-serif',
      } as React.CSSProperties}
    >
      <div
        className={`bg-white shadow-xl transition-all duration-300 relative overflow-hidden ${
          previewMode === 'mobile'
            ? 'w-[390px] rounded-[2.5rem] border-[8px] border-gray-900 my-4'
            : 'w-full max-w-[1400px] min-h-full rounded-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        {data.header.map((block) => (
          <BlockWrapper key={block.id} block={block}>
            {renderBlockContent(block)}
          </BlockWrapper>
        ))}

        {/* BODY */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Main 2-col product layout */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mb-16">
            <div className="w-full md:w-1/2 flex-shrink-0">
              <MediasRender
                settings={{
                  images: product?.images && product.images.length > 0
                    ? product.images
                    : product?.image_url
                    ? [product.image_url]
                    : [],
                }}
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col">
              {productBlocks.map((block) => (
                <BlockWrapper key={block.id} block={block}>
                  {renderBlockContent(block)}
                </BlockWrapper>
              ))}
            </div>
          </div>

          {/* Additional sections */}
          <div className="flex flex-col gap-10 md:gap-14">
            {sectionBlocks.map((block) => (
              <BlockWrapper key={block.id} block={block}>
                {renderBlockContent(block)}
              </BlockWrapper>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        {data.footer.map((block) => (
          <BlockWrapper key={block.id} block={block}>
            {renderBlockContent(block)}
          </BlockWrapper>
        ))}
      </div>
    </div>
  )
}
