'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { THEMES } from '@/lib/store-builder/defaults'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Store,
} from 'lucide-react'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50)
}

export default function NouvelleBoutiquePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(val: string) {
    setName(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleSlugChange(val: string) {
    setSlug(slugify(val))
    setSlugEdited(true)
  }

  async function createStore() {
    if (!name.trim()) { setError('Le nom de la boutique est requis.'); return }
    if (!slug.trim()) { setError('Le slug est requis.'); return }

    setCreating(true)
    setError('')

    const response = await fetch('/api/stores/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        theme_id: selectedTheme,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => step === 1 ? router.push('/boutiques') : setStep(1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-indigo-600" />
          <h1 className="font-semibold text-gray-900">Nouvelle boutique</h1>
        </div>

        {/* Steps indicator */}
        <div className="ml-auto flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            <span>1</span>
            <span>Thème</span>
          </div>
          <div className="w-6 h-px bg-gray-200" />
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            <span>2</span>
            <span>Infos</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ÉTAPE 1 — Choix du thème */}
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
              <p className="text-gray-500 text-sm">
                Vous pourrez personnaliser les couleurs et le contenu après. Choisissez la direction qui vous correspond.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${
                    selectedTheme === theme.id
                      ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  {/* Preview couleurs */}
                  <div
                    className="h-32 flex items-center justify-center relative"
                    style={{ backgroundColor: theme.default_colors.bg }}
                  >
                    {/* Simulation mini boutique */}
                    <div className="w-full px-6">
                      <div
                        className="h-3 rounded-full mb-2 w-3/4"
                        style={{ backgroundColor: theme.default_colors.text, opacity: 0.15 }}
                      />
                      <div
                        className="h-2 rounded-full mb-4 w-1/2"
                        style={{ backgroundColor: theme.default_colors.text, opacity: 0.08 }}
                      />
                      <div
                        className="h-8 rounded-xl w-1/3 flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: theme.default_colors.primary,
                          color: '#fff',
                        }}
                      >
                        Commander
                      </div>
                    </div>

                    {/* Badge sélectionné */}
                    {selectedTheme === theme.id && (
                      <div className="absolute top-3 right-3 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Palette couleurs */}
                    <div className="absolute bottom-3 right-3 flex gap-1.5">
                      {[
                        theme.default_colors.primary,
                        theme.default_colors.accent,
                        theme.default_colors.bgSection,
                      ].map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{theme.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {theme.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
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
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                Continuer avec ce thème
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 2 — Infos de la boutique */}
        {step === 2 && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Nommez votre boutique
              </h2>
              <p className="text-gray-500 text-sm">
                Ces informations peuvent être modifiées plus tard depuis les paramètres.
              </p>
            </div>

            <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {/* Thème sélectionné */}
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl mb-6">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: THEMES.find(t => t.id === selectedTheme)?.default_colors.primary }}
                />
                <div>
                  <p className="text-xs text-indigo-500 font-medium">Thème sélectionné</p>
                  <p className="text-sm font-semibold text-indigo-900">
                    {THEMES.find(t => t.id === selectedTheme)?.name}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 underline"
                >
                  Changer
                </button>
              </div>

              {/* Nom */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom de la boutique <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ex: Ma Boutique Beauté"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-gray-900 text-sm transition-all"
                />
              </div>

              {/* Slug */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  URL de la boutique <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 whitespace-nowrap">
                    /s/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="ma-boutique"
                    className="flex-1 px-3 py-3 outline-none text-gray-900 text-sm bg-white"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Votre boutique sera accessible sur : <span className="font-mono text-indigo-500">/s/{slug || 'ma-boutique'}</span>
                </p>
              </div>

              {/* Erreur */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={createStore}
                  disabled={creating || !name.trim() || !slug.trim()}
                  className="flex-2 flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Création...
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