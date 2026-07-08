// Partition du template selon le layout du thème (structure visuelle, pas les couleurs)

export type LayoutMode = 'single-column' | 'hero-split' | 'hero-triple'

const GALLERY_TYPES = new Set(['Galerie', 'medias', 'gallery'])
const FORM_TYPES = new Set(['OrderForm', 'order_form'])

const FULL_WIDTH_TYPES = new Set([
  'icon_grid', 'before_after', 'testimonials', 'testimonials_floating', 
  'comparison_table', 'faq', 'video', 'image_with_text', 'guarantees', 
  'pricing_table', 'newsletter', 'product_grid', 'slideshow'
])

export interface TemplateParts {
  gallery: any[]
  form: any[]
  productInfo: any[]
  heroSidebar: any[]
  heroMarketing: any[]
  heroBuyColumn: any[]
  rest: any[]
}

/** Découpe le template en zones hero + reste selon le layout, de manière dynamique */
export function partitionTemplate(template: any[], layout: LayoutMode): TemplateParts {
  const gallery = template.filter(b => GALLERY_TYPES.has(b.type))
  const galleryIds = new Set(gallery.map(b => b.id))
  
  // Tout ce qui n'est pas la galerie
  const withoutGallery = template.filter(b => !galleryIds.has(b.id))
  
  // Trouver où s'arrête la zone "Hero" (dès qu'on rencontre un bloc 100% largeur)
  let splitIndex = withoutGallery.findIndex(b => FULL_WIDTH_TYPES.has(b.type))
  
  // Si on est en layout single-column, tout va dans rest pour être affiché de haut en bas
  if (layout === 'single-column') {
    return { gallery: [], form: [], productInfo: [], heroSidebar: [], heroMarketing: [], heroBuyColumn: [], rest: template }
  }

  // Dans les layouts multi-colonnes, si pas de bloc full-width, tout le reste est dans le hero
  if (splitIndex === -1) {
    splitIndex = withoutGallery.length
  }
  
  const heroBlocks = withoutGallery.slice(0, splitIndex)
  const rest = withoutGallery.slice(splitIndex)
  
  // Extraire le formulaire pour le hero-triple qui le met dans une colonne dédiée
  const form = heroBlocks.filter(b => FORM_TYPES.has(b.type))
  const formIds = new Set(form.map(b => b.id))
  
  // Tout le reste du hero devient "productInfo" (le nom de la variable est conservé pour la compatibilité,
  // mais ça contient en réalité tous les blocs hero : Titre, Prix, Compte à rebours, Description, etc.)
  const otherHero = heroBlocks.filter(b => !formIds.has(b.id))
  
  return { 
    gallery, 
    form, 
    productInfo: otherHero, 
    heroSidebar: [], 
    heroMarketing: [], 
    heroBuyColumn: [], 
    rest 
  }
}

export function resolveLayout(themeSettings?: Record<string, any>): LayoutMode {
  const l = themeSettings?.layout
  if (l === 'hero-split' || l === 'hero-triple' || l === 'single-column') return l
  return 'single-column'
}
