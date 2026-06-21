'use client'

import React from 'react'
import type { EditorData, EditorBlock } from './Editor'
import AnnouncementBarRender from './sections/AnnouncementBarRender'
import HeaderRender from './sections/HeaderRender'
import MediasRender from './sections/MediasRender'
import CountdownRender from './sections/CountdownRender'
import TestimonialsRender from './sections/TestimonialsRender'
import BenefitsRender from './sections/BenefitsRender'
import BeforeAfterRender from './sections/BeforeAfterRender'
import ComparisonRender from './sections/ComparisonRender'
import StatsRender from './sections/StatsRender'
import FaqRender from './sections/FaqRender'
import GuaranteesRender from './sections/GuaranteesRender'
import MarqueeRender from './sections/MarqueeRender'
import ImageTextRender from './sections/ImageTextRender'
import VideoRender from './sections/VideoRender'
import FooterRender from './sections/FooterRender'
import TextBlockRender from './sections/TextBlockRender'
import { Star } from 'lucide-react'

interface CanvasProps {
  data: EditorData
  selectedBlockId: string | null
  previewMode: 'desktop' | 'mobile'
  onSelectBlock: (id: string) => void
  products?: any[]
}

export default function Canvas({ data, selectedBlockId, previewMode, onSelectBlock, products }: CanvasProps) {
  
  const product = products && products.length > 0 ? products[0] : null
  const BlockWrapper = ({ block, children }: { block: EditorBlock, children: React.ReactNode }) => {
    if (block.hidden) return null
    
    const isSelected = selectedBlockId === block.id
    
    return (
      <div 
        className={`relative group cursor-pointer ${isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400 hover:outline-offset-1'}`}
        onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
      >
        {(isSelected || true) && (
          <div className={`absolute -top-6 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-t z-50 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {block.title} {isSelected && '(Sélectionné)'}
          </div>
        )}
        {children}
      </div>
    )
  }

  const renderBlockContent = (block: EditorBlock) => {
    switch (block.type) {
      case 'announcement_bar': return <AnnouncementBarRender settings={block.settings} />
      case 'header': return <HeaderRender settings={block.settings} />
      case 'countdown': return <CountdownRender settings={block.settings} />
      case 'testimonials': return <TestimonialsRender settings={block.settings} />
      case 'benefits': return <BenefitsRender settings={block.settings} />
      case 'before_after': return <BeforeAfterRender settings={block.settings} />
      case 'comparison': return <ComparisonRender settings={block.settings} />
      case 'stats': return <StatsRender settings={block.settings} />
      case 'faq': return <FaqRender settings={block.settings} />
      case 'guarantees': return <GuaranteesRender settings={block.settings} />
      case 'marquee': return <MarqueeRender settings={block.settings} />
      case 'image_text': return <ImageTextRender settings={block.settings} />
      case 'video': return <VideoRender settings={block.settings} />
      case 'text_block': return <TextBlockRender settings={block.settings} />
      case 'spacer': return <div style={{ height: block.settings.height || 48 }} />
      case 'Footer':
      case 'footer': return <FooterRender settings={block.settings} />
      
      // Inline simple product blocks
      case 'Titre': 
        return <h1 className={`font-black text-gray-900 ${block.settings.size || 'text-3xl'}`} style={{ color: block.settings.color }}>{block.settings.text || product?.title || 'Titre du produit'}</h1>
      case 'Note de produit':
        if (block.settings.show === false) return null
        return (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-400">
              {Array.from({length: 5}).map((_, i) => <Star key={i} size={16} fill={i < (block.settings.rating || 5) ? 'currentColor' : 'none'} />)}
            </div>
            <span className="text-sm font-medium text-gray-600">{block.settings.reviews_count || '128 avis'}</span>
          </div>
        )
      case 'Prix':
        return (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-900">{block.settings.price || (product?.price ? `${product.price} FCFA` : '15000 FCFA')}</span>
            {(block.settings.compare_at_price || product?.compare_at_price) && (
              <span className="text-lg text-gray-400 line-through">{block.settings.compare_at_price || `${product?.compare_at_price} FCFA`}</span>
            )}
            {block.settings.show_badge && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">{block.settings.badge_text || '-50%'}</span>
            )}
          </div>
        )
      case 'Boutons d\'achat':
        return (
          <div className="flex flex-col gap-3 my-4">
            <button className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: block.settings.btn_main_color || '#ef4444' }}>
              {block.settings.btn_main_text || 'Commander maintenant'}
            </button>
            {block.settings.show_btn_sub && (
              <button className="w-full py-3 rounded-xl text-gray-700 bg-gray-100 font-bold hover:bg-gray-200 transition-colors">
                {block.settings.btn_sub_text || 'Ajouter au panier'}
              </button>
            )}
          </div>
        )
      case 'Description':
        return (
          <div className="prose text-gray-600 whitespace-pre-wrap text-sm md:text-base my-6" dangerouslySetInnerHTML={{ __html: block.settings.content || product?.description || 'Description détaillée de votre produit...' }} />
        )
      default:
        return <div className="p-4 bg-red-50 text-red-500 rounded border border-red-200">Type de bloc inconnu: {block.type}</div>
    }
  }

  // Filter core blocks
  const productBlocks = data.template.filter(b => ['Titre', 'Note de produit', 'Prix', 'Boutons d\'achat', 'Description'].includes(b.type))
  const sectionBlocks = data.template.filter(b => !['Titre', 'Note de produit', 'Prix', 'Boutons d\'achat', 'Description'].includes(b.type))

  if (!product) {
    return (
      <div className="flex-1 bg-[#e5e7eb] flex items-center justify-center p-8 relative" onClick={() => onSelectBlock('')}>
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aucun produit</h2>
          <p className="text-gray-500">Ajoutez un produit depuis la section Produits pour prévisualiser votre boutique.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#e5e7eb] overflow-y-auto p-4 flex flex-col items-center custom-scrollbar relative" onClick={() => onSelectBlock('')}>
      
      {/* Wrapper */}
      <div 
        className={`bg-white shadow-xl transition-all duration-300 relative ${
          previewMode === 'mobile' 
            ? 'w-[390px] rounded-[2rem] overflow-hidden border-[8px] border-gray-900 my-4' 
            : 'w-full max-w-[1920px] min-h-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        {data.header.map(block => (
          <BlockWrapper key={block.id} block={block}>
            {renderBlockContent(block)}
          </BlockWrapper>
        ))}

        {/* BODY */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Main Product Layout: 2 Cols Desktop, 1 Col Mobile */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-12">
            
            {/* Medias Column */}
            <div className="w-full md:w-1/2 flex-shrink-0">
              <MediasRender settings={{ images: product?.images || (product?.image_url ? [product.image_url] : undefined) }} />
            </div>

            {/* Product Info Column */}
            <div className="w-full md:w-1/2 flex flex-col">
              {productBlocks.map(block => (
                <BlockWrapper key={block.id} block={block}>
                  {renderBlockContent(block)}
                </BlockWrapper>
              ))}
            </div>

          </div>

          {/* Additional Sections */}
          <div className="flex flex-col gap-8">
            {sectionBlocks.map(block => (
              <BlockWrapper key={block.id} block={block}>
                {renderBlockContent(block)}
              </BlockWrapper>
            ))}
          </div>

        </div>

        {/* FOOTER */}
        {data.footer.map(block => (
          <BlockWrapper key={block.id} block={block}>
            {renderBlockContent(block)}
          </BlockWrapper>
        ))}

      </div>

    </div>
  )
}
