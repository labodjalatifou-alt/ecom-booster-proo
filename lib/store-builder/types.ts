// ============================================
// STORE BUILDER — Types TypeScript
// lib/store-builder/types.ts
// ============================================

// ---------- Couleurs & Fonts ----------
export interface StoreColors {
  primary: string
  secondary: string
  accent: string
  text: string
  textLight: string
  bg: string
  bgSection: string
  border: string
  success: string
  danger: string
}

export interface StoreFonts {
  heading: string
  body: string
}

// ---------- Pixels tracking ----------
export interface StorePixels {
  meta: string
  tiktok: string
  google: string
}

// ---------- Paramètres boutique ----------
export interface StoreSettings {
  id: string
  store_id: string
  theme_id: string
  colors: StoreColors
  fonts: StoreFonts
  pixels: StorePixels
  custom_css: string
  updated_at: string
}

// ---------- Boutique ----------
export type StoreStatus = 'draft' | 'published' | 'paused'

export interface Store {
  id: string
  user_id: string
  name: string
  slug: string
  logo_url: string | null
  status: StoreStatus
  created_at: string
  settings?: StoreSettings
}

export type StoreType = Store

// ---------- Produit ----------
export interface ProductVariant {
  name: string
  options: string[]
}

export interface StoreProduct {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  compare_price: number | null
  images: string[]
  variants: ProductVariant[]
  stock: number
  created_at: string
}

// ---------- Commande ----------
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface StoreOrder {
  id: string
  store_id: string
  product_id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_address: string
  quantity: number
  total_price: number
  variant_chosen: Record<string, string> | null
  status: OrderStatus
  notes: string
  created_at: string
}

// ============================================
// BUILDER — Sections & Blocs
// ============================================

export type SectionType =
  | 'hero'
  | 'product'
  | 'countdown'
  | 'order_form'
  | 'testimonials'
  | 'benefits'
  | 'gallery'
  | 'faq'
  | 'badge_trust'
  | 'video'
  | 'text_block'
  | 'spacer'
  | 'footer'

// ---------- Props par type de section ----------

export interface HeroProps {
  headline: string
  subheadline: string
  cta_text: string
  cta_link: string
  image_url: string
  image_position: 'left' | 'right' | 'background' | 'none'
  overlay_opacity: number
  text_align: 'left' | 'center' | 'right'
  bg_color: string
  text_color: string
  animation: 'none' | 'fadeIn' | 'slideUp'
}

export interface ProductProps {
  product_id: string
  show_price: boolean
  show_compare_price: boolean
  show_description: boolean
  show_images: boolean
  show_variants: boolean
  show_stock: boolean
  cta_text: string
  cta_color: string
  layout: 'classic' | 'centered' | 'split'
}

export interface CountdownProps {
  target_date: string
  title: string
  show_days: boolean
  show_hours: boolean
  show_minutes: boolean
  show_seconds: boolean
  bg_color: string
  text_color: string
  timer_bg: string
  on_expire: 'hide' | 'reset' | 'message'
  expire_message: string
}

export interface OrderFormProps {
  title: string
  fields: FormField[]
  submit_text: string
  submit_color: string
  submit_text_color: string
  success_message: string
  bg_color: string
  border_radius: number
  show_product_summary: boolean
}

export interface FormField {
  id: string
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea' | 'checkbox'
  label: string
  placeholder: string
  required: boolean
  options?: string[]
}

export interface TestimonialsProps {
  title: string
  items: TestimonialItem[]
  layout: 'grid' | 'carousel' | 'list'
  bg_color: string
  show_stars: boolean
  stars_count: number
}

export interface TestimonialItem {
  id: string
  name: string
  text: string
  avatar_url: string
  rating: number
  location: string
}

export interface BenefitsProps {
  title: string
  items: BenefitItem[]
  layout: 'row' | 'grid'
  icon_color: string
  bg_color: string
}

export interface BenefitItem {
  id: string
  icon: string
  title: string
  text: string
}

export interface GalleryProps {
  images: string[]
  columns: 2 | 3 | 4
  gap: number
  border_radius: number
}

export interface FaqProps {
  title: string
  items: FaqItem[]
  bg_color: string
  accent_color: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface BadgeTrustProps {
  items: BadgeItem[]
  layout: 'row' | 'grid'
  bg_color: string
  icon_color: string
}

export interface BadgeItem {
  id: string
  icon: string
  text: string
}

export interface VideoProps {
  url: string
  title: string
  autoplay: boolean
  loop: boolean
  muted: boolean
}

export interface TextBlockProps {
  content: string
  text_align: 'left' | 'center' | 'right'
  bg_color: string
  text_color: string
  max_width: number
}

export interface SpacerProps {
  height: number
  bg_color: string
}

export interface FooterProps {
  text: string
  links: { label: string; url: string }[]
  bg_color: string
  text_color: string
  show_whatsapp: boolean
  whatsapp_number: string
}

// ---------- Union de tous les props ----------
export type SectionProps =
  | HeroProps
  | ProductProps
  | CountdownProps
  | OrderFormProps
  | TestimonialsProps
  | BenefitsProps
  | GalleryProps
  | FaqProps
  | BadgeTrustProps
  | VideoProps
  | TextBlockProps
  | SpacerProps
  | FooterProps

// ---------- Section dans le builder ----------
export interface BuilderSection {
  id: string
  type: SectionType
  props: SectionProps
  visible: boolean
}

// ---------- Page builder ----------
export interface BuilderPage {
  sections: BuilderSection[]
}

// ---------- Page en base ----------
export interface StorePage {
  id: string
  store_id: string
  slug: string
  title: string
  builder_json: BuilderPage
  is_published: boolean
  updated_at: string
}

// ============================================
// THÈMES
// ============================================

export interface ThemePreview {
  id: string
  name: string
  description: string
  preview_image: string
  tags: string[]
  default_colors: StoreColors
  default_fonts: StoreFonts
}

// ============================================
// STATE ÉDITEUR
// ============================================

export interface EditorState {
  activeSectionId: string | null
  isDragging: boolean
  previewMode: 'desktop' | 'mobile'
  isSaving: boolean
  hasUnsavedChanges: boolean
  activeTab: 'sections' | 'design' | 'settings'
}

// ============================================
// CATALOGUE DES SECTIONS DISPONIBLES
// ============================================

export interface SectionCatalogItem {
  type: SectionType
  label: string
  icon: string
  description: string
  defaultProps: SectionProps
}
