// ============================================
// STORE BUILDER — Defaults & Catalogue (v2 — 25 sections)
// lib/store-builder/defaults.ts
// ============================================
// @ts-nocheck

import type {
  SectionCatalogItem,
  SectionType,
  StoreColors,
  StoreFonts,
  ThemePreview,
  AnnouncementBarProps,
  HeroProps,
  MarqueeProps,
  ProductProps,
  CountdownProps,
  TestimonialsProps,
  BenefitsProps,
  BeforeAfterProps,
  StatsProps,
  GalleryProps,
  FaqProps,
  ComparisonTableProps,
  GuaranteesProps,
  VideoProps,
  ImageWithTextProps,
  OrderFormProps,
  PricingTableProps,
  NewsletterProps,
  SlideshowProps,
  IconGridProps,
  ProductGridProps,
  TextBlockProps,
  SpacerProps,
  PopupProps,
  FooterProps,
} from './types'

// ============================================
// COULEURS & FONTS PAR DÉFAUT
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
// DEFAULT PROPS
// ============================================

export const DEFAULT_ANNOUNCEMENT_BAR_PROPS: AnnouncementBarProps = {
  messages: ['🚀 Livraison gratuite dès 50 000 FCFA', '⭐ 4.9/5 sur 2000+ avis', '🎁 Cadeau offert pour toute commande'],
  bg_color: '#1e1b4b',
  text_color: '#ffffff',
  speed: 30,
  show_close: true,
}

export const DEFAULT_HERO_PROPS: HeroProps = {
  headline: 'Titre accrocheur de votre produit',
  subheadline: 'Décrivez en une phrase le bénéfice principal de votre offre. Soyez précis et percutant.',
  badge_text: 'NOUVEAU',
  show_badge: true,
  badge_color: '#f59e0b',
  cta_text: 'Commander maintenant',
  cta_text_2: 'En savoir plus',
  cta_link: '#order-form',
  image_url: '',
  image_position: 'right',
  overlay_opacity: 0.4,
  text_align: 'left',
  bg_color: '#ffffff',
  text_color: '#111827',
  animation: 'fadeIn',
}

export const DEFAULT_MARQUEE_PROPS: MarqueeProps = {
  items: [
    { text: 'Livraison rapide', icon: '🚚' },
    { text: 'Qualité garantie', icon: '✅' },
    { text: 'Paiement sécurisé', icon: '🔒' },
    { text: 'Support 24/7', icon: '💬' },
    { text: '2000+ clients satisfaits', icon: '⭐' },
  ],
  speed: 40,
  bg_color: '#f9fafb',
  text_color: '#374151',
  direction: 'left',
}

export const DEFAULT_PRODUCT_PROPS: ProductProps = {
  product_id: '',
  layout: 'split',
  show_price: true,
  show_compare_price: true,
  show_description: true,
  show_images: true,
  show_variants: true,
  show_stock_counter: true,
  show_reviews_count: true,
  cta_text: 'Commander maintenant',
  cta_color: '#6366f1',
  urgency_text: '🔥 12 personnes regardent ce produit',
  show_urgency: true,
}

export const DEFAULT_COUNTDOWN_PROPS: CountdownProps = {
  target_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  title: 'Offre limitée — Se termine dans :',
  subtitle: 'Ne ratez pas cette opportunité unique !',
  show_days: true,
  show_hours: true,
  show_minutes: true,
  show_seconds: true,
  bg_color: '#1e1b4b',
  text_color: '#ffffff',
  timer_bg: '#312e81',
  accent_color: '#f59e0b',
  on_expire: 'reset',
  expire_message: "L'offre est terminée",
}

