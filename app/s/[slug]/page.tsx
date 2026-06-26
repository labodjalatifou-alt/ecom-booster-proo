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
    .select('id, name, slug, status, store_settings(*)')
    .eq('slug', slug)
    .single()

  if (error || !store) notFound()

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

  return (
    <LandingRenderer
      builderJson={builderJson || {}}
      product={product}
      storeName={store.name}
      storeId={store.id}
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
    .select('name')
    .eq('slug', slug)
    .single()

  return { title: store?.name || slug }
}
