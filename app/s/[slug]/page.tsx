import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicCanvas from '@/components/store-builder/PublicCanvas'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient()

  // Fetch store by slug
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, slug, status')
    .eq('slug', slug)
    .single()

  if (storeError || !store) {
    notFound()
  }

  // Fetch store home page
  const { data: storePage } = await supabase
    .from('store_pages')
    .select('builder_json, title')
    .eq('store_id', store.id)
    .eq('slug', 'home')
    .single()

  // Fetch products for this store
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const builderJson = storePage?.builder_json

  if (!builderJson) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#FFF8F3' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'Fraunces, serif' }}>{store.name}</h1>
          <p style={{ color: '#7A6469' }}>Cette boutique est en cours de construction.</p>
        </div>
      </div>
    )
  }

  return (
    <PublicCanvas
      builderJson={builderJson}
      products={products || []}
      storeName={store.name}
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

  return {
    title: store?.name || slug,
  }
}
