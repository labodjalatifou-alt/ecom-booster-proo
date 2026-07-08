// Partition du template selon le layout du thème (structure visuelle, pas les couleurs)

export type LayoutMode = 'single-column' | 'hero-split' | 'hero-triple'

const GALLERY_TYPES = new Set(['Galerie', 'medias', 'gallery'])
const FORM_TYPES = new Set(['OrderForm', 'order_form'])
const PRODUCT_INFO_TYPES = new Set(['Titre', 'Note de produit', 'Prix'])
const HERO_SIDEBAR_TYPES = new Set(['trust_bar', 'stock_urgency'])

export interface TemplateParts {
  gallery: any[]
  form: any[]
  productInfo: any[]
  heroSidebar: any[]
  heroMarketing: any[]
  heroBuyColumn: any[]
  rest: any[]
}

function pick(template: any[], types: Set<string>): any[] {
  return template.filter(b => types.has(b.type))
}

function pickFirst(template: any[], type: string): any | null {
  return template.find(b => b.type === type) ?? null
}

/** Découpe le template en zones hero + reste selon le layout */
export function partitionTemplate(template: any[], layout: LayoutMode): TemplateParts {
  const gallery     = pick(template, GALLERY_TYPES)
  const form        = pick(template, FORM_TYPES)
  const productInfo = pick(template, PRODUCT_INFO_TYPES)
  const heroSidebar = pick(template, HERO_SIDEBAR_TYPES)

  // Construire l'ensemble des IDs déjà assignés à une zone hero
  const heroBlocks = [...gallery, ...form, ...productInfo, ...heroSidebar]
  const usedIds = new Set<string>(heroBlocks.map(b => b.id))

  const heroMarketing: any[] = []
  const heroBuyColumn: any[] = []

  if (layout === 'hero-triple') {
    const ba = pickFirst(template, 'before_after')
    const tb = pickFirst(template, 'text_block')
    if (ba && !usedIds.has(ba.id)) { heroMarketing.push(ba); usedIds.add(ba.id) }
    if (tb && !usedIds.has(tb.id)) { heroMarketing.push(tb); usedIds.add(tb.id) }
  }

  if (layout === 'hero-split') {
    const desc = pickFirst(template, 'Description')
    if (desc && !usedIds.has(desc.id)) { heroBuyColumn.push(desc); usedIds.add(desc.id) }
  }

  const rest = template.filter(b => !usedIds.has(b.id))

  return { gallery, form, productInfo, heroSidebar, heroMarketing, heroBuyColumn, rest }
}

export function resolveLayout(themeSettings?: Record<string, any>): LayoutMode {
  const l = themeSettings?.layout
  if (l === 'hero-split' || l === 'hero-triple' || l === 'single-column') return l
  return 'single-column'
}
