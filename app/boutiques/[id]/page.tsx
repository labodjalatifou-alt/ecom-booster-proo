'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import SectionRenderer from '@/components/store-builder/SectionRenderer'
import { SECTIONS_CATALOG, generateSectionId, DEFAULT_COLORS, DEFAULT_FONTS } from '@/lib/store-builder/defaults'
import { STORE_TEMPLATES, StoreTemplate } from '@/lib/store-builder/templates'
import type { BuilderSection, BuilderPage, StoreColors, StoreFonts, StoreType } from '@/lib/store-builder/types'

// ——————————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————————
const CATEGORY_ORDER = ['Marketing', 'Contenu', 'Produits', 'Social Proof', 'Info', 'Structure']
const CATEGORY_EMOJI: Record<string, string> = {
  Marketing: '📣', Contenu: '🎨', Produits: '🛍️', 'Social Proof': '⭐', Info: 'ℹ️', Structure: '🏁',
}

type Tab = 'templates' | 'sections' | 'design' | 'settings'
type PreviewMode = 'desktop' | 'mobile'

// ——————————————————————————————————————————————
// PropertiesPanel — panneau droit
// ——————————————————————————————————————————————
function PropField({ label, value, onChange, type = 'text', options, hint }: {
  label: string; value: any; onChange: (v: any) => void; type?: string; options?: string[]; hint?: string
}) {
  const inputClass = "w-full px-3 py-2 text-sm rounded-xl border outline-none focus:border-indigo-400 transition-colors bg-white"
  const inputStyle = { borderColor: '#e5e7eb', color: '#111827' }

  if (type === 'color') return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border cursor-pointer p-1" style={{ borderColor: '#e5e7eb' }} />
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          className={inputClass} style={inputStyle} placeholder="#000000" />
      </div>
    </div>
  )

  if (type === 'toggle') return (
    <div className="flex items-center justify-between py-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors flex items-center"
        style={{ backgroundColor: value ? '#6366f1' : '#e5e7eb' }}>
        <span className="absolute w-5 h-5 bg-white rounded-full shadow transition-transform"
          style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )

  if (type === 'number') return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, (value || 0) - 1))}
          className="w-8 h-8 rounded-lg border flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#e5e7eb' }}>−</button>
        <input type="number" value={value || 0} onChange={e => onChange(Number(e.target.value))}
          className={`${inputClass} text-center`} style={inputStyle} />
        <button onClick={() => onChange((value || 0) + 1)}
          className="w-8 h-8 rounded-lg border flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#e5e7eb' }}>+</button>
      </div>
    </div>
  )

  if (type === 'select' && options) return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className={inputClass} style={inputStyle}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  if (type === 'textarea') return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3}
        className={`${inputClass} resize-none`} style={inputStyle} />
    </div>
  )

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        className={inputClass} style={inputStyle} />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function buildPropFields(type: string, props: any, onChange: (key: string, val: any) => void) {
  const common = { onChange }

  const fields: React.ReactNode[] = []

  // Champs communs à tous
  if ('bg_color' in props) fields.push(
    <PropField key="bg_color" label="Couleur de fond" type="color" value={props.bg_color} onChange={v => onChange('bg_color', v)} />
  )
  if ('text_color' in props) fields.push(
    <PropField key="text_color" label="Couleur du texte" type="color" value={props.text_color} onChange={v => onChange('text_color', v)} />
  )
  if ('title' in props) fields.push(
    <PropField key="title" label="Titre" value={props.title} onChange={v => onChange('title', v)} />
  )
  if ('subtitle' in props) fields.push(
    <PropField key="subtitle" label="Sous-titre" value={props.subtitle} onChange={v => onChange('subtitle', v)} />
  )

  // Props spécifiques par type
  switch (type) {
    case 'hero':
      fields.push(
        <PropField key="headline" label="Titre principal" value={props.headline} onChange={v => onChange('headline', v)} />,
        <PropField key="subheadline" label="Sous-titre" value={props.subheadline} onChange={v => onChange('subheadline', v)} />,
        <PropField key="badge_text" label="Badge texte" value={props.badge_text} onChange={v => onChange('badge_text', v)} />,
        <PropField key="show_badge" label="Afficher badge" type="toggle" value={props.show_badge} onChange={v => onChange('show_badge', v)} />,
        <PropField key="badge_color" label="Couleur badge" type="color" value={props.badge_color} onChange={v => onChange('badge_color', v)} />,
        <PropField key="cta_text" label="Bouton 1" value={props.cta_text} onChange={v => onChange('cta_text', v)} />,
        <PropField key="cta_text_2" label="Bouton 2" value={props.cta_text_2} onChange={v => onChange('cta_text_2', v)} />,
        <PropField key="image_url" label="URL Image" value={props.image_url} onChange={v => onChange('image_url', v)} />,
        <PropField key="image_position" label="Position image" type="select" value={props.image_position} options={['left', 'right', 'background', 'none']} onChange={v => onChange('image_position', v)} />,
        <PropField key="text_align" label="Alignement" type="select" value={props.text_align} options={['left', 'center', 'right']} onChange={v => onChange('text_align', v)} />,
      )
      break
    case 'announcement_bar':
      fields.push(
        <PropField key="speed" label="Vitesse défilement" type="number" value={props.speed} onChange={v => onChange('speed', v)} />,
        <PropField key="show_close" label="Bouton fermer" type="toggle" value={props.show_close} onChange={v => onChange('show_close', v)} />,
      )
      break
    case 'countdown':
      fields.push(
        <PropField key="target_date" label="Date cible" type="datetime-local" value={props.target_date?.slice(0, 16)} onChange={v => onChange('target_date', new Date(v).toISOString())} />,
        <PropField key="accent_color" label="Couleur accent" type="color" value={props.accent_color} onChange={v => onChange('accent_color', v)} />,
        <PropField key="timer_bg" label="Fond timer" type="color" value={props.timer_bg} onChange={v => onChange('timer_bg', v)} />,
        <PropField key="on_expire" label="À l'expiration" type="select" value={props.on_expire} options={['reset', 'hide', 'message']} onChange={v => onChange('on_expire', v)} />,
        <PropField key="expire_message" label="Message expiration" value={props.expire_message} onChange={v => onChange('expire_message', v)} />,
      )
      break
    case 'order_form':
      fields.push(
        <PropField key="submit_text" label="Texte bouton" value={props.submit_text} onChange={v => onChange('submit_text', v)} />,
        <PropField key="submit_color" label="Couleur bouton" type="color" value={props.submit_color} onChange={v => onChange('submit_color', v)} />,
        <PropField key="success_message" label="Message succès" type="textarea" value={props.success_message} onChange={v => onChange('success_message', v)} />,
        <PropField key="show_product_summary" label="Résumé produit" type="toggle" value={props.show_product_summary} onChange={v => onChange('show_product_summary', v)} />,
        <PropField key="show_quantity" label="Quantité" type="toggle" value={props.show_quantity} onChange={v => onChange('show_quantity', v)} />,
        <PropField key="layout" label="Layout" type="select" value={props.layout} options={['standard', 'split', 'compact']} onChange={v => onChange('layout', v)} />,
        <PropField key="border_radius" label="Arrondi (px)" type="number" value={props.border_radius} onChange={v => onChange('border_radius', v)} />,
      )
      break
    case 'testimonials':
      fields.push(
        <PropField key="layout" label="Layout" type="select" value={props.layout} options={['grid', 'carousel', 'masonry', 'floating']} onChange={v => onChange('layout', v)} />,
        <PropField key="show_stars" label="Afficher étoiles" type="toggle" value={props.show_stars} onChange={v => onChange('show_stars', v)} />,
        <PropField key="show_verified" label="Badge vérifié" type="toggle" value={props.show_verified} onChange={v => onChange('show_verified', v)} />,
      )
      break
    case 'video':
      fields.push(
        <PropField key="url" label="URL vidéo (YouTube/Vimeo/MP4)" value={props.url} onChange={v => onChange('url', v)} />,
        <PropField key="poster_image" label="Image poster" value={props.poster_image} onChange={v => onChange('poster_image', v)} />,
        <PropField key="aspect_ratio" label="Format" type="select" value={props.aspect_ratio} options={['16:9', '9:16', '1:1']} onChange={v => onChange('aspect_ratio', v)} />,
        <PropField key="autoplay" label="Lecture auto" type="toggle" value={props.autoplay} onChange={v => onChange('autoplay', v)} />,
        <PropField key="loop" label="Boucle" type="toggle" value={props.loop} onChange={v => onChange('loop', v)} />,
      )
      break
    case 'faq':
      fields.push(
        <PropField key="accent_color" label="Couleur accent" type="color" value={props.accent_color} onChange={v => onChange('accent_color', v)} />,
        <PropField key="style" label="Style" type="select" value={props.style} options={['classic', 'bordered', 'minimal']} onChange={v => onChange('style', v)} />,
      )
      break
    case 'gallery':
      fields.push(
        <PropField key="layout" label="Layout" type="select" value={props.layout} options={['grid', 'masonry', 'carousel', 'filmstrip']} onChange={v => onChange('layout', v)} />,
        <PropField key="columns" label="Colonnes" type="select" value={String(props.columns)} options={['2', '3', '4']} onChange={v => onChange('columns', Number(v))} />,
        <PropField key="border_radius" label="Arrondi (px)" type="number" value={props.border_radius} onChange={v => onChange('border_radius', v)} />,
        <PropField key="show_lightbox" label="Lightbox" type="toggle" value={props.show_lightbox} onChange={v => onChange('show_lightbox', v)} />,
      )
      break
    case 'slideshow':
      fields.push(
        <PropField key="autoplay" label="Lecture auto" type="toggle" value={props.autoplay} onChange={v => onChange('autoplay', v)} />,
        <PropField key="interval" label="Intervalle (ms)" type="number" value={props.interval} onChange={v => onChange('interval', v)} />,
        <PropField key="show_dots" label="Points de nav." type="toggle" value={props.show_dots} onChange={v => onChange('show_dots', v)} />,
        <PropField key="show_arrows" label="Flèches" type="toggle" value={props.show_arrows} onChange={v => onChange('show_arrows', v)} />,
        <PropField key="height" label="Hauteur (px)" type="number" value={props.height} onChange={v => onChange('height', v)} />,
      )
      break
    case 'spacer':
      fields.push(
        <PropField key="height" label="Hauteur (px)" type="number" value={props.height} onChange={v => onChange('height', v)} />,
        <PropField key="show_divider" label="Afficher séparateur" type="toggle" value={props.show_divider} onChange={v => onChange('show_divider', v)} />,
        <PropField key="divider_style" label="Style séparateur" type="select" value={props.divider_style} options={['line', 'wave', 'dots']} onChange={v => onChange('divider_style', v)} />,
      )
      break
    case 'stats':
      fields.push(
        <PropField key="accent_color" label="Couleur accent" type="color" value={props.accent_color} onChange={v => onChange('accent_color', v)} />,
      )
      break
    case 'newsletter':
      fields.push(
        <PropField key="placeholder" label="Placeholder" value={props.placeholder} onChange={v => onChange('placeholder', v)} />,
        <PropField key="button_text" label="Texte bouton" value={props.button_text} onChange={v => onChange('button_text', v)} />,
        <PropField key="style" label="Style" type="select" value={props.style} options={['minimal', 'card', 'fullwidth']} onChange={v => onChange('style', v)} />,
        <PropField key="type" label="Type" type="select" value={props.type} options={['email', 'whatsapp', 'both']} onChange={v => onChange('type', v)} />,
      )
      break
    case 'popup':
      fields.push(
        <PropField key="trigger" label="Déclencheur" type="select" value={props.trigger} options={['timer', 'exit', 'scroll']} onChange={v => onChange('trigger', v)} />,
        <PropField key="delay" label="Délai (secondes)" type="number" value={props.delay} onChange={v => onChange('delay', v)} />,
        <PropField key="cta_text" label="Texte bouton" value={props.cta_text} onChange={v => onChange('cta_text', v)} />,
        <PropField key="image_url" label="Image URL" value={props.image_url} onChange={v => onChange('image_url', v)} />,
        <PropField key="show_once" label="Afficher une fois" type="toggle" value={props.show_once} onChange={v => onChange('show_once', v)} />,
      )
      break
    case 'image_with_text':
      fields.push(
        <PropField key="text" label="Texte" type="textarea" value={props.text} onChange={v => onChange('text', v)} />,
        <PropField key="image_url" label="URL image" value={props.image_url} onChange={v => onChange('image_url', v)} />,
        <PropField key="image_position" label="Position image" type="select" value={props.image_position} options={['left', 'right']} onChange={v => onChange('image_position', v)} />,
        <PropField key="image_style" label="Style image" type="select" value={props.image_style} options={['rounded', 'square', 'circle']} onChange={v => onChange('image_style', v)} />,
        <PropField key="cta_text" label="Texte CTA" value={props.cta_text} onChange={v => onChange('cta_text', v)} />,
        <PropField key="cta_link" label="Lien CTA" value={props.cta_link} onChange={v => onChange('cta_link', v)} />,
      )
      break
    case 'footer':
      fields.push(
        <PropField key="logo_text" label="Nom boutique" value={props.logo_text} onChange={v => onChange('logo_text', v)} />,
        <PropField key="description" label="Description" type="textarea" value={props.description} onChange={v => onChange('description', v)} />,
        <PropField key="copyright" label="Copyright" value={props.copyright} onChange={v => onChange('copyright', v)} />,
        <PropField key="show_whatsapp" label="Bouton WhatsApp" type="toggle" value={props.show_whatsapp} onChange={v => onChange('show_whatsapp', v)} />,
        <PropField key="whatsapp_number" label="Numéro WhatsApp" value={props.whatsapp_number} onChange={v => onChange('whatsapp_number', v)} hint="Format : 224620000000" />,
        <PropField key="payment_icons" label="Icônes paiement" type="toggle" value={props.payment_icons} onChange={v => onChange('payment_icons', v)} />,
      )
      break
    case 'text_block':
      fields.push(
        <PropField key="content" label="Contenu" type="textarea" value={props.content} onChange={v => onChange('content', v)} />,
        <PropField key="text_align" label="Alignement" type="select" value={props.text_align} options={['left', 'center', 'right']} onChange={v => onChange('text_align', v)} />,
        <PropField key="max_width" label="Largeur max (px)" type="number" value={props.max_width} onChange={v => onChange('max_width', v)} />,
        <PropField key="show_divider" label="Séparateur" type="toggle" value={props.show_divider} onChange={v => onChange('show_divider', v)} />,
      )
      break
    case 'product':
      fields.push(
        <PropField key="cta_text" label="Texte bouton" value={props.cta_text} onChange={v => onChange('cta_text', v)} />,
        <PropField key="cta_color" label="Couleur bouton" type="color" value={props.cta_color} onChange={v => onChange('cta_color', v)} />,
        <PropField key="layout" label="Layout" type="select" value={props.layout} options={['split', 'centered', 'magazine']} onChange={v => onChange('layout', v)} />,
        <PropField key="show_price" label="Afficher prix" type="toggle" value={props.show_price} onChange={v => onChange('show_price', v)} />,
        <PropField key="show_compare_price" label="Prix barré" type="toggle" value={props.show_compare_price} onChange={v => onChange('show_compare_price', v)} />,
        <PropField key="show_variants" label="Variantes" type="toggle" value={props.show_variants} onChange={v => onChange('show_variants', v)} />,
        <PropField key="show_stock_counter" label="Compteur stock" type="toggle" value={props.show_stock_counter} onChange={v => onChange('show_stock_counter', v)} />,
        <PropField key="show_urgency" label="Badge urgence" type="toggle" value={props.show_urgency} onChange={v => onChange('show_urgency', v)} />,
        <PropField key="urgency_text" label="Texte urgence" value={props.urgency_text} onChange={v => onChange('urgency_text', v)} />,
      )
      break
    case 'benefits':
      fields.push(
        <PropField key="layout" label="Layout" type="select" value={props.layout} options={['row', 'grid', 'cards', 'numbered']} onChange={v => onChange('layout', v)} />,
        <PropField key="icon_style" label="Style icônes" type="select" value={props.icon_style} options={['emoji', 'circle', 'square']} onChange={v => onChange('icon_style', v)} />,
      )
      break
    case 'guarantees':
      fields.push(
        <PropField key="layout" label="Layout" type="select" value={props.layout} options={['row', 'grid']} onChange={v => onChange('layout', v)} />,
        <PropField key="style" label="Style" type="select" value={props.style} options={['minimal', 'cards', 'bordered']} onChange={v => onChange('style', v)} />,
        <PropField key="icon_color" label="Couleur icônes" type="color" value={props.icon_color} onChange={v => onChange('icon_color', v)} />,
      )
      break
    case 'comparison_table':
      fields.push(
        <PropField key="our_label" label="Votre label" value={props.our_label} onChange={v => onChange('our_label', v)} />,
        <PropField key="competitor_label" label="Label concurrent" value={props.competitor_label} onChange={v => onChange('competitor_label', v)} />,
        <PropField key="accent_color" label="Couleur accent" type="color" value={props.accent_color} onChange={v => onChange('accent_color', v)} />,
      )
      break
    case 'pricing_table':
      fields.push(
        <PropField key="accent_color" label="Couleur accent" type="color" value={props.accent_color} onChange={v => onChange('accent_color', v)} />,
      )
      break
    case 'icon_grid':
      fields.push(
        <PropField key="columns" label="Colonnes" type="select" value={String(props.columns)} options={['2', '3', '4']} onChange={v => onChange('columns', Number(v))} />,
        <PropField key="icon_color" label="Couleur icônes" type="color" value={props.icon_color} onChange={v => onChange('icon_color', v)} />,
        <PropField key="card_style" label="Style" type="select" value={props.card_style} options={['minimal', 'card', 'bordered']} onChange={v => onChange('card_style', v)} />,
      )
      break
    case 'product_grid':
      fields.push(
        <PropField key="columns" label="Colonnes" type="select" value={String(props.columns)} options={['2', '3', '4']} onChange={v => onChange('columns', Number(v))} />,
        <PropField key="show_price" label="Afficher prix" type="toggle" value={props.show_price} onChange={v => onChange('show_price', v)} />,
        <PropField key="show_badge" label="Badge promo" type="toggle" value={props.show_badge} onChange={v => onChange('show_badge', v)} />,
        <PropField key="badge_text" label="Texte badge" value={props.badge_text} onChange={v => onChange('badge_text', v)} />,
      )
      break
    case 'marquee':
      fields.push(
        <PropField key="speed" label="Vitesse" type="number" value={props.speed} onChange={v => onChange('speed', v)} />,
        <PropField key="direction" label="Direction" type="select" value={props.direction} options={['left', 'right']} onChange={v => onChange('direction', v)} />,
      )
      break
    case 'stats':
      break
    case 'before_after':
      fields.push(
        <PropField key="before_image" label="Image Avant" value={props.before_image} onChange={v => onChange('before_image', v)} />,
        <PropField key="after_image" label="Image Après" value={props.after_image} onChange={v => onChange('after_image', v)} />,
        <PropField key="before_label" label="Label Avant" value={props.before_label} onChange={v => onChange('before_label', v)} />,
        <PropField key="after_label" label="Label Après" value={props.after_label} onChange={v => onChange('after_label', v)} />,
      )
      break
  }

  return fields.filter(f => f !== null)
}

