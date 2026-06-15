// ============================================
// STORE BUILDER — Defaults & Catalogue
// lib/store-builder/defaults.ts
// ============================================

import type {
  SectionCatalogItem,
  SectionType,
  StoreColors,
  StoreFonts,
  ThemePreview,
  HeroProps,
  ProductProps,
  CountdownProps,
  OrderFormProps,
  TestimonialsProps,
  BenefitsProps,
  GalleryProps,
  FaqProps,
  BadgeTrustProps,
  VideoProps,
  TextBlockProps,
  SpacerProps,
  FooterProps,
} from './types'

// ============================================
// COULEURS PAR DÉFAUT
// ============================================

export const DEFAULT_COLORS: StoreColors = {
  primary: '#6366f1',
  secondary: '#f8fafc',
  accent: '#f59e0b',
  text: '#111827',
  textLight: '#6b7280',
  bg: '#ffffff',
  bgSection: '#f9fafb',
  border: '#e5e7eb',
  success: '#10b981',
  danger: '#ef4444',
}

export const DEFAULT_FONTS: StoreFonts = {
  heading: 'Inter',
  body: 'Inter',
}

// ============================================
// PROPS PAR DÉFAUT DE CHAQUE SECTION
// ============================================

export const DEFAULT_HERO_PROPS: HeroProps = {
  headline: 'Titre accrocheur de votre produit',
  subheadline: 'Décrivez en une phrase le bénéfice principal de votre offre',
  cta_text: 'Commander maintenant',
  cta_link: '#order-form',
  image_url: '',
  image_position: 'right',
  overlay_opacity: 0.4,
  text_align: 'left',
  bg_color: '#ffffff',
  text_color: '#111827',
  animation: 'fadeIn',
}

export const DEFAULT_PRODUCT_PROPS: ProductProps = {
  product_id: '',
  show_price: true,
  show_compare_price: true,
  show_description: true,
  show_images: true,
  show_variants: true,
  show_stock: false,
  cta_text: 'Ajouter au panier',
  cta_color: '#6366f1',
  layout: 'split',
}

export const DEFAULT_COUNTDOWN_PROPS: CountdownProps = {
  target_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  title: 'Offre limitée — Se termine dans :',
  show_days: true,
  show_hours: true,
  show_minutes: true,
  show_seconds: true,
  bg_color: '#1e1b4b',
  text_color: '#ffffff',
  timer_bg: '#312e81',
  on_expire: 'reset',
  expire_message: "L'offre est terminée",
}

export const DEFAULT_ORDER_FORM_PROPS: OrderFormProps = {
  title: 'Passer votre commande',
  fields: [
    {
      id: 'field-name',
      type: 'text',
      label: 'Nom complet',
      placeholder: 'Votre nom et prénom',
      required: true,
    },
    {
      id: 'field-phone',
      type: 'tel',
      label: 'Téléphone',
      placeholder: 'Ex: +224 620 000 000',
      required: true,
    },
    {
      id: 'field-address',
      type: 'text',
      label: 'Adresse de livraison',
      placeholder: 'Quartier, ville',
      required: true,
    },
  ],
  submit_text: 'Confirmer ma commande',
  submit_color: '#6366f1',
  submit_text_color: '#ffffff',
  success_message: 'Merci ! Votre commande a été reçue. Nous vous contacterons bientôt.',
  bg_color: '#f9fafb',
  border_radius: 12,
  show_product_summary: true,
}

export const DEFAULT_TESTIMONIALS_PROPS: TestimonialsProps = {
  title: 'Ce que disent nos clients',
  items: [
    {
      id: 'testi-1',
      name: 'Aminata K.',
      text: 'Produit de très bonne qualité, livraison rapide. Je recommande vraiment !',
      avatar_url: '',
      rating: 5,
      location: 'Conakry',
    },
    {
      id: 'testi-2',
      name: 'Moussa D.',
      text: 'Excellent service client, le produit correspond parfaitement à la description.',
      avatar_url: '',
      rating: 5,
      location: 'Lomé',
    },
    {
      id: 'testi-3',
      name: 'Fatoumata B.',
      text: 'Je suis très satisfaite de mon achat. Je commanderai à nouveau sans hésiter.',
      avatar_url: '',
      rating: 4,
      location: 'Dakar',
    },
  ],
  layout: 'grid',
  bg_color: '#ffffff',
  show_stars: true,
  stars_count: 5,
}

