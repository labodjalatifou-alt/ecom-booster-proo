'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getThemesForPicker } from '@/lib/store-builder/boutique-themes'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  Sparkles,
  Store,
} from 'lucide-react'

const THEMES = getThemesForPicker()

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50)
}

interface ProductRow {
  id: string
  product_name?: string
  name?: string
  price?: number
  currency?: string
  image_url?: string
  images?: string[]
}

export default function NouvelleBoutiquePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (step !== 2) return
    setLoadingProducts(true)
    supabase
      .from('products')
      .select('id, product_name, name, price, currency, image_url, images')
      .order('created_at', { ascending: false })
      .then(({ data }: { data: ProductRow[] | null }) => {
        setProducts((data as ProductRow[]) || [])
        setLoadingProducts(false)
      })
  }, [step, supabase])

  function handleNameChange(val: string) {
    setName(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleSlugChange(val: string) {
    setSlug(slugify(val))
    setSlugEdited(true)
  }

  function productLabel(p: ProductRow) {
    return p.product_name || p.name || 'Produit sans nom'
  }

  function productImage(p: ProductRow) {
    return p.image_url || p.images?.[0] || null
  }

  async function createStore() {
    if (!name.trim()) { setError('Le nom de la boutique est requis.'); return }
    if (!slug.trim()) { setError('Le slug est requis.'); return }

    setCreating(true)
    setError('')

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const response = await fetch('/api/stores/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        theme_id: selectedTheme,
        product_id: selectedProductId,
      }),
    })

    const payload = await response.json()

    if (!response.ok || payload.error) {
      setError(payload.error || 'Erreur lors de la création. Réessayez.')
      setCreating(false)
      return
    }

    router.push(`/boutiques/${payload.data.id}`)
  }

  const selectedThemeData = THEMES.find(t => t.id === selectedTheme)
  const selectedProduct = products.find(p => p.id === selectedProductId)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => {
            if (step === 1) router.push('/boutiques')
            else setStep((step - 1) as 1 | 2)
          }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-indigo-600" />
          <h1 className="font-semibold text-gray-900">Nouvelle boutique</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {(['Thème', 'Produit', 'Infos'] as const).map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <div className="w-4 h-px bg-gray-200 hidden sm:block" />}
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                    step >= n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span>{n}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* ÉTAPE 1 — Thème */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Choisissez votre thème
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Quel style pour votre boutique ?
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Chaque thème inclut sections, couleurs et polices pré-configurées. Vous pourrez tout modifier ensuite.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${
                    selectedTheme === theme.id
                      ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={theme.preview_image}
                      alt={theme.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {selectedTheme === theme.id && (
                      <div className="absolute top-3 right-3 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {[theme.preview_color, theme.default_colors.accent, theme.default_colors.bg].map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/70 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{theme.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {theme.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                Continuer avec ce thème
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 2 — Produit */}
        {step === 2 && (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                <Package className="w-4 h-4" />
                Produit principal
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Pour quel produit créez-vous la boutique ?
              </h2>
              <p className="text-gray-500 text-sm">
                Le thème <strong>{selectedThemeData?.name}</strong> sera pré-rempli avec les infos de ce produit.
              </p>
            </div>

            {loadingProducts ? (
              <p className="text-center text-gray-400 text-sm py-12">Chargement des produits…</p>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">Aucun produit disponible</p>
                <p className="text-gray-400 text-sm mb-4">Ajoutez un produit d&apos;abord, ou continuez sans.</p>
                <button
                  type="button"
                  onClick={() => router.push('/produits/ajouter')}
                  className="text-indigo-600 text-sm font-medium hover:underline"
                >
                  Ajouter un produit →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {products.map(product => {
                  const img = productImage(product)
                  const selected = selectedProductId === product.id
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProductId(product.id)}
                      className={`text-left rounded-xl border-2 overflow-hidden transition-all bg-white ${
                        selected ? 'border-indigo-500 shadow-md' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="h-32 bg-gray-50 flex items-center justify-center relative">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-10 h-10 text-gray-300" />
                        )}
                        {selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-gray-900 text-sm truncate">{productLabel(product)}</p>
                        {product.price != null && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                            {Number(product.price).toLocaleString('fr-FR')} {product.currency || 'FCFA'}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex justify-center gap-3">
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSelectedProductId(null); setStep(3) }}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                  Continuer sans produit
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={products.length > 0 && !selectedProductId}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                Continuer
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 3 — Infos boutique */}
        {step === 3 && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nommez votre boutique</h2>
              <p className="text-gray-500 text-sm">Ces informations peuvent être modifiées plus tard.</p>
            </div>

            <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl mb-4">
                <div
                  className="w-8 h-8 rounded-lg shrink-0"
                  style={{ backgroundColor: selectedThemeData?.preview_color }}
                />
                <div className="min-w-0">
                  <p className="text-xs text-indigo-500 font-medium">Thème</p>
                  <p className="text-sm font-semibold text-indigo-900 truncate">{selectedThemeData?.name}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-indigo-500 hover:underline shrink-0">
                  Changer
                </button>
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
                  {productImage(selectedProduct) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={productImage(selectedProduct)!} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-300" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Produit</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{productLabel(selectedProduct)}</p>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="ml-auto text-xs text-indigo-500 hover:underline shrink-0">
                    Changer
                  </button>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom de la boutique <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ex: Ma Boutique Beauté"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-gray-900 text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  URL de la boutique <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                  <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/s/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="ma-boutique"
                    className="flex-1 px-3 py-3 outline-none text-gray-900 text-sm bg-white"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Accessible sur : <span className="font-mono text-indigo-500">/s/{slug || 'ma-boutique'}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={createStore}
                  disabled={creating || !name.trim() || !slug.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Création…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Créer la boutique
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