export const DEFAULT_TESTIMONIALS_PROPS: TestimonialsProps = {
  title: 'Ce que disent nos clients',
  subtitle: 'Plus de 2000 clients satisfaits dans toute l\'Afrique',
  items: [
    { id: 't1', name: 'Aminata K.', text: 'Produit de très bonne qualité, livraison rapide. Je recommande vraiment !', avatar_url: '', rating: 5, location: 'Conakry', date: '12 mai 2025', verified: true },
    { id: 't2', name: 'Moussa D.', text: 'Excellent service client, le produit correspond parfaitement à la description.', avatar_url: '', rating: 5, location: 'Lomé', date: '3 juin 2025', verified: true },
    { id: 't3', name: 'Fatoumata B.', text: 'Je suis très satisfaite de mon achat. Je commanderai à nouveau sans hésiter.', avatar_url: '', rating: 4, location: 'Dakar', date: '18 avril 2025', verified: false },
  ],
  layout: 'grid',
  bg_color: '#ffffff',
  show_stars: true,
  show_verified: true,
  show_photos: true,
}

export const DEFAULT_BENEFITS_PROPS: BenefitsProps = {
  title: 'Pourquoi choisir notre produit ?',
  subtitle: 'Des avantages pensés pour vous',
  items: [
    { id: 'b1', icon: '🚚', title: 'Livraison rapide', text: 'Recevez votre commande en 2-5 jours ouvrables', color: '#6366f1' },
    { id: 'b2', icon: '✅', title: 'Qualité garantie', text: 'Produits testés et approuvés par nos experts', color: '#10b981' },
    { id: 'b3', icon: '🔒', title: 'Paiement sécurisé', text: 'Paiement à la livraison disponible partout', color: '#f59e0b' },
    { id: 'b4', icon: '💬', title: 'Support 24/7', text: 'Notre équipe est toujours disponible pour vous', color: '#ec4899' },
  ],
  layout: 'grid',
  bg_color: '#f9fafb',
  icon_style: 'circle',
}

export const DEFAULT_BEFORE_AFTER_PROPS: BeforeAfterProps = {
  title: 'Voyez la différence par vous-même',
  before_image: '',
  after_image: '',
  before_label: 'Avant',
  after_label: 'Après',
  bg_color: '#ffffff',
}

export const DEFAULT_STATS_PROPS: StatsProps = {
  title: 'Nos chiffres parlent',
  items: [
    { id: 's1', number: 2000, suffix: '+', label: 'Clients satisfaits', icon: '😊' },
    { id: 's2', number: 98, suffix: '%', label: 'Taux de satisfaction', icon: '⭐' },
    { id: 's3', number: 5, suffix: 'j', label: 'Délai de livraison', icon: '🚚' },
    { id: 's4', number: 50, suffix: 'k+', label: 'Produits vendus', icon: '🛍️' },
  ],
  bg_color: '#1e1b4b',
  text_color: '#ffffff',
  accent_color: '#f59e0b',
}

export const DEFAULT_GALLERY_PROPS: GalleryProps = {
  title: 'Galerie',
  images: [],
  layout: 'grid',
  columns: 3,
  gap: 12,
  border_radius: 12,
  show_lightbox: true,
}

export const DEFAULT_FAQ_PROPS: FaqProps = {
  title: 'Questions fréquentes',
  subtitle: 'Tout ce que vous devez savoir',
  items: [
    { id: 'f1', question: 'Quels sont les délais de livraison ?', answer: 'Nous livrons en 2 à 5 jours ouvrables selon votre localisation.' },
    { id: 'f2', question: 'Comment passer une commande ?', answer: 'Remplissez simplement le formulaire et notre équipe vous contactera pour confirmer.' },
    { id: 'f3', question: 'Puis-je payer à la livraison ?', answer: 'Oui, le paiement à la livraison est disponible dans toutes nos zones.' },
  ],
  bg_color: '#ffffff',
  accent_color: '#6366f1',
  style: 'bordered',
}

export const DEFAULT_COMPARISON_TABLE_PROPS: ComparisonTableProps = {
  title: 'Pourquoi nous choisir ?',
  our_label: 'Nous',
  competitor_label: 'Concurrents',
  rows: [
    { feature: 'Qualité premium', us: true, them: false },
    { feature: 'Livraison rapide', us: true, them: false },
    { feature: 'Service après-vente', us: true, them: false },
    { feature: 'Prix compétitif', us: true, them: true },
    { feature: 'Garantie produit', us: true, them: false },
  ],
  bg_color: '#ffffff',
  accent_color: '#6366f1',
}