// ——————————————————————————————————————————————
// Main Editor Component
// ——————————————————————————————————————————————
export default function StoreEditorPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const storeId = params?.id as string

  const [store, setStore] = useState<StoreType | null>(null)
  const [page, setPage] = useState<{ id: string } | null>(null)
  const [sections, setSections] = useState<BuilderSection[]>([])
  const [colors, setColors] = useState<StoreColors>(DEFAULT_COLORS)
  const [fonts, setFonts] = useState<StoreFonts>(DEFAULT_FONTS)
  const [pixels, setPixels] = useState({ meta: '', tiktok: '', google: '' })
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [tab, setTab] = useState<Tab>('sections')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState('')
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ——— Chargement initial ———
  useEffect(() => {
    if (!storeId) return
    loadStore()
  }, [storeId])

  const loadStore = async () => {
    setLoading(true)
    try {
      // Charger la boutique
      const { data: storeData } = await supabase
        .from('stores')
        .select('*, store_settings(*)')
        .eq('id', storeId)
        .single()

      if (storeData) {
        setStore(storeData as any)
        setSlug(storeData.slug || '')
        setIsPublished(storeData.status === 'published')
        if (storeData.store_settings?.[0]?.colors) {
          setColors({ ...DEFAULT_COLORS, ...storeData.store_settings[0].colors })
        }
        if (storeData.store_settings?.[0]?.pixels) {
          setPixels({ ...{ meta: '', tiktok: '', google: '' }, ...storeData.store_settings[0].pixels })
        }
      }

      // Charger la page
      const { data: pageData } = await supabase
        .from('store_pages')
        .select('*')
        .eq('store_id', storeId)
        .eq('slug', 'home')
        .single()

      if (pageData) {
        setPage({ id: pageData.id })
        const json = pageData.builder_json as BuilderPage
        setSections(json?.sections || [])
      } else {
        // Créer la page si elle n'existe pas
        const { data: newPage } = await supabase
          .from('store_pages')
          .insert({ store_id: storeId, slug: 'home', title: 'Accueil', builder_json: { sections: [] }, is_published: false })
          .select()
          .single()
        if (newPage) setPage({ id: newPage.id })
      }
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  // ——— Sauvegarde ———
  const save = useCallback(async (sectionsToSave = sections) => {
    if (!page?.id || !storeId) return
    setIsSaving(true)
    try {
      const builderJson: BuilderPage = { sections: sectionsToSave }
      await supabase.from('store_pages').update({ builder_json: builderJson, updated_at: new Date().toISOString() }).eq('id', page.id)
      await supabase.from('store_settings').upsert({ store_id: storeId, colors, fonts, pixels }, { onConflict: 'store_id' })
      setHasChanges(false)
    } catch (err) { console.error(err) }
    setIsSaving(false)
  }, [sections, page?.id, storeId, colors, fonts, pixels])

  // Auto-save toutes les 30s
  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    autoSaveRef.current = setInterval(() => {
      if (hasChanges) save()
    }, 30000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [hasChanges, save])

  // ——— Publier ———
  const publish = async () => {
    setIsPublishing(true)
    await save()
    await supabase.from('stores').update({ status: 'published' }).eq('id', storeId)
    await supabase.from('store_pages').update({ is_published: true }).eq('store_id', storeId)
    setIsPublished(true)
    setIsPublishing(false)
  }

  // ——— Templates ———
  const loadTemplate = (template: StoreTemplate) => {
    if (sections.length > 0) {
      if (!confirm('Attention : Charger ce modèle remplacera toutes vos sections actuelles. Voulez-vous continuer ?')) return
    }
    setSections(template.sections)
    setColors(template.colors)
    setFonts(template.fonts)
    setActiveSectionId(null)
    setTab('sections')
    markChanged()
  }

  // ——— Sections actions ———
  const markChanged = () => setHasChanges(true)

  const addSection = (catalogItem: typeof SECTIONS_CATALOG[0]) => {
    const newSection: BuilderSection = {
      id: generateSectionId(catalogItem.type),
      type: catalogItem.type,
      props: { ...catalogItem.defaultProps },
      visible: true,
    }
    setSections(prev => {
      const next = [...prev, newSection]
      markChanged()
      return next
    })
    setActiveSectionId(newSection.id)
    setTab('sections')
  }

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id))
    if (activeSectionId === id) setActiveSectionId(null)
    markChanged()
  }

  const toggleVisible = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s))
    markChanged()
  }

  const moveSection = (id: string, dir: 'up' | 'down') => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx < 0) return prev
      const next = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      markChanged()
      return next
    })
  }

  const updateSectionProp = (sectionId: string, key: string, value: any) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, props: { ...s.props, [key]: value } } : s
    ))
    markChanged()
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    setSections(prev => {
      const next = [...prev]
      const [moved] = next.splice(result.source.index, 1)
      next.splice(result.destination.index, 0, moved)
      markChanged()
      return next
    })
  }

  const activeSection = sections.find(s => s.id === activeSectionId)
  const catalogByCategory = CATEGORY_ORDER.map(cat => ({
    cat,
    items: SECTIONS_CATALOG.filter(s => s.category === cat),
  }))

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Chargement de l'éditeur...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ═══ TOOLBAR ═══ */}
      <div className="flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-200 shrink-0 z-30" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* Gauche */}
        <button onClick={() => router.push('/boutiques')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 text-sm font-medium">
          ← Boutiques
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-800">{store?.name || 'Éditeur'}</span>
          <span className="text-xs" style={{ color: isPublished ? '#10b981' : '#f59e0b' }}>
            {isPublished ? '● Publié' : '● Brouillon'}
          </span>
        </div>
        {hasChanges && (
          <span className="text-xs px-2 py-1 rounded-full font-medium text-orange-600 bg-orange-50">● Non sauvegardé</span>
        )}

        {/* Centre — switcher preview */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {(['desktop', 'mobile'] as PreviewMode[]).map(m => (
              <button key={m} onClick={() => setPreviewMode(m)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: previewMode === m ? '#fff' : 'transparent', color: previewMode === m ? '#111827' : '#6b7280', boxShadow: previewMode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                {m === 'desktop' ? '🖥️' : '📱'} {m === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            ))}
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-2">
          {slug && (
            <a href={`/s/${slug}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 transition-colors text-gray-600"
              style={{ borderColor: '#e5e7eb' }}>
              👁️ Aperçu
            </a>
          )}
          <button onClick={() => save()}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#6366f1' }}>
            {isSaving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde...</> : '💾 Enregistrer'}
          </button>
          <button onClick={publish} disabled={isPublishing || isPublished}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: isPublished ? '#10b981' : '#059669' }}>
            {isPublishing ? '⏳ Publication...' : isPublished ? '✅ Publié' : '🚀 Publier'}
          </button>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ═══ PANNEAU GAUCHE ═══ */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
          {/* Onglets */}
          <div className="flex border-b border-gray-200">
            {(['templates', 'sections', 'design', 'settings'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-3 text-xs font-bold transition-colors capitalize"
                style={{ color: tab === t ? '#6366f1' : '#6b7280', borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent' }}>
                {t === 'templates' ? '📑' : t === 'sections' ? '📐' : t === 'design' ? '🎨' : '⚙️'} {t === 'templates' ? 'Modèles' : t === 'sections' ? 'Sections' : t === 'design' ? 'Design' : 'Config'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ——— Onglet Modèles ——— */}
            {tab === 'templates' && (
              <div className="p-3 flex flex-col gap-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thèmes Premium</p>
                <div className="flex flex-col gap-4">
                  {STORE_TEMPLATES.map(template => (
                    <div key={template.id} className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden group">
                      <div className="h-32 bg-gray-200 relative overflow-hidden">
                        {template.thumbnail && <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-white text-xs font-bold shadow-sm">{template.name}</span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                        <button onClick={() => loadTemplate(template)}
                          className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                          Utiliser ce modèle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ——— Onglet Sections ——— */}
            {tab === 'sections' && (
              <div className="p-3 flex flex-col gap-4">
                {/* Sections actives (drag & drop) */}
                {sections.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sur la page</p>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="sections">
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-1.5">
                            {sections.map((section, idx) => {
                              const catalog = SECTIONS_CATALOG.find(c => c.type === section.type)
                              return (
                                <Draggable key={section.id} draggableId={section.id} index={idx}>
                                  {(drag, snap) => (
                                    <div
                                      ref={drag.innerRef}
                                      {...drag.draggableProps}
                                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-pointer group ${activeSectionId === section.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                                      style={{ ...drag.draggableProps.style, opacity: !section.visible ? 0.45 : 1 }}
                                      onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                                    >
                                      <span {...drag.dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab text-sm">⠿</span>
                                      <span className="text-base">{catalog?.icon || '📦'}</span>
                                      <span className="flex-1 text-xs font-semibold text-gray-700 truncate">{catalog?.label || section.type}</span>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={e => { e.stopPropagation(); toggleVisible(section.id) }}
                                          className="p-1 rounded hover:bg-white text-gray-400 hover:text-gray-700 text-xs" title={section.visible ? 'Masquer' : 'Afficher'}>
                                          {section.visible ? '👁️' : '🙈'}
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); removeSection(section.id) }}
                                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 text-xs">
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}

                {/* Catalogue */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ajouter une section</p>
                  <div className="flex flex-col gap-4">
                    {catalogByCategory.map(({ cat, items }) => (
                      <div key={cat}>
                        <p className="text-xs font-bold text-gray-500 mb-2">
                          {CATEGORY_EMOJI[cat]} {cat}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {items.map(item => (
                            <button
                              key={item.type}
                              onClick={() => addSection(item)}
                              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center"
                            >
                              <span className="text-xl">{item.icon}</span>
                              <span className="text-[10px] font-semibold text-gray-600 leading-tight">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ——— Onglet Design ——— */}
            {tab === 'design' && (
              <div className="p-4 flex flex-col gap-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Couleurs du thème</p>
                {([
                  ['primary', 'Couleur principale'],
                  ['secondary', 'Secondaire'],
                  ['accent', 'Accent'],
                  ['text', 'Texte'],
                  ['textLight', 'Texte clair'],
                  ['bg', 'Fond'],
                  ['bgSection', 'Fond sections'],
                  ['border', 'Bordures'],
                  ['success', 'Succès'],
                  ['danger', 'Danger'],
                ] as [keyof StoreColors, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{colors[key]}</span>
                      <input
                        type="color"
                        value={colors[key] || '#000000'}
                        onChange={e => { setColors(c => ({ ...c, [key]: e.target.value })); markChanged() }}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5"
                        style={{ borderColor: '#e5e7eb' }}
                      />
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Police</p>
                  <select
                    value={fonts.heading}
                    onChange={e => { setFonts(f => ({ ...f, heading: e.target.value, body: e.target.value })); markChanged() }}
                    className="w-full px-3 py-2 text-sm rounded-xl border outline-none"
                    style={{ borderColor: '#e5e7eb', color: '#111' }}
                  >
                    {['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Outfit', 'Lato'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ——— Onglet Paramètres ——— */}
            {tab === 'settings' && (
              <div className="p-4 flex flex-col gap-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Boutique</p>
                <PropField label="Nom boutique" value={store?.name || ''} onChange={() => {}} />
                <PropField label="Slug URL" value={slug} onChange={v => { setSlug(v); markChanged() }} hint={`Accès : /s/${slug}`} />

                <div className="border-t pt-4" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pixels de tracking</p>
                  <div className="flex flex-col gap-3">
                    <PropField label="Meta Pixel ID" value={pixels.meta} onChange={v => { setPixels(p => ({ ...p, meta: v })); markChanged() }} />
                    <PropField label="TikTok Pixel ID" value={pixels.tiktok} onChange={v => { setPixels(p => ({ ...p, tiktok: v })); markChanged() }} />
                    <PropField label="Google Ads ID" value={pixels.google} onChange={v => { setPixels(p => ({ ...p, google: v })); markChanged() }} />
                  </div>
                </div>

                <div className="border-t pt-4" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Domaine personnalisé</p>
                  <input disabled placeholder="monsite.com" className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-400 cursor-not-allowed" style={{ borderColor: '#e5e7eb' }} />
                  <p className="text-xs text-gray-400 mt-1">🔒 Bientôt disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ CANVAS CENTRAL ═══ */}
        <div className="flex-1 overflow-y-auto bg-gray-200 flex flex-col items-center py-6 px-4 gap-4">
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-xl transition-all duration-300 w-full"
            style={{
              maxWidth: previewMode === 'desktop' ? 1200 : 390,
              minHeight: 600,
            }}
          >
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 gap-6">
                <div className="text-7xl">🏗️</div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Votre boutique est vide</h3>
                  <p className="text-gray-400 text-sm">Ajoutez des sections depuis le panneau gauche</p>
                </div>
                <button onClick={() => setTab('templates')}
                  className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                  style={{ backgroundColor: '#6366f1' }}>
                  + Choisir un modèle Shrine
                </button>
              </div>
            ) : (
              sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`relative group transition-all ${!section.visible && 'opacity-40'}`}
                  style={{ outline: activeSectionId === section.id ? '2px solid #6366f1' : 'none' }}
                >
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 2px #6366f140' }}
                  />

                  {/* Section name tag on hover */}
                  <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-xs px-2 py-1 rounded-lg font-medium text-white bg-indigo-600">
                      {SECTIONS_CATALOG.find(c => c.type === section.type)?.label || section.type}
                    </span>
                  </div>

                  {/* Up/Down buttons */}
                  <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button onClick={() => moveSection(section.id, 'up')}
                        className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-xs">↑</button>
                    )}
                    {idx < sections.length - 1 && (
                      <button onClick={() => moveSection(section.id, 'down')}
                        className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-xs">↓</button>
                    )}
                  </div>

                  <SectionRenderer
                    section={section}
                    colors={colors}
                    storeId={storeId}
                    isEditing
                    isSelected={activeSectionId === section.id}
                    onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ═══ PANNEAU DROIT — Properties ═══ */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0">
          {!activeSection ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
              <div className="text-5xl">👆</div>
              <p className="text-gray-500 text-sm font-medium">Cliquez sur une section pour la modifier</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0">
                <span className="text-xl">{SECTIONS_CATALOG.find(c => c.type === activeSection.type)?.icon || '📦'}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">{SECTIONS_CATALOG.find(c => c.type === activeSection.type)?.label}</p>
                  <p className="text-xs text-gray-400">Personnalisation</p>
                </div>
                <button onClick={() => setActiveSectionId(null)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-4">
                  {buildPropFields(activeSection.type, activeSection.props, (key, val) => updateSectionProp(activeSection.id, key, val))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
