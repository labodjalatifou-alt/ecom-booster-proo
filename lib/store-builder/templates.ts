// @ts-nocheck
import type { BuilderSection, StoreColors, StoreFonts } from './types'
import { SECTIONS_CATALOG, generateSectionId, DEFAULT_COLORS, DEFAULT_FONTS } from './defaults'

export interface StoreTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  category: 'mono-product' | 'storefront' | 'lead-gen'
  colors: StoreColors
  fonts: StoreFonts
  sections: BuilderSection[]
}

function createSection(type: string, propsOverride: any = {}): BuilderSection {
  const catalogItem = SECTIONS_CATALOG.find(item => item.type === type)
  return {
    id: generateSectionId(type as any),
    type: type as any,
    visible: true,
    props: { ...catalogItem?.defaultProps, ...propsOverride },
  }
}

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: 'shrine-mono-product',
    name: 'Shrine Pro - Mono Produit',
    description: 'Structure optimisée pour la conversion avec un seul produit phare.',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'mono-product',
    colors: {
      ...DEFAULT_COLORS,
      primary: '#C23A5E',
      accent: '#E8527A',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    sections: [
      createSection('countdown_top_bar', {
        label: 'Offre',
        discount_text: '-39%',
        suffix: 'se termine dans',
        bg_color: '#3A2A2E',
      }),
      createSection('Titre', {}),
      createSection('Note de produit', { rating: 5, reviews_count: '128 avis' }),
      createSection('Prix', { show_badge: true, badge_text: 'Promo' }),
      createSection('stock_urgency', {
        message: 'Il ne reste que 6 articles en stock',
        show_sold_count: true,
        sold_text: '32 vendus aujourd\'hui',
      }),
      createSection('OrderForm', {
        title: 'Finaliser ma commande',
        btn_text: 'COMMANDER MAINTENANT',
        btn_color: '#C23A5E',
        shake_animation: true,
      }),
      createSection('Description', {}),
      createSection('icon_grid', {
        title: 'Pourquoi nous choisir ?',
        items: [
          { id: '1', icon: '🚚', title: 'Livraison Rapide', description: 'Chez vous en 48h' },
          { id: '2', icon: '🔒', title: 'Paiement Sécurisé', description: 'À la livraison' },
          { id: '3', icon: '⭐', title: 'Qualité Premium', description: 'Matériaux certifiés' },
          { id: '4', icon: '↩️', title: 'Retours Faciles', description: "30 jours pour changer d'avis" },
        ]
      }),
      createSection('before_after', {
        title: 'Le résultat parle de lui-même',
      }),
      createSection('testimonials_floating', {
        title: 'Elles nous font confiance',
        items: [
          { id: '1', name: 'Sophie L.', rating: 5, text: 'Produit incroyable, il a changé mon quotidien !' },
          { id: '2', name: 'Marc D.', rating: 5, text: 'La qualité est au rendez-vous. Je recommande.' },
          { id: '3', name: 'Julie M.', rating: 4, text: 'Très satisfaite de mon achat, livraison rapide.' },
        ]
      }),
      createSection('comparison_table', {
        title: 'Pourquoi sommes-nous différents ?',
        our_label: 'Nous',
        competitor_label: 'Les Autres',
        rows: [
          { feature: 'Qualité premium', us: true, them: false },
          { feature: 'Paiement à la livraison', us: true, them: false },
          { feature: 'Livraison rapide', us: true, them: true },
        ]
      }),
      createSection('faq', {
        title: 'Questions Fréquentes',
      }),
      createSection('footer', {
        copyright: '© 2026 Votre Marque. Tous droits réservés.',
      }),
    ],
  },
  {
    id: 'shrine-storefront',
    name: 'Shrine Pro - Vitrine',
    description: 'Idéal pour une marque avec plusieurs collections de produits.',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    category: 'storefront',
    colors: {
      ...DEFAULT_COLORS,
      primary: '#111827',
      accent: '#f59e0b',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    sections: [
      createSection('announcement_bar', {
        text: 'NOUVELLE COLLECTION DISPONIBLE ✨',
      }),
      createSection('hero', {
        headline: "L'Élégance au Quotidien",
        subheadline: 'Découvrez notre nouvelle collection conçue pour allier confort et style.',
        cta_text: 'DÉCOUVRIR',
        bg_color: '#f3f4f6',
      }),
      createSection('marquee', {
        text: "SOLDES D'HIVER - JUSQU'À 50% DE RÉDUCTION",
        bg_color: '#111827',
        text_color: '#ffffff',
      }),
      createSection('product_grid', {
        title: 'Nos Bestsellers',
        subtitle: 'Les pièces préférées de notre communauté.',
      }),
      createSection('benefits', {
        title: 'Nos Engagements',
        items: [
          { id: '1', title: 'Éco-responsable', description: 'Matériaux recyclés et durables.' },
          { id: '2', title: 'Fait main', description: 'Savoir-faire artisanal.' },
          { id: '3', title: 'Design exclusif', description: 'Créé dans nos studios.' },
        ]
      }),
      createSection('newsletter', {
        title: 'Rejoignez le Club',
        subtitle: 'Inscrivez-vous pour recevoir des offres exclusives.',
      }),
      createSection('footer'),
    ],
  }
]