// ============================================
// STORE BUILDER — Types TypeScript (v2 — 25 sections)
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
// BUILDER — 25 Types de sections
// ============================================

export type SectionType =
  | 'announcement_bar'
  | 'hero'
  | 'marquee'
  | 'product'
  | 'countdown'
  | 'testimonials'
  | 'benefits'
  | 'before_after'
  | 'stats'
  | 'gallery'
  | 'faq'
  | 'comparison_table'
  | 'guarantees'
  | 'video'
  | 'image_with_text'
  | 'order_form'
  | 'pricing_table'
  | 'newsletter'
  | 'slideshow'
  | 'icon_grid'
  | 'product_grid'
  | 'text_block'
  | 'spacer'
  | 'popup'
  | 'footer'

// ============================================
// PROPS PAR SECTION
// ============================================

export interface AnnouncementBarProps {
  messages: string[]
  bg_color: string
  text_color: string
  speed: number
  show_close: boolean
}

export interface HeroProps {
  headline: string
  subheadline: string
  badge_text: string
  show_badge: boolean
  badge_color: string
  cta_text: string
  cta_text_2: string
  cta_link: string
  image_url: string
  image_position: 'left' | 'right' | 'background' | 'none'
  overlay_opacity: number
  text_align: 'left' | 'center' | 'right'
  bg_color: string
  text_color: string
  animation: 'none' | 'fadeIn' | 'slideUp'
}

export interface MarqueeProps {
  items: { text: string; icon: string }[]
  speed: number
  bg_color: string
  text_color: string
  direction: 'left' | 'right'
}

export interface ProductProps {
  product_id: string
  layout: 'split' | 'centered' | 'magazine'
  show_price: boolean
  show_compare_price: boolean
  show_description: boolean
  show_images: boolean
  show_variants: boolean
  show_stock_counter: boolean
  show_reviews_count: boolean
  cta_text: string
  cta_color: string
  urgency_text: string
  show_urgency: boolean
}

export interface CountdownProps {
  target_date: string
  title: string
  subtitle: string
  show_days: boolean
  show_hours: boolean
  show_minutes: boolean
  show_seconds: boolean
  bg_color: string
  text_color: string
  timer_bg: string
  accent_color: string
  on_expire: 'hide' | 'reset' | 'message'
  expire_message: string
}

export interface TestimonialItem {
  id: string
  name: string
  text: string
  avatar_url: string
  rating: number
  location: string
  date: string
  verified: boolean
}

export interface TestimonialsProps {
  title: string
  subtitle: string
  items: TestimonialItem[]
  layout: 'grid' | 'carousel' | 'masonry' | 'floating'
  bg_color: string
  show_stars: boolean
  show_verified: boolean
  show_photos: boolean
}

export interface BenefitItem {
  id: string
  icon: string
  title: string
  text: string
  color: string
}

export interface BenefitsProps {
  title: string
  subtitle: string
  items: BenefitItem[]
  layout: 'row' | 'grid' | 'cards' | 'numbered'
  bg_color: string
  icon_style: 'emoji' | 'circle' | 'square'
}

export interface BeforeAfterProps {
  title: string
  before_image: string
  after_image: string
  before_label: string
  after_label: string
  bg_color: string
}

export interface StatItem {
  id: string
  number: number
  suffix: string
  label: string
  icon: string
}

export interface StatsProps {
  title: string
  items: StatItem[]
  bg_color: string
  text_color: string
  accent_color: string
}

