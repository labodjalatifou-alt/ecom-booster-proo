import { BuilderSection, StoreColors, StoreFonts } from './types'
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
      primary: '#6d388b', // Couleur Shrine par défaut
      accent: '#dd1d1d',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    sections: [
      createSection('announcement_bar', {
        text: "LIVRAISON GRATUITE AUJOURD'HUI SEULEMENT ⚡",
        bg_color: '#000000',
        text_color: '#ffffff',
      }),
      createSection('product', {
        show_urgency: true,
        urgency_text: '🔥 Plus que 3 articles en stock !',
        show_stock_counter: true,
        cta_text: 'AJOUTER AU PANIER',
        cta_color: '#dd1d1d',
      }),
      createSection('icon_grid', {
        title: 'Pourquoi nous choisir ?',
        items: [
          { id: '1', icon: '🚚', title: 'Livraison Rapide', description: 'Chez vous en 48h' },
          { id: '2', icon: '🔒', title: 'Paiement Sécurisé', description: 'Visa, Mastercard, PayPal' },
          { id: '3', icon: '⭐', title: 'Qualité Premium', description: 'Matériaux certifiés' },
          { id: '4', icon: '↩️', title: 'Retours Faciles', description: "30 jours pour changer d'avis" },
        ]
      }),
      createSection('video', {
        title: 'Voyez-le en action',
        subtitle: 'Une démonstration vaut mille mots.',
      }),
      createSection('comparison_table', {
        title: 'Pourquoi sommes-nous différents ?',
        us_name: 'Notre Produit',
        them_name: 'Les Autres',
        features: [
          { id: '1', name: 'Matériaux durables', us: true, them: false },
          { id: '2', name: 'Garantie à vie', us: true, them: false },
          { id: '3', name: 'Design ergonomique', us: true, them: true },
        ]
      }),
      createSection('testimonials', {
        title: "Ils l'ont adopté",
        subtitle: 'Des milliers de clients satisfaits.',
        items: [
          { id: '1', name: 'Sophie L.', rating: 5, text: 'Produit incroyable, il a changé mon quotidien !' },
          { id: '2', name: 'Marc D.', rating: 5, text: 'La qualité est au rendez-vous. Je recommande.' },
          { id: '3', name: 'Julie M.', rating: 4, text: 'Très satisfaite de mon achat, livraison rapide.' },
        ]
      }),
      createSection('faq', {
        title: 'Questions Fréquentes',
      }),
      createSection('order_form', {
        title: 'Finaliser ma commande',
        subtitle: 'Entrez vos informations pour recevoir votre produit.',
        submit_text: 'COMMANDER MAINTENANT',
        submit_color: '#dd1d1d',
      }),
      createSection('footer', {
        text: '© 2024 Votre Marque. Tous droits réservés.',
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
