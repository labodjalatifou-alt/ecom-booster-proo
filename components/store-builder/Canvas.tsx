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
  themeSettings?: Record<string, any>
}

const FALLBACK_PRODUCT = {
  id: 'preview',
  title: 'Nom de votre Produit (Aperçu)',
  price: '19900',
  compare_at_price: '39900',
  description: 'Ceci est un produit d\'exemple pour vous permettre de configurer le design de votre boutique. Ajoutez un vrai produit depuis l\'onglet "Produits".',
  images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80']
}

export default function Canvas({ data, selectedBlockId, previewMode, onSelectBlock, products, themeSettings }: CanvasProps) {
  
  const product = products && products.length > 0 ? products[0] : FALLBACK_PRODUCT
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
      case 'AnnouncementBar':
      case 'announcement_bar': return <AnnouncementBarRender settings={block.settings} />
      case 'Header':
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
      case 'OrderForm':
      case 'order_form':
        return (
          <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{block.settings.title || 'Formulaire de commande'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 pointer-events-none" placeholder="Ex: Jean Dupont" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 pointer-events-none" placeholder="Ex: 01 23 45 67 89" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
                <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 pointer-events-none" rows={3} placeholder="Ex: 123 rue de la République, 75001 Paris" />
              </div>
              <button className="w-full py-3 rounded-xl text-white font-bold text-lg shadow-md" style={{ backgroundColor: block.settings.btn_color || '#ef4444' }}>
                {block.settings.btn_text || 'Commander'}
              </button>
            </div>
          </div>
        )
      case 'IconGrid':
      case 'icon_grid':
      case 'Product':
      case 'product':
      default:
        return (
          <div className="p-8 my-4 bg-blue-50 text-blue-500 rounded-xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center">
            <span className="font-bold mb-1">{block.type}</span>
            <span className="text-sm opacity-80">Section en construction (Placeholder)</span>
          </div>
        )
    }
  }

  // Filter core blocks
  const productBlocks = data.template.filter(b => ['Titre', 'Note de produit', 'Prix', 'Boutons d\'achat', 'Description'].includes(b.type))
  const sectionBlocks = data.template.filter(b => !['Titre', 'Note de produit', 'Prix', 'Boutons d\'achat', 'Description'].includes(b.type))

  return (
    <div className="flex-1 bg-[#e5e7eb] overflow-y-auto p-4 flex flex-col items-center custom-scrollbar relative" onClick={() => onSelectBlock('')}>
      
      {/* Wrapper */}
      <div 
        className={`bg-white shadow-xl transition-all duration-300 relative ${
          previewMode === 'mobile' 
            ? 'w-[390px] rounded-[2rem] overflow-hidden border-[8px] border-gray-900 my-4' 
            : 'w-full max-w-[1920px] min-h-full'
        }`}
        style={{
          '--color-primary': themeSettings?.primaryColor || '#000000',
          '--color-secondary': themeSettings?.secondaryColor || '#f3f4f6',
          '--color-bg': themeSettings?.backgroundColor || '#ffffff',
          '--color-text': themeSettings?.textColor || '#111827',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
          fontFamily: themeSettings?.fontFamily || 'Inter, sans-serif'
        } as React.CSSProperties}
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