export const DEFAULT_GUARANTEES_PROPS: GuaranteesProps = {
  title: 'Nos garanties',
  items: [
    { id: 'g1', icon: '🛡️', title: 'Paiement sécurisé', text: 'Transaction 100% sécurisée' },
    { id: 'g2', icon: '📦', title: 'Livraison garantie', text: 'Suivi en temps réel' },
    { id: 'g3', icon: '↩️', title: 'Retour facile', text: '30 jours pour changer d\'avis' },
    { id: 'g4', icon: '⭐', title: 'Satisfaction client', text: '98% de clients satisfaits' },
  ],
  layout: 'row',
  bg_color: '#f9fafb',
  icon_color: '#6366f1',
  style: 'cards',
}

export const DEFAULT_VIDEO_PROPS: VideoProps = {
  title: 'Découvrez notre produit en vidéo',
  subtitle: 'Une démonstration vaut mille mots',
  url: '',
  poster_image: '',
  autoplay: false,
  loop: false,
  show_controls: true,
  aspect_ratio: '16:9',
  bg_color: '#111827',
}

export const DEFAULT_IMAGE_WITH_TEXT_PROPS: ImageWithTextProps = {
  title: 'Notre histoire',
  subtitle: 'Sous-titre de la section',
  text: 'Racontez votre histoire ici. Expliquez pourquoi votre produit est unique et pourquoi vos clients devraient vous faire confiance.',
  image_url: '',
  image_position: 'right',
  image_fit: 'cover',
  cta_text: 'En savoir plus',
  cta_link: '#',
  bg_color: '#ffffff',
  text_color: '#111827',
  image_style: 'rounded',
}

export const DEFAULT_ORDER_FORM_PROPS: OrderFormProps = {
  title: 'Passer votre commande',
  subtitle: 'Remplissez le formulaire, nous vous appelons dans les 24h',
  fields: [
    { id: 'field-name', type: 'text', label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true },
    { id: 'field-phone', type: 'tel', label: 'Téléphone', placeholder: 'Ex: +224 620 000 000', required: true },
    { id: 'field-address', type: 'text', label: 'Adresse de livraison', placeholder: 'Quartier, ville', required: true },
  ],
  submit_text: 'Confirmer ma commande',
  submit_color: '#6366f1',
  submit_text_color: '#ffffff',
  success_message: 'Merci ! Votre commande a été reçue. Nous vous contacterons bientôt.',
  bg_color: '#f9fafb',
  border_radius: 12,
  show_product_summary: true,
  show_quantity: true,
  show_variants: false,
  layout: 'standard',
}

export const DEFAULT_PRICING_TABLE_PROPS: PricingTableProps = {
  title: 'Nos offres',
  items: [
    { id: 'p1', name: 'Basique', price: '9 900', period: 'FCFA', features: ['1 produit', 'Support email', 'Livraison standard'], cta_text: 'Choisir', highlighted: false },
    { id: 'p2', name: 'Premium', price: '19 900', period: 'FCFA', features: ['3 produits', 'Support prioritaire', 'Livraison express', 'Cadeau offert'], cta_text: 'Choisir', highlighted: true },
    { id: 'p3', name: 'VIP', price: '29 900', period: 'FCFA', features: ['Illimité', 'Support 24/7', 'Livraison gratuite', 'Cadeaux exclusifs'], cta_text: 'Choisir', highlighted: false },
  ],
  bg_color: '#f9fafb',
  accent_color: '#6366f1',
}

export const DEFAULT_NEWSLETTER_PROPS: NewsletterProps = {
  title: 'Rejoignez notre communauté',
  subtitle: 'Recevez nos offres exclusives et promotions',
  placeholder: 'Votre numéro WhatsApp',
  button_text: 'S\'inscrire',
  bg_color: '#6366f1',
  style: 'fullwidth',
  theme: 'light',
  type: 'whatsapp',
}

