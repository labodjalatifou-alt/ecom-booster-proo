// Partition du template selon le layout du thème (structure visuelle, pas les couleurs)

export type LayoutMode = 'single-column' | 'hero-split' | 'hero-triple'

const GALLERY = new Set(['Galerie', 'medias', 'gallery'])
const FORM = new Set(['OrderForm', 'order_form'])
const PRODUCT_INFO = new Set(['Titre', 'Note de produit', 'Prix'])
const HERO_SIDEBAR = new Set(['trust_bar', 'stock_urgency'])

export interface TemplateParts {
  gallery: any[]
  form: any[]
  productInfo: any[]
  heroSidebar: any[]
  heroMarketing: any[]
  heroBuyColumn: any[]
  rest: any[]
}

function pick(template: any[], types: Set<string>) {
  return template.filter(b => types.has(b.type))
}

function pickFirst(template: any[], type: string) {
  return template.find(b => b.type === type) ?? null
}

/** Découpe le template en zones hero + reste selon le layout */
export function partitionTemplate(template: any[], layout: LayoutMode): TemplateParts {
  const gallery = pick(template, GALLERY)
  const form = pick(template, FORM)
  const productInfo = pick(template, PRODUCT_INFO)
  const heroSidebar = pick(template, HERO_SIDEBAR)

  const usedIds = new Set<string>([
    ...gallery,
    ...form,
    ...productInfo,
    ...heroSidebar,
  ].map(b => b.id))

  const heroMarketing: any[] = []
  const heroBuyColumn: any[] = []

  if (layout === 'hero-triple') {
    const ba = pickFirst(template, 'before_after')
    const tb = pickFirst(template, 'text_block')
    if (ba) { heroMarketing.push(ba); usedIds.add(ba.id) }
    if (tb) { heroMarketing.push(tb); usedIds.add(tb.id) }
  }

  if (layout === 'hero-split') {
    const desc = pickFirst(template, 'Description')
    if (desc) { heroBuyColumn.push(desc); usedIds.add(desc.id) }
  }

  const rest = template.filter(b => !usedIds.has(b.id))

  return { gallery, form, productInfo, heroSidebar, heroMarketing, heroBuyColumn, rest }
}

export function resolveLayout(themeSettings?: Record<string, any>): LayoutMode {
  const l = themeSettings?.layout
  if (l === 'hero-split' || l === 'hero-triple' || l === 'single-column') return l
  return 'single-column'
}
