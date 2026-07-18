'use client'

import { useEffect, useState } from 'react'
import ConfirmationModal from '@/components/ConfirmationModal'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Store,
  Plus,
  ExternalLink,
  Edit3,
  MoreVertical,
  Globe,
  ShoppingBag,
  TrendingUp,
  Eye,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  PauseCircle,
  Download,
  X,
  Loader2,
} from 'lucide-react'
import type { Store as StoreType } from '@/lib/store-builder/types'

// ---- helpers ----
function statusConfig(status: StoreType['status']) {
  switch (status) {
    case 'published':
      return { label: 'Publié', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle }
    case 'paused':
      return { label: 'En pause', color: 'text-amber-600 bg-amber-50', icon: PauseCircle }
    default:
      return { label: 'Brouillon', color: 'text-gray-500 bg-gray-100', icon: Clock }
  }
}

export default function BoutiquesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [stores, setStores] = useState<StoreType[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null)
  const [showClone, setShowClone] = useState(false)
  const [cloneUrl, setCloneUrl] = useState('')
  const [cloning, setCloning] = useState(false)
  const [cloneError, setCloneError] = useState('')
  const [cloneResult, setCloneResult] = useState<any>(null)

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    const handler = () => setOpenMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  async function fetchStores() {
    setLoading(true)
    const { data, error } = await supabase
      .from('stores')
      .select('*, store_pages(builder_json)')
      .order('created_at', { ascending: false })

    if (!error && data) setStores(data as any[])
    setLoading(false)
  }

  function deleteStore(id: string) {
    setStoreToDelete(id)
  }

  async function handleConfirmDelete() {
    if (!storeToDelete) return
    setDeleting(storeToDelete)
    await supabase.from('stores').delete().eq('id', storeToDelete)
    setStores(prev => prev.filter(s => s.id !== storeToDelete))
    setDeleting(null)
    setStoreToDelete(null)
  }

  async function handleClone() {
    setCloneError('')
    setCloneResult(null)
    if (!cloneUrl.trim()) return
    setCloning(true)
    try {
      const res = await fetch('/api/stores/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cloneUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur de clonage')
      setCloneResult(data)
      setCloneUrl('')
      await fetchStores()
    } catch (err: any) {
      setCloneError(err.message)
    } finally {
      setCloning(false)
    }
  }

  async function duplicateStore(store: StoreType) {
    const newSlug = `${store.slug}-copie-${Date.now()}`
    const { data } = await supabase
      .from('stores')
      .insert({ name: `${store.name} (copie)`, slug: newSlug, status: 'draft' })
      .select()
      .single()
    if (data) {
      setStores(prev => [data as StoreType, ...prev])
    }
  }

  async function toggleStatus(store: StoreType) {
    const newStatus = store.status === 'published' ? 'paused' : 'published'
    await supabase.from('stores').update({ status: newStatus }).eq('id', store.id)
    setStores(prev => prev.map(s => s.id === store.id ? { ...s, status: newStatus } : s))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement des pages...</p>
        </div>
      </div>
    )
  }

  return (
        <div className="min-h-screen bg-gray-50 p-6">
      <ConfirmationModal
        isOpen={!!storeToDelete}
        onClose={() => setStoreToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la page ?"
        message="Voulez-vous vraiment supprimer cette page ? Cette action est irréversible."
        confirmLabel="Oui, supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
      {/* Modal clonage */}
      {showClone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => { if (!cloning) { setShowClone(false); setCloneError(''); setCloneResult(null) } }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" /> Cloner une boutique
              </h2>
              <button onClick={() => { setShowClone(false); setCloneError(''); setCloneResult(null) }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Entrez l'URL d'une boutique en ligne pour analyser son design et créer une page similaire dans votre compte.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="url"
                value={cloneUrl}
                onChange={e => setCloneUrl(e.target.value)}
                placeholder="https://exemple.com ou nom-de-domaine.com"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-gray-50 focus:bg-white transition-colors"
                onKeyDown={e => e.key === 'Enter' && !cloning && handleClone()}
                disabled={cloning}
              />
              <button
                onClick={handleClone}
                disabled={cloning || !cloneUrl.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {cloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {cloning ? 'Analyse...' : 'Cloner'}
              </button>
            </div>

            {cloneError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-3">{cloneError}</div>
            )}

            {cloneResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3">
                  <CheckCircle className="w-4 h-4" /> Boutique clonée avec succès !
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><b>Nom :</b> {cloneResult.data?.name}</p>
                  <p><b>Thème :</b> {cloneResult.analysis?.theme_used}</p>
                  {cloneResult.analysis?.colors_detected?.length > 0 && (
                    <p><b>Couleurs :</b> {cloneResult.analysis.colors_detected.join(', ')}</p>
                  )}
                  {cloneResult.analysis?.fonts_detected?.length > 0 && (
                    <p><b>Polices :</b> {cloneResult.analysis.fonts_detected.join(', ')}</p>
                  )}
                  {cloneResult.analysis?.logo_detected && <p><b>Logo :</b> ✓ récupéré</p>}
                  {cloneResult.analysis?.product_extracted && (
                    <p><b>Produit :</b> {cloneResult.analysis.product_title} ({cloneResult.analysis.product_price?.toLocaleString('fr-FR')} FCFA)</p>
                  )}
                  {cloneResult.analysis?.images_extracted > 0 && (
                    <p><b>Images :</b> {cloneResult.analysis.images_extracted} page + {cloneResult.analysis.product_images} produit → galerie</p>
                  )}
                  {cloneResult.analysis?.headings_detected > 0 && (
                    <p><b>Titres :</b> {cloneResult.analysis.headings_detected} heading(s) détecté(s)</p>
                  )}
                  {cloneResult.analysis?.testimonials_extracted > 0 && (
                    <p><b>Avis :</b> {cloneResult.analysis.testimonials_extracted} récupérés</p>
                  )}
                  {cloneResult.analysis?.faq_extracted > 0 && (
                    <p><b>FAQ :</b> {cloneResult.analysis.faq_extracted} questions récupérées</p>
                  )}
                </div>
                <button
                  onClick={() => { setShowClone(false); setCloneResult(null); router.push(`/boutiques/${cloneResult.data.id}`) }}
                  className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Ouvrir dans l'éditeur
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-7 h-7 text-indigo-600" />
            Mes Pages Produits
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Créez et gérez vos pages produits en ligne
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClone(true)}
            className="flex items-center gap-2 border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:text-indigo-800 px-4 py-2.5 rounded-xl font-medium text-sm transition-all bg-white hover:bg-indigo-50/50"
          >
            <Download className="w-4 h-4" />
            Cloner
          </button>
          <button
            onClick={() => router.push('/boutiques/nouvelle')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle page
          </button>
        </div>
      </div>

      {/* État vide */}
      {stores.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Aucune page pour l'instant
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Créez votre première page produit en quelques clics. Choisissez un thème, ajoutez vos produits et publiez.
          </p>
          <button
            onClick={() => router.push('/boutiques/nouvelle')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer ma première page
          </button>
        </div>
      )}

      {/* Grille des boutiques */}
      {stores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {stores.map((store: any) => {
            const sc = statusConfig(store.status)
            const StatusIcon = sc.icon
            
            let heroImage = null;
            if (store.store_pages && store.store_pages.length > 0) {
              const bJson = store.store_pages[0].builder_json;
              if (bJson) {
                const heroBlock = bJson.template?.find((b: any) => b.type === 'ProductHero' || b.type === 'product_hero');
                if (heroBlock && heroBlock.settings?.images && heroBlock.settings.images.length > 0) {
                  heroImage = heroBlock.settings.images[0];
                } else if (bJson.themeSettings?.logo_url) {
                  heroImage = bJson.themeSettings.logo_url;
                }
              }
            }

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Preview zone */}
                <div
                  className="h-36 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative cursor-pointer"
                  onClick={() => router.push(`/boutiques/${store.id}`)}
                >
                  {heroImage ? (
                    <img src={heroImage} alt={store.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-80 transition-opacity">
                      <Globe className="w-10 h-10 text-indigo-400" />
                      <span className="text-xs text-indigo-400 font-medium">Ouvrir l'éditeur</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{store.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">/{store.slug}</p>
                    </div>

                    {/* Menu contextuel */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu(openMenu === store.id ? null : store.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === store.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1">
                          <button
                            onClick={() => { router.push(`/boutiques/${store.id}`); setOpenMenu(null) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Modifier
                          </button>
                          <button
                            onClick={() => { window.open(`/s/${store.slug}`, '_blank'); setOpenMenu(null) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Voir la page
                          </button>
                          <button
                            onClick={async () => {
                              const newStatus = store.status === 'published' ? 'draft' : 'published';
                              await supabase.from('stores').update({ status: newStatus }).eq('id', store.id);
                              setStores(prev => prev.map(s => s.id === store.id ? { ...s, status: newStatus } : s));
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {store.status === 'published' ? 'Dépublier' : 'Publier'}
                          </button>
                          <button
                            onClick={() => { /* duplicateStore(store); */ setOpenMenu(null) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Copy className="w-3.5 h-3.5" /> Dupliquer
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => { deleteStore(store.id); setOpenMenu(null) }}
                            disabled={deleting === store.id}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleting === store.id ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${sc.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(store.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Actions rapides */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => router.push(`/boutiques/${store.id}`)}
                      className="flex-[2] flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium py-2 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Éditer
                    </button>
                    <button
                      onClick={() => window.open(`/s/${store.slug || store.id}`, '_blank')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-medium py-2 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {store.status === 'published' ? 'Voir' : 'Aperçu'}
                    </button>
                    <button
                      onClick={async () => {
                        const newStatus = store.status === 'published' ? 'draft' : 'published';
                        await supabase.from('stores').update({ status: newStatus }).eq('id', store.id);
                        setStores(prev => prev.map(s => s.id === store.id ? { ...s, status: newStatus } : s));
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${store.status === 'published' ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                      title={store.status === 'published' ? 'Dépublier' : 'Publier'}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteStore(store.id)}
                      disabled={deleting === store.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium py-2 rounded-lg transition-colors"
                      title="Supprimer la page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Carte Ajouter */}
          <button
            onClick={() => router.push('/boutiques/nouvelle')}
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] group"
          >
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">
              Nouvelle page
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