export const DEFAULT_BENEFITS_PROPS: BenefitsProps = {
  title: 'Pourquoi choisir notre produit ?',
  items: [
    { id: 'b-1', icon: '🚚', title: 'Livraison rapide', text: 'Recevez votre commande en 2-5 jours' },
    { id: 'b-2', icon: '✅', title: 'Qualité garantie', text: 'Produits testés et approuvés' },
    { id: 'b-3', icon: '🔒', title: 'Paiement sécurisé', text: 'Paiement à la livraison disponible' },
    { id: 'b-4', icon: '💬', title: 'Support 24/7', text: 'Notre équipe est toujours disponible' },
  ],
  layout: 'row',
  icon_color: '#6366f1',
  bg_color: '#f9fafb',
}

export const DEFAULT_GALLERY_PROPS: GalleryProps = {
  images: [],
  columns: 3,
  gap: 12,
  border_radius: 8,
}

export const DEFAULT_FAQ_PROPS: FaqProps = {
  title: 'Questions fréquentes',
  items: [
    {
      id: 'faq-1',
      question: 'Quels sont les délais de livraison ?',
      answer: 'Nous livrons en 2 à 5 jours ouvrables selon votre localisation.',
    },
    {
      id: 'faq-2',
      question: 'Comment passer une commande ?',
      answer: 'Remplissez simplement le formulaire ci-dessus et notre équipe vous contactera pour confirmer.',
    },
    {
      id: 'faq-3',
      question: 'Puis-je payer à la livraison ?',
      answer: 'Oui, le paiement à la livraison est disponible dans toutes nos zones de livraison.',
    },
  ],
  bg_color: '#ffffff',
  accent_color: '#6366f1',
}

export const DEFAULT_BADGE_TRUST_PROPS: BadgeTrustProps = {
  items: [
    { id: 'badge-1', icon: '🛡️', text: 'Paiement sécurisé' },
    { id: 'badge-2', icon: '📦', text: 'Livraison garantie' },
    { id: 'badge-3', icon: '↩️', text: 'Retour facile' },
    { id: 'badge-4', icon: '⭐', text: '4.9/5 satisfaction' },
  ],
  layout: 'row',
  bg_color: '#f9fafb',
  icon_color: '#6366f1',
}

export const DEFAULT_VIDEO_PROPS: VideoProps = {
  url: '',
  title: 'Découvrez notre produit en vidéo',
  autoplay: false,
  loop: false,
  muted: true,
}

export const DEFAULT_TEXT_BLOCK_PROPS: TextBlockProps = {
  content: 'Ajoutez votre texte ici. Décrivez votre produit, votre histoire ou votre offre.',
  text_align: 'center',
  bg_color: '#ffffff',
  text_color: '#374151',
  max_width: 720,
}

export const DEFAULT_SPACER_PROPS: SpacerProps = {
  height: 48,
  bg_color: 'transparent',
}

export const DEFAULT_FOOTER_PROPS: FooterProps = {
  text: '© 2025 Ma Boutique. Tous droits réservés.',
  links: [
    { label: 'Politique de confidentialité', url: '#' },
    { label: 'Conditions générales', url: '#' },
    { label: 'Contact', url: '#' },
  ],
  bg_color: '#111827',
  text_color: '#9ca3af',
  show_whatsapp: true,
  whatsapp_number: '',
}

// ============================================
// CATALOGUE DES SECTIONS
// (affiché dans le panneau gauche de l'éditeur)
// ============================================

