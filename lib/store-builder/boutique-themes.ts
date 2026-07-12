// ============================================
// THÈMES BOUTIQUE — Source unique de vérité
// Chaque thème = couleurs + polices + sections + layout
// ============================================

export interface BoutiqueThemeColors {
  bg: string
  surface: string
  text: string
  text_soft: string
  accent: string
  accent_deep: string
  gold: string
  border: string
}

export interface BoutiqueTheme {
  id: string
  name: string
  description: string
  tags: string[]
  preview_image: string
  layout: 'single-column' | 'hero-split' | 'hero-triple' | 'full-width'
  cardMaxWidth: number
  colors: BoutiqueThemeColors
  fonts: { display: string; body: string }
}

export interface StoreBlock {
  id: string
  type: string
  title: string
  hidden: boolean
  settings: Record<string, any>
}

export interface BuiltStorePage {
  header: StoreBlock[]
  template: StoreBlock[]
  footer: StoreBlock[]
  themeSettings: Record<string, any>
  selectedProductId: string | null
}

function block(type: string, title: string, settings: Record<string, any> = {}, suffix = ''): StoreBlock {
  return {
    id: `${type}-${Date.now()}-${suffix || Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    hidden: false,
    settings,
  }
}

// ── Thèmes ──────────────────────────────────────────────────────────────────

export const BOUTIQUE_THEMES: BoutiqueTheme[] = [
  // ── 1. NATURE VERT — Organic, earthy, fresh ──────────────────────────────
  {
    id: 'nature-vert',
    name: 'Nature Vert',
    description: 'Beauté naturelle — vert sauge, typographie organique, idéal cosmétiques & cheveux.',
    tags: ['beauté', 'naturel', 'cheveux'],
    preview_image: '/themes/screencapture-afroli-products-batana-2026-07-05-03_42_58.png',
    layout: 'hero-triple',
    cardMaxWidth: 1100,
    colors: {
      bg: '#F2F7F0',
      surface: '#FFFFFF',
      text: '#1A2E1A',
      text_soft: '#4A6741',
      accent: '#3D8B37',
      accent_deep: '#2A6126',
      gold: '#B5821A',
      border: '#C5E0C0',
    },
    fonts: { display: "'DM Serif Display', serif", body: "'DM Sans', sans-serif" },
  },

  // ── 2. CLINIQUE BLEU — Deep navy, clinical, premium trust ────────────────
  {
    id: 'clinique-bleu',
    name: 'Clinique Bleu',
    description: 'Médical premium — fond blanc immaculé, marine profond, confiance scientifique.',
    tags: ['santé', 'homme', 'premium'],
    preview_image: '/themes/screencapture-colagea-products-micro-infusion-capillaire-regenerante-men-2026-07-05-03_44_58.png',
    layout: 'hero-split',
    cardMaxWidth: 1100,
    colors: {
      bg: '#F8FBFF',
      surface: '#FFFFFF',
      text: '#0A1628',
      text_soft: '#3D5A80',
      accent: '#0B3D91',
      accent_deep: '#07235C',
      gold: '#E8A020',
      border: '#D0E4F7',
    },
    fonts: { display: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif" },
  },

  // ── 3. AMBRE LUXE — Warm ivory luxury, serif, gold accents (Héline-style) ─
  {
    id: 'ambre-premium',
    name: 'Ambre Luxe',
    description: 'Marque premium haut de gamme — ivoire chaud, serif élégant, accents dorés.',
    tags: ['luxe', 'premium', 'beauté'],
    preview_image: '/themes/s1.png',
    layout: 'single-column',
    cardMaxWidth: 860,
    colors: {
      bg: '#FAF7F2',
      surface: '#FFFFFF',
      text: '#2C1A0E',
      text_soft: '#8B6F47',
      accent: '#B8860B',
      accent_deep: '#8B6914',
      gold: '#D4AF37',
      border: '#E8DCC8',
    },
    fonts: { display: "'Playfair Display', serif", body: "'Lato', sans-serif" },
  },

  // ── 4. CONVERSION PRO — Bold red urgency, single column sales tunnel ─────
  {
    id: 'conversion-pro',
    name: 'Conversion Pro',
    description: 'Tunnel de vente agressif — rouge vif, urgence maximale, COD Afrique.',
    tags: ['conversion', 'COD', 'urgence'],
    preview_image: '/themes/screencapture-lbiocareplus-netlify-app-description-html-2026-07-05-03_43_38.png',
    layout: 'single-column',
    cardMaxWidth: 720,
    colors: {
      bg: '#FFF8F7',
      surface: '#FFFFFF',
      text: '#1A0505',
      text_soft: '#7A3030',
      accent: '#D4180A',
      accent_deep: '#A01006',
      gold: '#F59E0B',
      border: '#FDD5D0',
    },
    fonts: { display: "'Bebas Neue', cursive", body: "'Roboto', sans-serif" },
  },

  // ── 5. CORA — Full-width editorial, coral/salmon, modern clean ────────
  {
    id: 'cora',
    name: 'Cora',
    description: 'Éditorial moderne — pleine largeur, corail vibrant, sections alternées, style Shopify premium.',
    tags: ['moderne', 'éditorial', 'corail'],
    preview_image: '/themes/T1.webp',
    layout: 'full-width',
    cardMaxWidth: 1200,
    colors: {
      bg: '#FFFFFF',
      surface: '#FFF5F3',
      text: '#1A1A2E',
      text_soft: '#6B7280',
      accent: '#FF6B6B',
      accent_deep: '#E55A5A',
      gold: '#FFB347',
      border: '#F3F4F6',
    },
    fonts: { display: "'Outfit', sans-serif", body: "'Inter', sans-serif" },
  },
]

export const DEFAULT_BOUTIQUE_THEME = BOUTIQUE_THEMES[0]

export function getBoutiqueTheme(id: string): BoutiqueTheme {
  return BOUTIQUE_THEMES.find(t => t.id === id) ?? DEFAULT_BOUTIQUE_THEME
}

export function buildThemeSettings(theme: BoutiqueTheme): Record<string, any> {
  const isDark = theme.colors.bg.startsWith('#0') || theme.colors.bg.startsWith('#1') || parseInt(theme.colors.bg.slice(1, 3), 16) < 50
  return {
    primaryColor: theme.colors.accent,
    secondaryColor: theme.colors.surface,
    backgroundColor: theme.colors.bg,
    textColor: theme.colors.text,
    textSoftColor: theme.colors.text_soft,
    fontFamily: theme.fonts.body.replace(/'/g, '').split(',')[0].trim(),
    headingFont: theme.fonts.display.replace(/'/g, '').split(',')[0].trim(),
    accentDeep: theme.colors.accent_deep,
    gold: theme.colors.gold,
    border: theme.colors.border,
    surface: theme.colors.surface,
    cardMaxWidth: theme.cardMaxWidth,
    layout: theme.layout,
    headingColor: theme.colors.text,
    priceColor: theme.colors.accent,
    isDark,
    // Card border is more subtle on dark themes
    cardBorderColor: isDark ? theme.colors.border : theme.colors.border,
    cardShadow: isDark
      ? '0 8px 60px rgba(0,0,0,0.5)'
      : '0 4px 40px rgba(0,0,0,0.06)',
  }
}

export function toStoreColors(theme: BoutiqueTheme) {
  return {
    primary: theme.colors.accent,
    secondary: theme.colors.surface,
    accent: theme.colors.gold,
    text: theme.colors.text,
    textLight: theme.colors.text_soft,
    bg: theme.colors.bg,
    bgSection: theme.colors.surface,
    border: theme.colors.border,
    success: '#10b981',
    danger: '#ef4444',
  }
}

export function toStoreFonts(theme: BoutiqueTheme) {
  return {
    heading: theme.fonts.display.replace(/'/g, '').split(',')[0].trim(),
    body: theme.fonts.body.replace(/'/g, '').split(',')[0].trim(),
  }
}

// ── Sections par thème ──────────────────────────────────────────────────────

function buildNatureVert(c: BoutiqueThemeColors, name: string) {
  return {
    header: [
      block('AnnouncementBar', "Barre d'annonce", {
        text: '🔥 Fin de Saison — Jusqu\'à -40% de Réduction — Offres Exclusives',
        bg_color: '#1A1A1A',
        text_color: '#FFFFFF',
      }, 'h1'),
      block('Header', 'En-tête', {
        logo_text: name,
        logo_position: 'center',
        show_search: true,
        show_cart: true,
        bg_color: '#FFFFFF',
        text_color: c.text,
      }, 'h2'),
    ],
    template: [
      block('OrderForm', 'Formulaire commande', {
        title: 'Terminer mon achat',
        btn_text: 'TERMINER MON ACHAT',
        btn_color: c.accent,
        btn_text_color: '#FFFFFF',
        border_color: c.border,
        bundles_enabled: false,
        fields_layout: 'compact',
      }, 't1'),
      block('Galerie', "Galerie d'images", {}, 't2'),
      block('Titre', 'Titre produit', {}, 't3'),
      block('Note de produit', 'Note', { rating: 5, reviews_count: '482 avis' }, 't4'),
      block('Prix', 'Prix', { show_badge: true, badge_text: 'Promo', badge_bg: c.accent }, 't5'),
      block('before_after', 'Avant / Après', {
        title: 'Des résultats visibles',
        before_label: 'AVANT',
        after_label: 'APRÈS',
        bg_color: c.surface,
      }, 't6'),
      block('text_block', 'Texte accroche', {
        content: 'La solution naturelle pour revitaliser vos cheveux. Originaire d\'Amérique centrale, cette formule premium favorise la pousse et la brillance.',
        text_align: 'center',
        bg_color: c.surface,
        text_color: c.text,
      }, 't7'),
      block('image_text', 'Image + Texte', {
        title: 'Real Results, Real Growth',
        text: 'Des résultats concrets observés par des centaines de clientes satisfaites.',
        image_position: 'left',
        bg_color: '#ECFCCB',
        text_color: c.text,
        cta_text: 'Commander',
        cta_color: c.accent,
      }, 't8'),
      block('icon_grid', 'Étapes', {
        title: 'Simple Steps, Stronger Hair',
        items: [
          { id: '1', icon: '1️⃣', title: 'Appliquer', description: 'Sur le cuir chevelu' },
          { id: '2', icon: '2️⃣', title: 'Masser', description: '5 minutes doucement' },
          { id: '3', icon: '3️⃣', title: 'Laisser agir', description: 'Toute la nuit' },
          { id: '4', icon: '4️⃣', title: 'Rincer', description: 'Le matin au shampoing' },
        ],
        columns: 2,
        bg_color: c.surface,
      }, 't9'),
      block('testimonials', 'Témoignages', {
        title: 'Elles nous font confiance',
        layout: 'grid',
        bg_color: c.bg,
        items: [
          { id: '1', name: 'Aminata K.', rating: 5, text: 'Résultats incroyables en 3 semaines !', verified: true },
          { id: '2', name: 'Fatou D.', rating: 5, text: 'Mes cheveux n\'ont jamais été aussi beaux.', verified: true },
          { id: '3', name: 'Mariama S.', rating: 5, text: 'Livraison rapide, produit authentique.', verified: true },
          { id: '4', name: 'Kadiatou B.', rating: 5, text: 'Je recommande à 100%.', verified: true },
        ],
      }, 't10'),
      block('guarantees', 'Garanties', {
        title: '',
        layout: 'row',
        style: 'icons',
        bg_color: c.surface,
        icon_color: c.accent,
        items: [
          { id: '1', icon: '✅', title: 'Produit original', text: '' },
          { id: '2', icon: '🛡️', title: 'Service après-vente', text: '' },
          { id: '3', icon: '🚚', title: 'Livraison gratuite', text: '' },
          { id: '4', icon: '💵', title: 'Paiement à la réception', text: '' },
        ],
      }, 't11'),
      block('marquee', 'Bandeau promo', {
        text: '🔥 Fin de Saison — Jusqu\'à -40% — Offres Exclusives 100% Online',
        bg_color: c.accent,
        text_color: '#FFFFFF',
        speed: 30,
      }, 't12'),
      block('faq', 'FAQ', {
        title: 'Questions Fréquentes',
        accent_color: c.accent,
        bg_color: c.surface,
        items: [
          { id: '1', question: '💳 Paiement à la livraison ?', answer: 'Oui, vous payez uniquement à la réception.' },
          { id: '2', question: '📦 Délais de livraison ?', answer: '24 à 48h selon votre ville.' },
          { id: '3', question: '🔄 Retours ?', answer: 'Retour possible sous 7 jours.' },
        ],
      }, 't13'),
    ],
    footer: [
      block('Footer', 'Pied de page', {
        logo_text: name,
        copyright: `© ${new Date().getFullYear()} ${name}. Tous droits réservés.`,
        bg_color: '#1A1A1A',
        text_color: '#9CA3AF',
        show_newsletter: true,
        newsletter_title: 'Rejoignez-nous & profitez d\'offres exclusives 🔔',
      }, 'f1'),
    ],
  }
}

function buildCliniqueBleu(c: BoutiqueThemeColors, name: string) {
  return {
    header: [
      block('AnnouncementBar', "Barre d'annonce", {
        text: '🚚 Livraison offerte · Paiement sécurisé · Satisfait ou remboursé 30 jours',
        bg_color: '#0F172A',
        text_color: '#FFFFFF',
      }, 'h1'),
      block('Header', 'En-tête', {
        logo_text: name,
        logo_position: 'left',
        show_search: true,
        show_cart: true,
        bg_color: '#FFFFFF',
        text_color: c.accent,
      }, 'h2'),
    ],
    template: [
      block('Galerie', "Galerie d'images", {}, 't1'),
      block('Titre', 'Titre produit', {}, 't2'),
      block('Note de produit', 'Note', { rating: 5, reviews_count: '2 847 avis' }, 't3'),
      block('Prix', 'Prix', { show_badge: true, badge_text: 'Best Seller', badge_bg: c.accent }, 't4'),
      block('trust_bar', 'Barre de confiance', {
        show_score: true,
        score: '4.9',
        score_label: '2 847 avis vérifiés',
        bg_color: c.surface,
        icon_color: c.accent,
        items: [
          { icon: 'shield', label: 'Cliniquement testé' },
          { icon: 'truck', label: 'Livraison 48h' },
          { icon: 'lock', label: 'Paiement sécurisé' },
        ],
      }, 't5'),
      block('OrderForm', 'Formulaire commande', {
        title: 'Commander maintenant',
        btn_text: 'AJOUTER AU PANIER',
        btn_color: c.accent,
        bundles_enabled: true,
        bundle_layout: 'premium',
        bundles: [
          { id: 'b1', qty: 1, label: '1 mois', sublabel: 'Découverte', badge: '', discount_pct: 0, discount_fixed: 0, popular: false, hidden: false },
          { id: 'b2', qty: 3, label: '3 mois', sublabel: 'Économisez 20%', badge: '🔥 LE PLUS POPULAIRE', discount_pct: 20, discount_fixed: 0, popular: true, hidden: false },
          { id: 'b3', qty: 6, label: '6 mois', sublabel: 'Meilleure offre — 35% OFF', badge: '⭐ MEILLEURE OFFRE', discount_pct: 35, discount_fixed: 0, popular: false, hidden: false },
        ],
      }, 't6'),
      block('Description', 'Description', {}, 't7'),
      block('stats', 'Statistiques', {
        title: '',
        bg_color: c.accent,
        text_color: '#FFFFFF',
        accent_color: c.gold,
        items: [
          { id: '1', number: 90, suffix: '%', label: 'Satisfaction client', icon: '⭐' },
          { id: '2', number: 86, suffix: '%', label: 'Repousse visible', icon: '🌱' },
          { id: '3', number: 30, suffix: 'k+', label: 'Hommes conquis', icon: '👨' },
          { id: '4', number: 4, suffix: 'sem.', label: 'Premiers résultats', icon: '📅' },
        ],
      }, 't8'),
      block('testimonials', 'Témoignages', {
        title: 'L\'efficacité du protocole, commentée par nos utilisateurs',
        layout: 'grid',
        bg_color: c.bg,
        items: [
          { id: '1', name: 'Moussa T.', rating: 5, text: 'Résultats visibles dès la 4ème semaine.', verified: true },
          { id: '2', name: 'Ibrahim K.', rating: 5, text: 'Protocole simple et efficace.', verified: true },
          { id: '3', name: 'Amadou D.', rating: 5, text: 'Je recommande sans hésiter.', verified: true },
        ],
      }, 't9'),
      block('before_after', 'Avant / Après', {
        title: 'Des résultats mesurables',
        bg_color: c.surface,
      }, 't10'),
      block('icon_grid', 'Ingrédients', {
        title: 'Une science claire. Des ingrédients validés.',
        columns: 3,
        bg_color: c.bg,
        icon_color: c.accent,
        items: [
          { id: '1', icon: '🧬', title: 'Biotine', text: 'Renforce la fibre capillaire' },
          { id: '2', icon: '☕', title: 'Caféine', text: 'Stimule le follicule' },
          { id: '3', icon: '🌿', title: 'Extrait naturel', text: '100% végétal' },
        ],
      }, 't11'),
      block('comparison_table', 'Comparaison', {
        title: 'Pourquoi nous choisir ?',
        our_label: name,
        competitor_label: 'Autres méthodes',
        accent_color: c.accent,
        bg_color: c.surface,
        rows: [
          { feature: 'Sans effets secondaires', us: true, them: false },
          { feature: 'Résultats cliniques prouvés', us: true, them: false },
          { feature: 'Application simple à domicile', us: true, them: false },
          { feature: 'Prix accessible', us: true, them: false },
        ],
      }, 't12'),
      block('faq', 'FAQ', {
        title: 'Vos questions. Nos réponses.',
        accent_color: c.accent,
        bg_color: c.surface,
        items: [
          { id: '1', question: 'Quand voir les premiers résultats ?', answer: 'La plupart de nos clients observent des changements entre 4 et 8 semaines.' },
          { id: '2', question: 'Comment utiliser le produit ?', answer: '2 applications par semaine, directement sur le cuir chevelu.' },
          { id: '3', question: 'Y a-t-il des effets secondaires ?', answer: 'Non, notre formule est dermatologiquement testée.' },
        ],
      }, 't13'),
    ],
    footer: [
      block('Footer', 'Pied de page', {
        logo_text: name,
        copyright: `© ${new Date().getFullYear()} ${name}. Tous droits réservés.`,
        bg_color: '#0F172A',
        text_color: '#94A3B8',
      }, 'f1'),
    ],
  }
}

function buildAmbrePremium(c: BoutiqueThemeColors, name: string) {
  return {
    header: [
      block('AnnouncementBar', "Barre d'annonce", {
        text: "Livraison offerte - Satisfait ou rembourse - 16 000+ avis 5 etoiles",
        bg_color: '#2C1A0E',
        text_color: '#D4AF37',
        bar_height: 38,
        font_size: 11,
      }, 'h1'),
      block('Header', 'En-tete', {
        logo_text: name,
        logo_position: 'center',
        show_search: false,
        show_cart: true,
        bg_color: '#FAF7F2',
        text_color: c.text,
      }, 'h2'),
    ],
    template: [
      block('Galerie', "Galerie d'images", {}, 't1'),
      block('Titre', 'Titre produit', { padding_top: 16 }, 't2'),
      block('Note de produit', 'Note', { rating: 5, reviews_count: '16 842 avis', star_color: c.gold }, 't3'),
      block('Prix', 'Prix', { show_badge: true, badge_text: 'OFFRE LIMITEE', badge_bg: c.accent, badge_text_color: '#FFFFFF', price_color: c.accent }, 't4'),
      block('trust_bar', 'Barre de confiance', { show_score: false, bg_color: '#FAF7F2', icon_color: c.accent, items: [{ icon: 'shield', label: 'Satisfait ou rembourse' }, { icon: 'truck', label: 'Livraison offerte' }, { icon: 'star', label: '16 000+ avis' }] }, 't5'),
      block('OrderForm', 'Formulaire commande', { title: 'Terminer mon achat', btn_text: 'COMMANDER MAINTENANT', btn_color: c.accent, btn_text_color: '#FFFFFF', bg_color: '#FFFFFF', border_color: c.border, border_radius: 12, bundles_enabled: true, bundle_layout: 'premium', bundles: [{ id: 'b1', qty: 1, label: '1 unite', sublabel: '', badge: '', discount_pct: 0, discount_fixed: 0, popular: false, hidden: false }, { id: 'b2', qty: 2, label: '2 unites', sublabel: 'Economisez 15%', badge: 'POPULAIRE', discount_pct: 15, discount_fixed: 0, popular: true, hidden: false }, { id: 'b3', qty: 3, label: '3 unites', sublabel: 'Meilleure offre -25%', badge: 'MEILLEUR PRIX', discount_pct: 25, discount_fixed: 0, popular: false, hidden: false }] }, 't6'),
      block('Description', 'Description produit', { padding_top: 40, padding_bottom: 32, text_color: c.text, bg_color: '#FAF7F2' }, 't7'),
      block('before_after', 'Avant / Apres', { title: 'Des resultats visibles et prouves', bg_color: '#FFFFFF' }, 't8'),
      block('expert_encart', 'Encart Expert', { name: 'Dr. Sophie M.', title: 'Pharmacienne et Experte', quote: 'Ce que j apprecie dans ce produit c est la qualite des ingredients et la transparence de la formule.', bg_color: '#FDF6E3', border_color: c.gold, text_color: c.text }, 't9'),
      block('circular_ingredients', 'Ingredients', { title: 'Des ingredients actifs naturels', subtitle: 'Chaque ingredient selectionne pour son efficacite prouvee', bg_color: '#FAF7F2', accent_color: c.accent, items: [{ id: '1', icon: '🌿', name: 'Extrait naturel', description: 'Actif principal' }, { id: '2', icon: '🫒', name: 'Huile vegetale', description: 'Nourrissant' }, { id: '3', icon: '🌸', name: 'Plante medicinale', description: 'Apaisant' }, { id: '4', icon: '💧', name: 'Eau florale', description: 'Hydratant' }] }, 't10'),
      block('stats', 'Resultats', { title: '', bg_color: c.accent, text_color: '#FFFFFF', accent_color: '#FAF7F2', items: [{ id: '1', number: '16', suffix: 'k+', label: 'Avis verifies', icon: '⭐' }, { id: '2', number: '94', suffix: '%', label: 'Satisfaction', icon: '😊' }, { id: '3', number: '4', suffix: ' sem.', label: 'Resultats', icon: '📅' }, { id: '4', number: '100', suffix: '%', label: 'Naturel', icon: '🌿' }] }, 't11'),
      block('testimonials', 'Avis clients', { title: 'Ce que disent nos clients', layout: 'list', bg_color: '#FFFFFF', items: [{ id: '1', name: 'Isabelle M.', rating: 5, text: 'Un produit de qualite exceptionnelle. Les resultats sont la des la 3eme semaine.', verified: true }, { id: '2', name: 'Nadia K.', rating: 5, text: 'La meilleure marque testee. L odeur, la texture, tout est parfait.', verified: true }, { id: '3', name: 'Yasmine B.', rating: 5, text: 'Mes cheveux ont retrouve de la vie. Livraison rapide, emballage soigne.', verified: true }, { id: '4', name: 'Aurelie T.', rating: 5, text: 'Je recommande a toutes mes amies. Un vrai investissement.', verified: true }] }, 't12'),
      block('image_text', 'Notre histoire', { title: 'Pourquoi nous choisir ?', text: 'Nous croyons que la beaute authentique nait d ingredients purs et d un savoir-faire rigoureux.', image_position: 'right', bg_color: '#FAF7F2', text_color: c.text, title_color: c.accent, cta_text: 'Notre philosophie', cta_color: c.accent, show_cta: true }, 't13'),
      block('faq', 'FAQ', { title: 'Vos questions, nos reponses', accent_color: c.accent, bg_color: '#FFFFFF', items: [{ id: '1', question: 'Comment utiliser ?', answer: 'Appliquez le soir sur peau propre. Laissez agir toute la nuit. Rincez le matin.' }, { id: '2', question: 'Quand voir les resultats ?', answer: 'Amelioration visible des la 3eme semaine d utilisation reguliere.' }, { id: '3', question: 'Livraison ?', answer: 'Expedition sous 24h. Livraison offerte a partir de 2 unites.' }, { id: '4', question: 'Remboursement ?', answer: 'Satisfait ou rembourse sous 30 jours, sans condition.' }] }, 't14'),
      block('guarantees', 'Garanties', { title: '', layout: 'row', bg_color: '#FDF6E3', icon_color: c.gold, items: [{ id: '1', icon: '🏆', title: 'Qualite certifiee', text: '' }, { id: '2', icon: '🌿', title: '100% Naturel', text: '' }, { id: '3', icon: '📦', title: 'Livraison offerte', text: '' }, { id: '4', icon: '🛡️', title: 'Rembourse 30j', text: '' }] }, 't15'),
    ],
    footer: [
      block('Footer', 'Pied de page', { logo_text: name, copyright: 'Tous droits reserves.', bg_color: '#2C1A0E', text_color: '#C8A97A', show_newsletter: true, newsletter_title: 'Rejoignez notre communaute beaute' }, 'f1'),
    ],
  }
}

function buildConversionPro(c: BoutiqueThemeColors, name: string) {
  return {
    header: [
      block('AnnouncementBar', "Barre d'annonce", {
        text: 'Bienvenue à la boutique — Des résultats visibles dès 7 jours',
        bg_color: c.accent_deep,
        text_color: '#FFFFFF',
      }, 'h1'),
      block('Header', 'En-tête', {
        logo_text: name,
        logo_position: 'center',
        show_search: false,
        show_cart: true,
        bg_color: '#FFFFFF',
        text_color: c.accent,
      }, 'h2'),
      block('countdown_top_bar', 'Bandeau urgence', {
        label: 'Offre',
        discount_text: '-53%',
        suffix: 'se termine dans',
        bg_color: '#1E3A8A',
        text_color: '#FFFFFF',
        accent_color: '#FBBF24',
      }, 'h3'),
    ],
    template: [
      block('Galerie', "Galerie d'images", {}, 't1'),
      block('Titre', 'Titre produit', {}, 't2'),
      block('Note de produit', 'Note', { rating: 5, reviews_count: '4 826 avis · 218 738 ventes' }, 't3'),
      block('Prix', 'Prix', { show_badge: true, badge_text: 'PROMO', badge_bg: c.accent }, 't4'),
      block('guarantees', 'Badges confiance', {
        title: '',
        layout: 'row',
        style: 'icons',
        bg_color: c.surface,
        icon_color: c.accent,
        items: [
          { id: '1', icon: '⭐', title: 'Haute qualité', text: '' },
          { id: '2', icon: '✅', title: 'Efficacité prouvée', text: '' },
          { id: '3', icon: '🚚', title: 'Livraison rapide', text: '' },
          { id: '4', icon: '💬', title: 'Service client', text: '' },
        ],
      }, 't5'),
      block('OrderForm', 'Formulaire commande', {
        title: '⚠️ Remplissez ce formulaire pour être livré',
        btn_text: 'ACHETER MAINTENANT',
        btn_color: c.accent,
        btn_animation: 'shake',
        bundles_enabled: true,
        bundle_layout: 'deals',
        show_subtitle: true,
        subtitle: 'Bénéficiez d\'une réduction pour l\'achat de 2 produits et plus.',
      }, 't6'),
      block('countdown', 'Compte à rebours', {
        title: 'L\'offre finit dans',
        bg_color: c.accent_deep,
        text_color: '#FFFFFF',
        accent_color: '#FBBF24',
      }, 't7'),
      block('stock_urgency', 'Stock urgent', {
        message: 'Stock limité — Plus que 8 unités disponibles',
        show_sold_count: true,
        sold_text: '47 commandes aujourd\'hui',
        bar_color: c.accent,
      }, 't8'),
      block('Description', 'Description', {}, 't9'),
      block('before_after', 'Résultats', {
        title: 'Des résultats visibles dès 7 jours',
        bg_color: c.surface,
      }, 't10'),
      block('icon_grid', 'Ingrédients', {
        title: 'CORE INGREDIENTS',
        columns: 2,
        bg_color: '#1E3A8A',
        icon_color: '#FFFFFF',
        items: [
          { id: '1', icon: '🌿', title: 'Extrait naturel', text: 'Actif principal' },
          { id: '2', icon: '🌸', title: 'Plante médicinale', text: 'Apaisant' },
          { id: '3', icon: '🍃', title: 'Huile essentielle', text: 'Régénérant' },
          { id: '4', icon: '💧', title: 'Acide hyaluronique', text: 'Hydratant' },
        ],
      }, 't11'),
      block('text_block', 'Mode d\'utilisation', {
        title: 'Mode d\'utilisation',
        content: '1. Nettoyez la zone concernée\n2. Appliquez une noisette de produit\n3. Massez doucement 2 minutes\n4. Répétez matin et soir',
        text_align: 'left',
        bg_color: c.surface,
        text_color: c.text,
      }, 't12'),
      block('testimonials', 'Avis clients', {
        title: 'Avis des clients',
        layout: 'list',
        bg_color: c.bg,
        items: [
          { id: '1', name: 'Prisca K.', rating: 5, text: 'Produit efficace, résultats en 5 jours. Je recommande !', verified: true },
          { id: '2', name: 'Aïcha M.', rating: 5, text: 'Livraison rapide et produit conforme.', verified: true },
        ],
      }, 't13'),
      block('comparison_table', 'Comparaison', {
        title: 'Pourquoi nous choisir ?',
        our_label: name,
        competitor_label: 'Concurrents',
        accent_color: c.accent,
        bg_color: c.surface,
        rows: [
          { feature: 'Formule naturelle', us: true, them: false },
          { feature: 'Résultats en 7 jours', us: true, them: false },
          { feature: 'Paiement à la livraison', us: true, them: false },
          { feature: 'Garantie satisfaction', us: true, them: false },
        ],
      }, 't14'),
      block('faq', 'FAQ', {
        title: 'Questions fréquentes',
        accent_color: c.accent,
        bg_color: c.surface,
        items: [
          { id: '1', question: '💳 Comment payer ?', answer: 'Paiement à la livraison uniquement. Aucun paiement en ligne.' },
          { id: '2', question: '📦 Délai de livraison ?', answer: '24 à 48h selon votre ville.' },
          { id: '3', question: '🔄 Retour possible ?', answer: 'Oui, sous 7 jours après réception.' },
        ],
      }, 't15'),
    ],
    footer: [
      block('Footer', 'Pied de page', {
        logo_text: name,
        copyright: `© ${new Date().getFullYear()} ${name}. Tous droits réservés.`,
        bg_color: '#111827',
        text_color: '#9CA3AF',
        show_newsletter: true,
        newsletter_title: 'Restez informé de nos offres',
      }, 'f1'),
    ],
  }
}

function buildCora(c: BoutiqueThemeColors, name: string) {
  return {
    header: [
      block('AnnouncementBar', "Barre d'annonce", {
        text: '🔥 50% OFF SALE ENDS SOON · FREE SHIPPING',
        bg_color: c.accent,
        text_color: '#FFFFFF',
        bar_height: 40,
        font_size: 12,
        font_weight: 'bold',
      }, 'h1'),
      block('Header', 'En-tête', {
        logo_text: name,
        logo_position: 'left',
        show_search: true,
        show_cart: true,
        bg_color: '#FFFFFF',
        text_color: c.text,
        nav_items: ['About Us', 'Home', 'Our Products', 'Track Your Order', 'Contact Us'],
      }, 'h2'),
    ],
    template: [
      block('Galerie', "Galerie d'images", {
        gallery_style: 'grid',
        image_ratio: '1/1',
        show_thumbnails: true,
        enable_zoom: true,
      }, 't1'),
      block('Titre', 'Titre produit', {
        tag: 'h1',
        font_size: 32,
        font_weight: 'bold',
        text_align: 'left',
        padding_top: 24,
        padding_bottom: 8,
      }, 't2'),
      block('Note de produit', 'Note', {
        rating: 5,
        reviews_count: '1000+ Happy Customers',
        star_color: c.gold,
        text_align: 'left',
      }, 't3'),
      block('Description', 'Sous-titre', {
        text: 'From stable to destination, watch over your horse during every moment of transport.',
        font_size: 16,
        text_color: c.text_soft,
        text_align: 'left',
        padding_bottom: 16,
      }, 't4'),
      block('Prix', 'Prix', {
        show_badge: true,
        badge_text: '50% OFF',
        badge_bg: c.accent,
        badge_text_color: '#FFFFFF',
        price_color: c.accent,
        show_original_price: true,
      }, 't5'),
      block('benefits', 'Avantages', {
        layout: 'checklist',
        bg_color: '#FFFFFF',
        text_color: c.text,
        icon_color: c.accent,
        items: [
          { id: '1', icon: '✓', title: 'Real-time horse monitoring' },
          { id: '2', icon: '✓', title: 'Spot issues instantly' },
          { id: '3', icon: '✓', title: 'Ensure road safety' },
        ],
      }, 't6'),
      block('OrderForm', 'Formulaire commande', {
        title: '',
        btn_text: 'Order Now',
        btn_color: c.accent,
        btn_text_color: '#FFFFFF',
        btn_width: 'full',
        bundles_enabled: true,
        bundle_layout: 'cards',
        bundles: [
          { id: 'b1', qty: 1, label: 'Single', sublabel: 'Standard Price', badge: '', discount_pct: 0, discount_fixed: 0, popular: false, hidden: false },
          { id: 'b2', qty: 2, label: 'Buy 2 Get One FREE', sublabel: '+ Phone Holder', badge: 'BEST OFFER', discount_pct: 50, discount_fixed: 0, popular: true, hidden: false },
        ],
        border_color: c.border,
        border_radius: 12,
        show_payment_icons: true,
      }, 't7'),
      block('trust_bar', 'Badge urgence', {
        show_countdown: true,
        countdown_text: 'Ends Soon: 50% Off + Free Shipping',
        icon_color: c.accent,
        bg_color: '#FFFFFF',
      }, 't8'),
      block('image_text', 'Image + Texte — Feature 1', {
        title: 'Best way to monitor your horse',
        text: 'Wireless | Magnetic | Waterproof | Durable | Rechargeable',
        image_position: 'left',
        bg_color: c.accent,
        text_color: '#FFFFFF',
        title_color: '#FFFFFF',
        padding: 64,
        image_border_radius: 12,
        show_cta: false,
      }, 't9'),
      block('text_block', 'Headline centre', {
        title: 'Your Horse\'s Well Being Right At Your Fingertips',
        content: 'EquiWatch™ allows you to track and monitor your horse\'s condition in real-time. No more guessing or worrying about how your horse is doing.',
        text_align: 'center',
        bg_color: '#FFFFFF',
        text_color: c.text,
        title_font_size: 28,
        content_font_size: 16,
        padding: 48,
      }, 't10'),
      block('icon_grid', 'Features', {
        title: '',
        columns: 4,
        bg_color: '#FFFFFF',
        icon_color: c.accent,
        items: [
          { id: '1', icon: '📡', title: 'Wireless Connectivity', text: 'Seamlessly stream HD video with a reliable wireless connection for uninterrupted towing.' },
          { id: '2', icon: '💧', title: 'Waterproof & Weatherproof', text: 'Built to withstand all elements, so you can travel with peace of mind in any environment.' },
          { id: '3', icon: '🎥', title: 'High-Quality Resolution', text: 'Crystal-clear video so you won\'t miss a single detail.' },
          { id: '4', icon: '📐', title: 'Wide-Angle Lens', text: 'Get a complete view of your horse, even in tight light spots and around every corner of your trailer.' },
        ],
        padding: 48,
      }, 't11'),
      block('image_text', 'Pourquoi nous choisir', {
        title: 'Why Choose EquiWatch™ Camera?',
        text: '✔ Real-Time Monitoring — Watch your horse\'s every move and catch any signs of stress instantly.\n✔ No Internet Needed — Only connected within a 12-meter range, so you can travel with peace of mind every mile.\n✔ Easy Setup — Quick installation with no complicated wiring or tools required.\n✔ Compact & Portable — Perfect for horse trailers, it won\'t take up space but gives you total visibility.',
        image_position: 'right',
        bg_color: c.surface,
        text_color: c.text,
        title_color: c.accent,
        padding: 64,
        image_border_radius: 12,
        show_cta: false,
      }, 't12'),
      block('comparison_table', 'US VS THEM', {
        title: 'US VS THEM',
        our_label: name.toUpperCase(),
        competitor_label: 'Other',
        accent_color: c.accent,
        bg_color: '#FFFFFF',
        highlight_our_column: true,
        rows: [
          { feature: 'Wireless', us: true, them: false },
          { feature: 'Night Vision', us: true, them: false },
          { feature: 'Real-Time Monitoring', us: true, them: false },
          { feature: 'Long-Lasting Battery', us: true, them: false },
          { feature: 'Strong Mount', us: true, them: false },
        ],
        padding: 48,
      }, 't13'),
      block('image_text', 'What\'s Inside the Box', {
        title: 'What\'s Inside the Box:',
        text: '✓ 1 x EquiWatch™ Camera\n✓ 1 x Holder\n✓ 1 x USB Cable\n✓ 1 x 32G Card\n✓ 1 x Manual Instruction',
        image_position: 'left',
        bg_color: c.surface,
        text_color: c.text,
        title_color: c.accent,
        padding: 48,
        image_border_radius: 12,
        show_cta: false,
      }, 't14'),
      block('faq', 'FAQ', {
        title: 'FAQs',
        layout: '2-columns',
        accent_color: c.accent,
        bg_color: '#FFFFFF',
        items: [
          { id: '1', question: 'How easy is it to install the EquiWatch™ camera in my horse trailer?', answer: 'Very easy! The installation takes less than 5 minutes with no tools required.' },
          { id: '2', question: 'How does the EquiWatch™ camera connect to my phone?', answer: 'It connects via a direct WiFi signal within 12 meters.' },
          { id: '3', question: 'What is the battery life of the EquiWatch™ camera, and how is it charged?', answer: 'Up to 8 hours of continuous use. Charges via USB.' },
          { id: '4', question: 'Can I use the EquiWatch™ camera in any type of trailer?', answer: 'Yes, it works with all standard horse trailers.' },
          { id: '5', question: 'Does the EquiWatch™ camera work at night or in low light conditions?', answer: 'Yes, it features infrared night vision for clear viewing in any lighting.' },
        ],
        padding: 48,
      }, 't15'),
    ],
    footer: [
      block('Footer', 'Pied de page', {
        logo_text: name,
        copyright: `© ${new Date().getFullYear()} ${name}. All rights reserved.`,
        bg_color: '#1A1A2E',
        text_color: '#9CA3AF',
        show_newsletter: true,
        newsletter_title: 'Subscribe to our newsletter to receive updates, access to exclusive deals, and more.',
        columns: [
          { title: 'About ' + name, links: ['We are committed to providing our customers with the best products.', 'Contact Us'] },
          { title: 'Faster menu', links: ['Contact Us', 'Privacy Policy', 'Refund Policy', 'Shipping Policy', 'Terms of Service'] },
        ],
      }, 'f1'),
    ],
  }
}

const SECTION_BUILDERS: Record<string, (c: BoutiqueThemeColors, name: string) => { header: StoreBlock[]; template: StoreBlock[]; footer: StoreBlock[] }> = {
  'nature-vert': buildNatureVert,
  'clinique-bleu': buildCliniqueBleu,
  'ambre-premium': buildAmbrePremium,
  'conversion-pro': buildConversionPro,
  'cora': buildCora,
}

/** Construit le builder_json complet pour une nouvelle boutique */
export function buildStorePage(
  themeId: string,
  storeName: string,
  productId?: string | null,
): BuiltStorePage {
  const theme = getBoutiqueTheme(themeId)
  const builder = SECTION_BUILDERS[theme.id] ?? buildNatureVert
  const sections = builder(theme.colors, storeName)

  return {
    header: sections.header,
    template: sections.template,
    footer: sections.footer,
    themeSettings: buildThemeSettings(theme),
    selectedProductId: productId ?? null,
  }
}

/** Alias pour l'UI de sélection (remplace l'ancien THEMES de defaults.ts) */
export function getThemesForPicker() {
  return BOUTIQUE_THEMES.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    tags: t.tags,
    preview_image: t.preview_image,
    preview_color: t.colors.accent,
    default_colors: toStoreColors(t),
    default_fonts: toStoreFonts(t),
  }))
}