export interface GalleryProps {
  title: string
  images: string[]
  layout: 'grid' | 'masonry' | 'carousel' | 'filmstrip'
  columns: 2 | 3 | 4
  gap: number
  border_radius: number
  show_lightbox: boolean
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FaqProps {
  title: string
  subtitle: string
  items: FaqItem[]
  bg_color: string
  accent_color: string
  style: 'classic' | 'bordered' | 'minimal'
}

export interface ComparisonRow {
  feature: string
  us: boolean | string
  them: boolean | string
}

export interface ComparisonTableProps {
  title: string
  our_label: string
  competitor_label: string
  rows: ComparisonRow[]
  bg_color: string
  accent_color: string
}

export interface GuaranteeItem {
  id: string
  icon: string
  title: string
  text: string
}

export interface GuaranteesProps {
  title: string
  items: GuaranteeItem[]
  layout: 'row' | 'grid'
  bg_color: string
  icon_color: string
  style: 'minimal' | 'cards' | 'bordered'
}

export interface VideoProps {
  title: string
  subtitle: string
  url: string
  poster_image: string
  autoplay: boolean
  loop: boolean
  show_controls: boolean
  aspect_ratio: '16:9' | '9:16' | '1:1'
  bg_color: string
}

export interface ImageWithTextProps {
  title: string
  subtitle: string
  text: string
  image_url: string
  image_position: 'left' | 'right'
  cta_text: string
  cta_link: string
  bg_color: string
  text_color: string
  image_style: 'rounded' | 'square' | 'circle'
}

export interface FormField {
  id: string
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea' | 'checkbox'
  label: string
  placeholder: string
  required: boolean
  options?: string[]
}

export interface OrderFormProps {
  title: string
  subtitle: string
  fields: FormField[]
  submit_text: string
  submit_color: string
  submit_text_color: string
  success_message: string
  bg_color: string
  border_radius: number
  show_product_summary: boolean
  show_quantity: boolean
  show_variants: boolean
  layout: 'standard' | 'split' | 'compact'
}

export interface PricingItem {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  cta_text: string
  highlighted: boolean
}

export interface PricingTableProps {
  title: string
  items: PricingItem[]
  bg_color: string
  accent_color: string
}

export interface NewsletterProps {
  title: string
  subtitle: string
  placeholder: string
  button_text: string
  bg_color: string
  style: 'minimal' | 'card' | 'fullwidth'
  type: 'email' | 'whatsapp' | 'both'
}

export interface Slide {
  image_url: string
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  overlay_color: string
}

export interface SlideshowProps {
  slides: Slide[]
  autoplay: boolean
  interval: number
  show_dots: boolean
  show_arrows: boolean
  height: number
}

export interface IconGridItem {
  id: string
  icon: string
  title: string
  text: string
  link: string
}

export interface IconGridProps {
  title: string
  items: IconGridItem[]
  columns: 2 | 3 | 4
  bg_color: string
  icon_color: string
  card_style: 'minimal' | 'card' | 'bordered'
}

export interface ProductGridProps {
  title: string
  subtitle: string
  product_ids: string[]
  columns: 2 | 3 | 4
  show_price: boolean
  show_badge: boolean
  badge_text: string
  bg_color: string
}

export interface TextBlockProps {
  title: string
  content: string
  text_align: 'left' | 'center' | 'right'
  bg_color: string
  text_color: string
  max_width: number
  show_divider: boolean
}

export interface SpacerProps {
  height: number
  bg_color: string
  show_divider: boolean
  divider_style: 'line' | 'wave' | 'dots'
}

export interface PopupProps {
  title: string
  subtitle: string
  image_url: string
  cta_text: string
  trigger: 'timer' | 'exit' | 'scroll'
  delay: number
  bg_color: string
  show_once: boolean
}

export interface FooterLink {
  label: string
  url: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterProps {
  logo_text: string
  description: string
  columns: FooterColumn[]
  social_links: { platform: string; url: string }[]
  show_whatsapp: boolean
  whatsapp_number: string
  payment_icons: boolean
  bg_color: string
  text_color: string
  copyright: string
}

// ---------- Union de tous les props ----------
export type SectionProps =
  | AnnouncementBarProps
  | HeroProps
  | MarqueeProps
  | ProductProps
  | CountdownProps
  | TestimonialsProps
  | BenefitsProps
  | BeforeAfterProps
  | StatsProps
  | GalleryProps
  | FaqProps
  | ComparisonTableProps
  | GuaranteesProps
  | VideoProps
  | ImageWithTextProps
  | OrderFormProps
  | PricingTableProps
  | NewsletterProps
  | SlideshowProps
  | IconGridProps
  | ProductGridProps
  | TextBlockProps
  | SpacerProps
  | PopupProps
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
  category: string
  defaultProps: SectionProps
}