export const DEFAULT_SLIDESHOW_PROPS: SlideshowProps = {
  slides: [
    { image_url: '', title: 'Titre du slide 1', subtitle: 'Sous-titre accrocheur', cta_text: 'Commander', cta_link: '#order-form', overlay_color: 'rgba(0,0,0,0.4)' },
    { image_url: '', title: 'Titre du slide 2', subtitle: 'Deuxième accroche', cta_text: 'Découvrir', cta_link: '#', overlay_color: 'rgba(30,27,75,0.6)' },
  ],
  autoplay: true,
  interval: 5000,
  show_dots: true,
  show_arrows: true,
  height: 600,
}

export const DEFAULT_ICON_GRID_PROPS: IconGridProps = {
  title: 'Nos services',
  items: [
    { id: 'ig1', icon: 'Truck', title: 'Livraison', text: 'Livraison partout en Afrique', link: '#' },
    { id: 'ig2', icon: 'Shield', title: 'Garantie', text: 'Produits certifiés', link: '#' },
    { id: 'ig3', icon: 'Headphones', title: 'Support', text: 'Disponible 24h/24', link: '#' },
    { id: 'ig4', icon: 'Star', title: 'Qualité', text: 'Les meilleurs produits', link: '#' },
    { id: 'ig5', icon: 'Gift', title: 'Cadeaux', text: 'Offres exclusives', link: '#' },
    { id: 'ig6', icon: 'Zap', title: 'Rapidité', text: 'Traitement en 24h', link: '#' },
  ],
  columns: 3,
  bg_color: '#ffffff',
  icon_color: '#6366f1',
  card_style: 'card',
}

export const DEFAULT_PRODUCT_GRID_PROPS: ProductGridProps = {
  title: 'Nos meilleures ventes',
  subtitle: 'Découvrez nos produits les plus populaires',
  product_ids: [],
  columns: 3,
  show_price: true,
  show_badge: true,
  badge_text: 'PROMO',
  bg_color: '#f9fafb',
}

export const DEFAULT_TEXT_BLOCK_PROPS: TextBlockProps = {
  title: '',
  content: 'Ajoutez votre texte ici. Décrivez votre produit, votre histoire ou votre offre.',
  text_align: 'center',
  bg_color: '#ffffff',
  text_color: '#374151',
  max_width: 720,
  show_divider: false,
}

export const DEFAULT_SPACER_PROPS: SpacerProps = {
  height: 48,
  bg_color: 'transparent',
  show_divider: false,
  divider_style: 'line',
  pattern: 'none',
}

export const DEFAULT_CIRCULAR_INGREDIENTS_PROPS = {
  title: 'Ingrédients 100% naturels',
  subtitle: 'Ce qui rend notre formule unique',
  items: [
    { id: 'i1', title: 'Ingrédient 1', text: 'Propriété active principale', image_url: '' },
    { id: 'i2', title: 'Ingrédient 2', text: 'Pour renforcer l\'efficacité', image_url: '' },
    { id: 'i3', title: 'Ingrédient 3', text: 'Apporte douceur et soin', image_url: '' },
  ],
  bg_color: '#ffffff',
}

export const DEFAULT_EXPERT_ENCART_PROPS = {
  title: 'Recommandé par les experts',
  name: 'Dr. Jean Dupont',
  role: 'Dermatologue certifié',
  quote: "C'est la formule la plus avancée que j'ai pu analyser cette année. Les résultats cliniques sont impressionnants.",
  image_url: '',
  signature_url: '',
  bg_color: '#f9fafb',
}

export const DEFAULT_UPSELL_CAROUSEL_PROPS = {
  title: 'Complétez votre routine',
  subtitle: 'Nos clients achètent souvent ces produits ensemble',
  items: [
    { id: 'u1', title: 'Produit Complémentaire 1', price: '15 000 FCFA', image_url: '', link: '#' },
    { id: 'u2', title: 'Produit Complémentaire 2', price: '12 500 FCFA', image_url: '', link: '#' },
    { id: 'u3', title: 'Accessoire Premium', price: '9 900 FCFA', image_url: '', link: '#' },
  ],
  bg_color: '#ffffff',
  accent_color: '#6366f1',
}

