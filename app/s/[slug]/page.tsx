import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LandingRenderer from '@/components/store-builder/LandingRenderer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient()

  // ── Boutique + ses paramètres ──
  const { data: store, error } = await supabase
    .from('stores')
    .select('id, name, slug, status, user_id, store_settings(*)')
    .or(`slug.eq."${slug}",id.eq."${slug}"`)
    .single()

  if (error || !store) notFound()

  // Blocage si non publié ET que l'utilisateur n'est pas le propriétaire (Aperçu)
  if (store.status !== 'published') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== store.user_id) {
      notFound()
    }
  }

  const settings = Array.isArray(store.store_settings)
    ? store.store_settings[0]
    : store.store_settings

  // ── Page construite dans l'éditeur (builder_json = source de vérité) ──
  const { data: storePage } = await supabase
    .from('store_pages')
    .select('builder_json, is_published')
    .eq('store_id', store.id)
    .eq('slug', 'home')
    .single()

  const builderJson = storePage?.builder_json || null

  // ── Produit affiché sur la landing ──
  // Priorité : le produit choisi dans l'éditeur (persisté dans builder_json).
  // Fallback : le produit le plus récent (compatibilité ancien stockage).
  const selectedProductId: string | null = builderJson?.selectedProductId || null
  let product = null
  if (selectedProductId) {
    const { data: p } = await supabase
      .from('products')
      .select('*')
      .eq('id', selectedProductId)
      .maybeSingle()
    product = p
  }
  if (!product) {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    product = products?.[0] || null
  }

  const whatsappNumber =
    settings?.whatsapp_number || builderJson?.themeSettings?.whatsapp_number || null

  const themeSettings = builderJson?.themeSettings || {}
  const pixels = settings?.pixels as { meta?: string } | undefined
  const metaPixelId = themeSettings.meta_pixel_id || pixels?.meta || null
  const faviconUrl = themeSettings.favicon_url || themeSettings.favicon || null

  return (
    <LandingRenderer
      builderJson={builderJson ? { ...builderJson, themeSettings: { ...themeSettings, favicon_url: faviconUrl } } : {}}
      product={product}
      storeName={store.name}
      storeId={store.id}
      metaPixelId={metaPixelId}
      showFloating
      whatsappNumber={whatsappNumber}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!store) return { title: slug }

  const { data: storePage } = await supabase
    .from('store_pages')
    .select('builder_json')
    .eq('store_id', store.id)
    .eq('slug', 'home')
    .maybeSingle()

  const theme = storePage?.builder_json?.themeSettings || {}
  const favicon = (theme.favicon_url || theme.favicon) as string | undefined
  const faviconUrl = favicon?.trim()
    ? (favicon.startsWith('http') ? favicon : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${favicon}`)
    : undefined

  return {
    title: store.name || slug,
    icons: faviconUrl
      ? {
          icon: [{ url: faviconUrl, type: 'image/png' }],
          shortcut: [{ url: faviconUrl }],
          apple: [{ url: faviconUrl }],
        }
      : undefined,
  }
}
