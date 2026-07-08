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
  layout: 'single-column' | 'hero-split' | 'hero-triple'
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

  // ── 3. LUXE NOIR — Dark luxury, black & gold, premium brand ─────────────
  {
    id: 'ambre-premium',
    name: 'Luxe Noir',
    description: 'Luxe intense — fond sombre, or, serif élégant. Marque premium haut de gamme.',
    tags: ['luxe', 'premium', 'beauté'],
    preview_image: '/themes/s1.png',
    layout: 'hero-split',
    cardMaxWidth: 960,
    colors: {
      bg: '#0F0F0F',
      surface: '#1A1A1A',
      text: '#F5F0E8',
      text_soft: '#A09080',
      accent: '#C9A84C',
      accent_deep: '#A07830',
      gold: '#E8C96A',
      border: '#2E2A24',
    },
    fonts: { display: "'Playfair Display', serif", body: "'Outfit', sans-serif" },
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
        text: `✦ ${name} — Livraison gratuite à partir de 50€ · Paiement sécurisé ✦`,
        bg_color: '#0A0A0A',
        text_color: c.gold,
        bar_height: 38,
        font_size: 11,
        font_weight: 600,
      }, 'h1'),
      block('Header', 'En-tête', {
        logo_text: name,
        logo_position: 'center',
        show_search: false,
        show_cart: true,
        bg_color: c.surface,
        text_color: c.text,
      }, 'h2'),
    ],
    template: [
      block('Galerie', "Galerie d'images", {}, 't1'),
      block('Titre', 'Titre produit', { padding_top: 16 }, 't2'),
      block('Note de produit', 'Note', { rating: 5, reviews_count: '318 avis', star_color: c.gold }, 't3'),
      block('Prix', 'Prix', {
        show_badge: true, badge_text: 'EXCLUSIF',
        badge_bg: c.accent, badge_text_color: '#0A0A0A',
        price_color: c.gold,
      }, 't4'),
      block('OrderForm', 'Formulaire commande', {
        title: 'Réserver ma commande',
        btn_text: '✦ COMMANDER — LIVRAISON OFFERTE',
        btn_color: c.accent,
        btn_text_color: '#0A0A0A',
        bg_color: c.surface,
        border_color: c.border,
        border_radius: 16,
        form_style: 'modern',
        bundles_enabled: false,
      }, 't5'),
      block('marquee', 'Bandeau', {
        text: `✦ ${name} — Expédié en 24h · Emballage luxe · Satisfait ou remboursé ✦`,
        bg_color: c.accent,
        text_color: '#0A0A0A',
        speed: 25,
      }, 't6'),
      block('Description', 'Description', { padding_top: 32, padding_bottom: 32 }, 't7'),
      block('image_text', 'L\'artisanat', {
        title: 'Formulé pour l\'excellence',
        text: 'Chaque produit est élaboré avec une sélection d\'ingrédients rares, choisis pour leur efficacité et leur pureté. Un savoir-faire artisanal au service de votre beauté.',
        image_position: 'right',
        bg_color: c.surface,
        text_color: c.text,
        title_color: c.gold,
        cta_text: 'Découvrir notre philosophie',
        cta_color: c.accent,
        padding_top: 64,
        padding_bottom: 64,
      }, 't8'),
      block('stats', 'Chiffres', {
        title: '',
        bg_color: '#0A0A0A',
        text_color: c.text,
        accent_color: c.gold,
        items: [
          { id: '1', number: '318', suffix: '+', label: 'Avis Vérifiés', icon: '⭐' },
          { id: '2', number: '100', suffix: '%', label: 'Ingrédients Naturels', icon: '🌿' },
          { id: '3', number: '24', suffix: 'h', label: 'Expédition Express', icon: '📦' },
          { id: '4', number: '30', suffix: 'j', label: 'Remboursement', icon: '🛡️' },
        ],
      }, 't9'),
      block('testimonials', 'Avis clients', {
        title: 'Ce que disent nos clients',
        layout: 'list',
        bg_color: c.bg,
        items: [
          { id: '1', name: 'Isabelle M.', rating: 5, text: 'Un produit d\'une qualité exceptionnelle. Le packaging seul vaut le détour.', verified: true },
          { id: '2', name: 'Aurélie K.', rating: 5, text: 'Les résultats sont bluffants. Je ne me vois plus sans.', verified: true },
          { id: '3', name: 'Yasmine B.', rating: 5, text: 'Livraison parfaite, produit sublime. Merci !', verified: true },
        ],
      }, 't10'),
      block('guarantees', 'Valeurs Luxe', {
        title: '',
        layout: 'row',
        bg_color: c.surface,
        icon_color: c.gold,
        items: [
          { id: '1', icon: '✦', title: 'Certifié Premium', text: '' },
          { id: '2', icon: '🌿', title: '100% Naturel', text: '' },
          { id: '3', icon: '📦', title: 'Emballage Luxe', text: '' },
          { id: '4', icon: '🛡️', title: 'Remboursé 30j', text: '' },
        ],
      }, 't11'),
      block('faq', 'FAQ', {
        title: 'Vos Questions',
        accent_color: c.accent,
        bg_color: c.bg,
        items: [
          { id: '1', question: 'Mode d\'emploi', answer: 'Appliquer le soir sur peau propre. Laisser agir toute la nuit.' },
          { id: '2', question: 'Livraison', answer: 'Expédition sous 24h. Colis discret et emballage luxe.' },
          { id: '3', question: 'Remboursement', answer: 'Satisfait ou remboursé sous 30 jours, sans question.' },
        ],
      }, 't12'),
    ],
    footer: [
      block('Footer', 'Pied de page', {
        logo_text: name,
        copyright: `© ${new Date().getFullYear()} ${name}. Tous droits réservés.`,
        bg_color: '#0A0A0A',
        text_color: '#6B5A48',
      }, 'f1'),
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

const SECTION_BUILDERS: Record<string, (c: BoutiqueThemeColors, name: string) => { header: StoreBlock[]; template: StoreBlock[]; footer: StoreBlock[] }> = {
  'nature-vert': buildNatureVert,
  'clinique-bleu': buildCliniqueBleu,
  'ambre-premium': buildAmbrePremium,
  'conversion-pro': buildConversionPro,
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