export const DEFAULT_POPUP_PROPS: PopupProps = {
  title: 'Offre spéciale !',
  subtitle: 'Profitez de -20% sur votre première commande',
  image_url: '',
  cta_text: 'Profiter de l\'offre',
  trigger: 'timer',
  delay: 5,
  bg_color: '#ffffff',
  show_once: true,
}

export const DEFAULT_FOOTER_PROPS: FooterProps = {
  logo_text: 'Ma Boutique',
  description: 'Votre boutique de confiance pour tous vos achats.',
  columns: [
    { title: 'Liens utiles', links: [{ label: 'Accueil', url: '#' }, { label: 'Produits', url: '#' }] },
    { title: 'Support', links: [{ label: 'Contact', url: '#' }, { label: 'FAQ', url: '#' }] },
  ],
  social_links: [{ platform: 'facebook', url: '#' }, { platform: 'instagram', url: '#' }],
  show_whatsapp: true,
  whatsapp_number: '',
  payment_icons: true,
  bg_color: '#111827',
  text_color: '#9ca3af',
  copyright: `© ${new Date().getFullYear()} Ma Boutique. Tous droits réservés.`,
}

// ============================================
// CATALOGUE PAR CATÉGORIE — ~35 sections essentielles COD Afrique
// ============================================