export const SECTIONS_CATALOG: SectionCatalogItem[] = [
  {
    type: 'hero',
    label: 'Hero / Bannière',
    icon: 'layout-2',
    description: 'Grande section d\'accroche avec titre, sous-titre et image',
    defaultProps: DEFAULT_HERO_PROPS,
  },
  {
    type: 'product',
    label: 'Fiche produit',
    icon: 'shopping-bag',
    description: 'Affiche votre produit avec images, prix et variantes',
    defaultProps: DEFAULT_PRODUCT_PROPS,
  },
  {
    type: 'countdown',
    label: 'Compte à rebours',
    icon: 'clock',
    description: 'Timer pour créer de l\'urgence sur votre offre',
    defaultProps: DEFAULT_COUNTDOWN_PROPS,
  },
  {
    type: 'order_form',
    label: 'Formulaire commande',
    icon: 'forms',
    description: 'Formulaire personnalisable pour recevoir les commandes',
    defaultProps: DEFAULT_ORDER_FORM_PROPS,
  },
  {
    type: 'testimonials',
    label: 'Témoignages',
    icon: 'message-circle',
    description: 'Avis et témoignages de vos clients',
    defaultProps: DEFAULT_TESTIMONIALS_PROPS,
  },
  {
    type: 'benefits',
    label: 'Avantages',
    icon: 'check-circle',
    description: 'Liste des bénéfices et points forts de votre offre',
    defaultProps: DEFAULT_BENEFITS_PROPS,
  },
  {
    type: 'gallery',
    label: 'Galerie photos',
    icon: 'photo',
    description: 'Grille d\'images de votre produit',
    defaultProps: DEFAULT_GALLERY_PROPS,
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: 'help-circle',
    description: 'Questions / réponses fréquentes',
    defaultProps: DEFAULT_FAQ_PROPS,
  },
  {
    type: 'badge_trust',
    label: 'Badges confiance',
    icon: 'shield-check',
    description: 'Icônes de réassurance : livraison, paiement, retour...',
    defaultProps: DEFAULT_BADGE_TRUST_PROPS,
  },
  {
    type: 'video',
    label: 'Vidéo',
    icon: 'player-play',
    description: 'Intégrez une vidéo YouTube ou MP4',
    defaultProps: DEFAULT_VIDEO_PROPS,
  },
  {
    type: 'text_block',
    label: 'Bloc texte',
    icon: 'text-size',
    description: 'Paragraphe de texte libre',
    defaultProps: DEFAULT_TEXT_BLOCK_PROPS,
  },
  {
    type: 'spacer',
    label: 'Espaceur',
    icon: 'separator',
    description: 'Espace vide pour aérer la page',
    defaultProps: DEFAULT_SPACER_PROPS,
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: 'layout-bottom-bar',
    description: 'Pied de page avec liens et mentions légales',
    defaultProps: DEFAULT_FOOTER_PROPS,
  },
]

// ============================================
// THÈMES DISPONIBLES
// ============================================

export const THEMES: ThemePreview[] = [
  {
    id: 'theme-alpha',
    name: 'Alpha',
    description: 'Moderne et épuré, parfait pour les produits tech et beauté',
    preview_image: '/themes/alpha-preview.jpg',
    tags: ['moderne', 'minimal', 'beauté'],
    default_colors: {
      primary: '#6366f1',
      secondary: '#f8fafc',
      accent: '#f59e0b',
      text: '#111827',
      textLight: '#6b7280',
      bg: '#ffffff',
      bgSection: '#f9fafb',
      border: '#e5e7eb',
      success: '#10b981',
      danger: '#ef4444',
    },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'theme-bold',
    name: 'Bold',
    description: 'Couleurs intenses, fort impact visuel pour les produits de santé',
    preview_image: '/themes/bold-preview.jpg',
    tags: ['santé', 'sport', 'impact'],
    default_colors: {
      primary: '#dc2626',
      secondary: '#fef2f2',
      accent: '#f97316',
      text: '#111827',
      textLight: '#6b7280',
      bg: '#ffffff',
      bgSection: '#fff7ed',
      border: '#fed7aa',
      success: '#16a34a',
      danger: '#dc2626',
    },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'theme-elegant',
    name: 'Élégant',
    description: 'Style luxe et sobre, idéal pour la mode et les cosmétiques premium',
    preview_image: '/themes/elegant-preview.jpg',
    tags: ['luxe', 'mode', 'premium'],
    default_colors: {
      primary: '#1c1917',
      secondary: '#fafaf9',
      accent: '#ca8a04',
      text: '#1c1917',
      textLight: '#78716c',
      bg: '#ffffff',
      bgSection: '#fafaf9',
      border: '#e7e5e4',
      success: '#15803d',
      danger: '#b91c1c',
    },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'theme-tropical',
    name: 'Tropical',
    description: 'Frais et coloré, adapté aux produits alimentaires et bien-être',
    preview_image: '/themes/tropical-preview.jpg',
    tags: ['alimentation', 'bien-être', 'naturel'],
    default_colors: {
      primary: '#059669',
      secondary: '#ecfdf5',
      accent: '#f59e0b',
      text: '#064e3b',
      textLight: '#6b7280',
      bg: '#ffffff',
      bgSection: '#f0fdf4',
      border: '#a7f3d0',
      success: '#059669',
      danger: '#dc2626',
    },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
]

// ============================================
// HELPER — générer un ID unique pour une section
// ============================================

export function generateSectionId(type: SectionType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
