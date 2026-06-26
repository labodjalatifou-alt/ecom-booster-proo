import React from 'react'
import AnnouncementBarRender from '@/components/store-builder/sections/AnnouncementBarRender'
import HeaderRender from '@/components/store-builder/sections/HeaderRender'
import MediasRender from '@/components/store-builder/sections/MediasRender'
import CountdownRender from '@/components/store-builder/sections/CountdownRender'
import TestimonialsRender from '@/components/store-builder/sections/TestimonialsRender'
import TestimonialsFloatingRender from '@/components/store-builder/sections/TestimonialsFloatingRender'
import BenefitsRender from '@/components/store-builder/sections/BenefitsRender'
import BeforeAfterRender from '@/components/store-builder/sections/BeforeAfterRender'
import ComparisonRender from '@/components/store-builder/sections/ComparisonRender'
import StatsRender from '@/components/store-builder/sections/StatsRender'
import FaqRender from '@/components/store-builder/sections/FaqRender'
import GuaranteesRender from '@/components/store-builder/sections/GuaranteesRender'
import TrustBarRender from '@/components/store-builder/sections/TrustBarRender'
import StockUrgencyRender from '@/components/store-builder/sections/StockUrgencyRender'
import MarqueeRender from '@/components/store-builder/sections/MarqueeRender'
import ImageTextRender from '@/components/store-builder/sections/ImageTextRender'
import VideoRender from '@/components/store-builder/sections/VideoRender'
import FooterRender from '@/components/store-builder/sections/FooterRender'
import TextBlockRender from '@/components/store-builder/sections/TextBlockRender'
import TitreRender from '@/components/store-builder/sections/TitreRender'
import NoteProduitRender from '@/components/store-builder/sections/NoteProduitRender'
import PrixRender from '@/components/store-builder/sections/PrixRender'
import DescriptionRender from '@/components/store-builder/sections/DescriptionRender'
import OrderFormRender from '@/components/store-builder/sections/OrderFormRender'
import CountdownTopBarRender from '@/components/store-builder/sections/CountdownTopBarRender'

// Les blocks de type "produit" — affichent des données du produit sélectionné.
// Traités comme des sections normales dans le flux vertical (linéaire).
export const PRODUCT_BLOCK_TYPES = ['Titre', 'Note de produit', 'Prix', 'Description']

/**
 * Moteur de rendu partagé entre l'éditeur (Canvas) et la page publique (LandingRenderer).
 * Une seule source de vérité → le WYSIWYG est garanti : ce que tu vois = ce qui est publié.
 *
 * @param block  Le block { type, settings, ... }
 * @param product Le produit sélectionné pour la landing (ou null)
 * @param storeId L'id de la boutique (passé au formulaire de commande, page publique)
 */
export function renderBlock(block: any, product: any, storeId?: string | null): React.ReactNode {
  if (block.hidden) return null
  const s = block.settings || {}
  const settings = { ...s }

  switch (block.type) {
    // ── En-tête / structure ──
    case 'AnnouncementBar':
    case 'announcement_bar':
      return <AnnouncementBarRender settings={settings} />
    case 'Header':
    case 'header':
      return <HeaderRender settings={settings} />
    case 'Footer':
    case 'footer':
      return <FooterRender settings={settings} />
    case 'spacer':
      return <div style={{ height: s.height || 48 }} />

    // ── Galerie (déplaçable) ──
    case 'Galerie':
    case 'medias':
    case 'gallery': {
      const images: string[] = product?.images?.length
        ? product.images
        : product?.image_url
        ? [product.image_url]
        : []
      return <MediasRender settings={{ images }} />
    }

    // ── Marketing / urgence ──
    case 'countdown_top_bar':
      return <CountdownTopBarRender settings={settings} />
    case 'countdown':
      return <CountdownRender settings={settings} />
    case 'stock_urgency':
      return <StockUrgencyRender settings={settings} />
    case 'marquee':
      return <MarqueeRender settings={settings} />
    case 'stats':
      return <StatsRender settings={settings} />

    // ── Preuve sociale / confiance ──
    case 'testimonials':
      return <TestimonialsRender settings={settings} />
    case 'testimonials_floating':
      return <TestimonialsFloatingRender settings={settings} />
    case 'before_after':
      return <BeforeAfterRender settings={settings} />
    case 'comparison':
    case 'comparison_table':
      return <ComparisonRender settings={settings} />
    case 'benefits':
    case 'icon_grid':
      return <BenefitsRender settings={settings} />
    case 'guarantees':
      return <GuaranteesRender settings={settings} />
    case 'trust_bar':
      return <TrustBarRender settings={settings} />
    case 'faq':
      return <FaqRender settings={settings} />

    // ── Contenu ──
    case 'image_text':
    case 'image_with_text':
      return <ImageTextRender settings={settings} />
    case 'video':
      return <VideoRender settings={settings} />
    case 'text_block':
      return <TextBlockRender settings={settings} />

    // ── Infos produit (linéaires) ──
    case 'Titre':
      return <TitreRender settings={settings} product={product} />
    case 'Note de produit':
      return <NoteProduitRender settings={settings} />
    case 'Prix':
      return <PrixRender settings={settings} product={product} />
    case 'Description':
      return <DescriptionRender settings={settings} product={product} />
    case 'OrderForm':
    case 'order_form':
      return <OrderFormRender settings={settings} product={product} storeId={storeId} />

    default:
      return null
  }
}
