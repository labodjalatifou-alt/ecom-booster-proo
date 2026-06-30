/** Palettes prédéfinies pour formulaire + bundles (modifiables ensuite) */
export const FORM_COLOR_PRESETS = [
  {
    id: 'coral',
    name: 'Corail',
    bg_color: '#FFFFFF',
    border_color: '#F0D9D2',
    title_color: '#3A2A2E',
    subtitle_color: '#7A6469',
    label_color: '#7A6469',
    btn_color: '#E8527A',
    input_bg: '#FAFAFA',
    input_border: '#E5E7EB',
    bundle_selected_bg: '#FFF5F7',
    bundle_selected_border: '#E8527A',
    bundle_bg: '#FFFFFF',
    bundle_border: '#E5E7EB',
    bundle_badge_bg: '#E8527A',
    bundle_badge_text: '#FFFFFF',
  },
  {
    id: 'ocean',
    name: 'Océan',
    bg_color: '#F0F9FF',
    border_color: '#BAE6FD',
    title_color: '#0C4A6E',
    subtitle_color: '#0369A1',
    label_color: '#0284C7',
    btn_color: '#0284C7',
    input_bg: '#FFFFFF',
    input_border: '#BAE6FD',
    bundle_selected_bg: '#E0F2FE',
    bundle_selected_border: '#0284C7',
    bundle_bg: '#FFFFFF',
    bundle_border: '#BAE6FD',
    bundle_badge_bg: '#0284C7',
    bundle_badge_text: '#FFFFFF',
  },
  {
    id: 'forest',
    name: 'Forêt',
    bg_color: '#F0FDF4',
    border_color: '#BBF7D0',
    title_color: '#14532D',
    subtitle_color: '#166534',
    label_color: '#15803D',
    btn_color: '#16A34A',
    input_bg: '#FFFFFF',
    input_border: '#BBF7D0',
    bundle_selected_bg: '#DCFCE7',
    bundle_selected_border: '#16A34A',
    bundle_bg: '#FFFFFF',
    bundle_border: '#BBF7D0',
    bundle_badge_bg: '#16A34A',
    bundle_badge_text: '#FFFFFF',
  },
  {
    id: 'midnight',
    name: 'Minuit',
    bg_color: '#1F2937',
    border_color: '#374151',
    title_color: '#F9FAFB',
    subtitle_color: '#9CA3AF',
    label_color: '#D1D5DB',
    btn_color: '#6366F1',
    input_bg: '#111827',
    input_border: '#4B5563',
    bundle_selected_bg: '#312E81',
    bundle_selected_border: '#6366F1',
    bundle_bg: '#1F2937',
    bundle_border: '#374151',
    bundle_badge_bg: '#6366F1',
    bundle_badge_text: '#FFFFFF',
  },
  {
    id: 'gold',
    name: 'Or Premium',
    bg_color: '#FFFBEB',
    border_color: '#FDE68A',
    title_color: '#78350F',
    subtitle_color: '#92400E',
    label_color: '#B45309',
    btn_color: '#D97706',
    input_bg: '#FFFFFF',
    input_border: '#FDE68A',
    bundle_selected_bg: '#FEF3C7',
    bundle_selected_border: '#D97706',
    bundle_bg: '#FFFFFF',
    bundle_border: '#FDE68A',
    bundle_badge_bg: '#D97706',
    bundle_badge_text: '#FFFFFF',
  },
  {
    id: 'rose',
    name: 'Rose',
    bg_color: '#FFF1F2',
    border_color: '#FECDD3',
    title_color: '#881337',
    subtitle_color: '#BE123C',
    label_color: '#BE123C',
    btn_color: '#E11D48',
    input_bg: '#FFFFFF',
    input_border: '#FECDD3',
    bundle_selected_bg: '#FFE4E6',
    bundle_selected_border: '#E11D48',
    bundle_bg: '#FFFFFF',
    bundle_border: '#FECDD3',
    bundle_badge_bg: '#E11D48',
    bundle_badge_text: '#FFFFFF',
  },
] as const

export const DEFAULT_BUNDLES = [
  { id: 'b1', qty: 1, label: '1 article', sublabel: 'Prix standard · livraison incluse', badge: '', discount_pct: 0, discount_fixed: 0, popular: false, hidden: false },
  { id: 'b2', qty: 2, label: '2 articles', sublabel: 'Pack duo — économisez 15%', badge: '🔥 LE PLUS POPULAIRE', discount_pct: 15, discount_fixed: 0, popular: true, hidden: false },
  { id: 'b3', qty: 3, label: '3 articles', sublabel: 'Meilleure offre — économisez 25%', badge: '⭐ MEILLEURE OFFRE', discount_pct: 25, discount_fixed: 0, popular: false, hidden: false },
]

/** Templates bundles pré-remplis — les prix sont calculés automatiquement à l'affichage */
export function buildDefaultBundles(_unitPrice?: number, _currency = 'FCFA') {
  return DEFAULT_BUNDLES.map(b => ({ ...b }))
}

/** Complète les réglages OrderForm manquants (bundles, layout, etc.) */
export function ensureOrderFormSettings(
  settings: Record<string, any> = {},
  unitPrice = 15000,
  currency = 'FCFA',
) {
  const next = { ...settings }
  if (next.bundles_enabled === undefined) next.bundles_enabled = true
  if (!next.bundle_layout) next.bundle_layout = 'deals'
  if (next.show_subtitle === undefined) next.show_subtitle = false
  if (next.btn_animation === undefined) next.btn_animation = 'pulse'
  if (!Array.isArray(next.bundles) || next.bundles.length === 0) {
    next.bundles = buildDefaultBundles(unitPrice, currency)
  }
  return next
}

/** Calcule le prix final d'une offre (% ou montant fixe FCFA) */
export function calcBundleTotal(unitPrice: number, qty: number, bundle: { discount_pct?: number; discount_fixed?: number }) {
  const raw = unitPrice * qty
  const fixed = Number(bundle.discount_fixed) || 0
  if (fixed > 0) return Math.max(0, Math.round(raw - fixed))
  const pct = Number(bundle.discount_pct) || 0
  return Math.round(raw * (1 - pct / 100))
}

export function enrichBundleSublabel(bundle: any, unitPrice: number, currency = 'FCFA') {
  if (!unitPrice || bundle.sublabel?.trim()) return bundle
  const total = calcBundleTotal(unitPrice, bundle.qty || 1, bundle)
  const raw = unitPrice * (bundle.qty || 1)
  const saved = raw - total
  if (saved > 0) {
    return {
      ...bundle,
      sublabel: `Économisez ${saved.toLocaleString('fr-FR')} ${currency} · ${total.toLocaleString('fr-FR')} ${currency} au total`,
    }
  }
  return { ...bundle, sublabel: `${total.toLocaleString('fr-FR')} ${currency}` }
}

export const TESTIMONIAL_ANIMATIONS = [
  { id: 'float', label: 'Flottement doux' },
  { id: 'sway', label: 'Balancement' },
  { id: 'none', label: 'Aucune' },
] as const
