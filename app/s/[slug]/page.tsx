import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LandingPage from '@/components/store-builder/LandingPage'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient()

  const { data: store, error } = await supabase
    .from('stores')
    .select('id, name, slug, status, store_settings(*)')
    .eq('slug', slug)
    .single()

  if (error || !store) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  const product = products?.[0] || null

  // Store settings (couleurs, logo, etc.)
  const settings = Array.isArray(store.store_settings)
    ? store.store_settings[0]
    : store.store_settings

  return (
    <LandingPage
      store={store}
      product={product}
      settings={settings || {}}
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