export const SECTIONS_CATALOG: SectionCatalogItem[] = [
  // 📣 Marketing (essentiel pour COD)
  { type: 'announcement_bar', label: 'Bandeau annonce', icon: '📣', description: 'Texte défilant en haut de page', category: 'Marketing', defaultProps: DEFAULT_ANNOUNCEMENT_BAR_PROPS },
  { type: 'countdown', label: 'Compte à rebours', icon: '⏱️', description: 'Timer pour créer de l\'urgence', category: 'Marketing', defaultProps: DEFAULT_COUNTDOWN_PROPS },
  { type: 'stats', label: 'Statistiques', icon: '📊', description: 'Chiffres clés animés', category: 'Marketing', defaultProps: DEFAULT_STATS_PROPS },
  { type: 'countdown_top_bar', label: 'Bandeau countdown', icon: '🔥', description: 'Bandeau compact en haut de page avec timer', category: 'Marketing', defaultProps: { target_date: new Date(Date.now() + 12 * 3600000).toISOString(), label: 'Offre', discount_text: '-39%', suffix: 'se termine dans', bg_color: '#3A2A2E', text_color: '#FFF8F3', accent_color: '#C9A24B' } },
  
  // 🎨 Contenu (essentiel)
  { type: 'hero', label: 'Hero / Bannière', icon: '🖼️', description: 'Grande section d\'accroche principale', category: 'Contenu', defaultProps: DEFAULT_HERO_PROPS },
  { type: 'image_with_text', label: 'Image + Texte', icon: '📰', description: 'Image et texte côte à côte', category: 'Contenu', defaultProps: DEFAULT_IMAGE_WITH_TEXT_PROPS },
  { type: 'text_block', label: 'Bloc texte', icon: '📝', description: 'Paragraphe de texte libre', category: 'Contenu', defaultProps: DEFAULT_TEXT_BLOCK_PROPS },
  { type: 'gallery', label: 'Galerie photos', icon: '🖼️', description: 'Grille d\'images', category: 'Contenu', defaultProps: DEFAULT_GALLERY_PROPS },
  
  // 🛍️ Produits (cœur du COD)
  { type: 'order_form', label: 'Formulaire commande', icon: '📋', description: 'Formulaire de commande personnalisable', category: 'Produits', defaultProps: DEFAULT_ORDER_FORM_PROPS },
  
  // ⭐ Social Proof (très important pour COD)
  { type: 'testimonials', label: 'Témoignages', icon: '💬', description: 'Avis et témoignages clients', category: 'Social Proof', defaultProps: DEFAULT_TESTIMONIALS_PROPS },
  { type: 'trust_bar', label: 'Barre de confiance', icon: '✓', description: 'Score et arguments de confiance', category: 'Social Proof', defaultProps: {} },
  { type: 'stock_urgency', label: 'Stock urgent', icon: '🔥', description: 'Barre de stock avec urgence', category: 'Social Proof', defaultProps: {} },
  { type: 'before_after', label: 'Avant / Après', icon: '🔄', description: 'Comparaison avec slider interactif', category: 'Social Proof', defaultProps: DEFAULT_BEFORE_AFTER_PROPS },
  { type: 'comparison_table', label: 'Comparaison', icon: '📊', description: 'Nous vs concurrents', category: 'Social Proof', defaultProps: DEFAULT_COMPARISON_TABLE_PROPS },
  
  // ℹ️ Info (essentiel pour rassurer)
  { type: 'benefits', label: 'Avantages', icon: '✅', description: 'Points forts et bénéfices', category: 'Info', defaultProps: DEFAULT_BENEFITS_PROPS },
  { type: 'faq', label: 'FAQ', icon: '❓', description: 'Questions / réponses accordéon', category: 'Info', defaultProps: DEFAULT_FAQ_PROPS },
  { type: 'guarantees', label: 'Garanties', icon: '🛡️', description: 'Badges de confiance', category: 'Info', defaultProps: DEFAULT_GUARANTEES_PROPS },
  { type: 'icon_grid', label: 'Grille d\'icônes', icon: '🔷', description: 'Services avec icônes', category: 'Info', defaultProps: DEFAULT_ICON_GRID_PROPS },
  
  // 🏁 Structure
  { type: 'spacer', label: 'Espaceur', icon: '⬜', description: 'Espace vide / séparateur', category: 'Structure', defaultProps: DEFAULT_SPACER_PROPS },
  { type: 'marquee', label: 'Marquee défilant', icon: '🔁', description: 'Bandeau texte en boucle', category: 'Structure', defaultProps: DEFAULT_MARQUEE_PROPS },
  
  // Sections Cora (nouveau thème)
  { type: 'hero_editorial', label: 'Hero Éditorial', icon: '📖', description: 'Titre centré + sous-titre + texte long', category: 'Contenu', defaultProps: { title: 'Votre histoire', content: 'Racontez votre histoire...', text_align: 'center', bg_color: '#FFFFFF', text_color: '#1A1A2E', title_font_size: 28, padding: 48 } },
  { type: 'feature_grid', label: 'Grille Fonctionnalités', icon: '📋', description: '4 colonnes icônes + titres + descriptions', category: 'Contenu', defaultProps: { title: '', columns: 4, bg_color: '#FFFFFF', icon_color: '#6366f1', items: [] } },
  { type: 'comparison_vs', label: 'Comparaison VS', icon: '⚔️', description: 'Tableau NOUS vs EUX avec colonne mise en évidence', category: 'Social Proof', defaultProps: { title: 'Pourquoi nous ?', our_label: 'NOUS', competitor_label: 'EUX', accent_color: '#6366f1', bg_color: '#FFFFFF', highlight_our_column: true, rows: [{ feature: 'Qualité premium', us: true, them: false }, { feature: 'Service client', us: true, them: false }] } },
  { type: 'whats_in_box', label: 'Contenu du Colis', icon: '📦', description: 'Image + liste à puces de ce qu\'il y a dans la boîte', category: 'Produits', defaultProps: { title: 'Dans le colis :', text: '✓ Produit principal\n✓ Notice d\'utilisation\n✓ Cadeau offert', image_position: 'left', bg_color: '#FFF5F3', text_color: '#1A1A2E', padding: 48, show_cta: false } },
  { type: 'faq_2col', label: 'FAQ 2 Colonnes', icon: '❓', description: 'FAQ accordéon en 2 colonnes', category: 'Info', defaultProps: { title: 'FAQ', accent_color: '#6366f1', bg_color: '#FFFFFF', items: [{ id: 'f1', question: 'Question 1 ?', answer: 'Réponse 1...' }, { id: 'f2', question: 'Question 2 ?', answer: 'Réponse 2...' }] } },

  // Sections supplémentaires avec renderers existants
  { type: 'testimonials_floating', label: 'Témoignages flottants', icon: '💬', description: 'Avis clients avec effet flottant', category: 'Social Proof', defaultProps: { title: 'Ce que disent nos clients', bg_color: '#FFFFFF', items: [] } },
  { type: 'video', label: 'Vidéo', icon: '🎬', description: 'Section vidéo YouTube ou MP4', category: 'Contenu', defaultProps: DEFAULT_VIDEO_PROPS },
  { type: 'product_grid', label: 'Grille produits', icon: '🏷️', description: 'Catalogue de produits en grille', category: 'Produits', defaultProps: DEFAULT_PRODUCT_GRID_PROPS },
  { type: 'upsell_carousel', label: 'Carousel upsell', icon: '🎠', description: 'Suggestions de produits complémentaires', category: 'Produits', defaultProps: DEFAULT_UPSELL_CAROUSEL_PROPS },
  { type: 'expert_encart', label: 'Encart Expert', icon: '👨‍⚕️', description: 'Recommandation d\'un expert ou médecin', category: 'Social Proof', defaultProps: DEFAULT_EXPERT_ENCART_PROPS },
  { type: 'circular_ingredients', label: 'Ingrédients circulaires', icon: '🧪', description: 'Cercle d\'ingrédients avec descriptions', category: 'Contenu', defaultProps: DEFAULT_CIRCULAR_INGREDIENTS_PROPS },
  { type: 'hotspots', label: 'Points interactifs', icon: '📍', description: 'Image avec points cliquables', category: 'Contenu', defaultProps: { title: 'Découvrez', image_url: '', hotspots: [], padding: 48 } },
  { type: 'parallax', label: 'Parallax', icon: '🏔️', description: 'Section avec effet parallaxe au scroll', category: 'Contenu', defaultProps: { title: 'Titre', subtitle: 'Sous-titre', bg_image: '', overlay_opacity: 40, padding: 48 } },
]

