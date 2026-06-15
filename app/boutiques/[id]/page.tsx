'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import type { BuilderPage, StoreType, StorePage, StoreSettings } from '@/lib/store-builder/types'
import StoreBuilder from '@/components/store-builder/StoreBuilder'

export default function BoutiqueEditorPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params?.id as string
  const supabase = createClient()

  const [store, setStore] = useState<StoreType | null>(null)
  const [page, setPage] = useState<StorePage | null>(null)
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!storeId) return
    fetchStoreData()
  }, [storeId])

  async function fetchStoreData() {
    setLoading(true)
    const [
      { data: storeData, error: storeError },
      { data: settingsData },
      { data: pageData },
    ] = await Promise.all([
      supabase.from('stores').select('*').eq('id', storeId).single(),
      supabase.from('store_settings').select('*').eq('store_id', storeId).maybeSingle(),
      supabase.from('store_pages').select('*').eq('store_id', storeId).eq('slug', 'home').maybeSingle(),
    ])

    if (storeError) {
      setError(storeError.message)
    } else {
      setStore(storeData as StoreType)
      setError('')
    }
    if (settingsData) setSettings(settingsData as StoreSettings)
    if (pageData) setPage(pageData as StorePage)
    setLoading(false)
  }

  async function handleSave(builderPage: BuilderPage, updatedSettings: StoreSettings, publish = false) {
    if (!store) return

    // Upsert settings
    if (updatedSettings.id) {
      await supabase.from('store_settings').update({
        theme_id: updatedSettings.theme_id,
        colors: updatedSettings.colors,
        fonts: updatedSettings.fonts,
        pixels: updatedSettings.pixels,
        custom_css: updatedSettings.custom_css,
      }).eq('id', updatedSettings.id)
    } else {
      const { data: newSettings } = await supabase.from('store_settings').insert({
        store_id: store.id,
        theme_id: updatedSettings.theme_id,
        colors: updatedSettings.colors,
        fonts: updatedSettings.fonts,
        pixels: updatedSettings.pixels,
        custom_css: updatedSettings.custom_css,
      }).select().single()
      if (newSettings) {
        updatedSettings.id = newSettings.id
        setSettings(updatedSettings)
      }
    }

    // Upsert page
    if (page?.id) {
      await supabase.from('store_pages').update({
        builder_json: builderPage,
        is_published: publish || page.is_published,
      }).eq('id', page.id)
      setPage(prev => prev ? { ...prev, builder_json: builderPage, is_published: publish || prev.is_published } : null)
    } else {
      const { data: newPage } = await supabase.from('store_pages').insert({
        store_id: store.id,
        slug: 'home',
        title: 'Accueil',
        builder_json: builderPage,
        is_published: publish,
      }).select().single()
      if (newPage) setPage(newPage as StorePage)
    }

    // Update store status if publishing
    if (publish && store.status !== 'published') {
      await supabase.from('stores').update({ status: 'published' }).eq('id', store.id)
      setStore({ ...store, status: 'published' })
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500">Chargement de l&apos;éditeur...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-sm">{error || 'Boutique introuvable.'}</p>
          <button
            onClick={() => router.push('/boutiques')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux boutiques
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Compact top bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => router.push('/boutiques')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-gray-900 text-sm truncate">{store.name}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{
              backgroundColor: store.status === 'published' ? '#10b98120' : '#f59e0b20',
              color: store.status === 'published' ? '#10b981' : '#f59e0b',
            }}
          >
            {store.status === 'published' ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <div className="flex-1" />
        <a
          href={`/s/${store.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Voir la boutique
        </a>
      </div>

      {/* Editor fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <StoreBuilder
          store={store}
          initialPage={page?.builder_json ?? null}
          initialSettings={settings}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