// ============================================
// THÈMES
// ============================================

export const THEMES: ThemePreview[] = [
  {
    id: 'theme-alpha',
    name: 'Alpha',
    description: 'Moderne et épuré, parfait pour les produits tech et beauté',
    preview_image: '/themes/alpha-preview.jpg',
    tags: ['moderne', 'minimal', 'beauté'],
    default_colors: { primary: '#6366f1', secondary: '#f8fafc', accent: '#f59e0b', text: '#111827', textLight: '#6b7280', bg: '#ffffff', bgSection: '#f9fafb', border: '#e5e7eb', success: '#10b981', danger: '#ef4444' },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'theme-bold',
    name: 'Bold',
    description: 'Couleurs intenses, fort impact visuel pour les produits de santé',
    preview_image: '/themes/bold-preview.jpg',
    tags: ['santé', 'sport', 'impact'],
    default_colors: { primary: '#dc2626', secondary: '#fef2f2', accent: '#f97316', text: '#111827', textLight: '#6b7280', bg: '#ffffff', bgSection: '#fff7ed', border: '#fed7aa', success: '#16a34a', danger: '#dc2626' },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'theme-elegant',
    name: 'Élégant',
    description: 'Style luxe et sobre, idéal pour la mode et les cosmétiques premium',
    preview_image: '/themes/elegant-preview.jpg',
    tags: ['luxe', 'mode', 'premium'],
    default_colors: { primary: '#1c1917', secondary: '#fafaf9', accent: '#ca8a04', text: '#1c1917', textLight: '#78716c', bg: '#ffffff', bgSection: '#fafaf9', border: '#e7e5e4', success: '#15803d', danger: '#b91c1c' },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'theme-tropical',
    name: 'Tropical',
    description: 'Frais et coloré, adapté aux produits alimentaires et bien-être',
    preview_image: '/themes/tropical-preview.jpg',
    tags: ['alimentation', 'bien-être', 'naturel'],
    default_colors: { primary: '#059669', secondary: '#ecfdf5', accent: '#f59e0b', text: '#064e3b', textLight: '#6b7280', bg: '#ffffff', bgSection: '#f0fdf4', border: '#a7f3d0', success: '#059669', danger: '#dc2626' },
    default_fonts: { heading: 'Inter', body: 'Inter' },
  },
]

// ============================================
// HELPER
// ============================================

export function generateSectionId(type: SectionType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
