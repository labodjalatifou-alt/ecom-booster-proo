'use client'
// components/analyse/ShopifyImagePicker.tsx

import { useState, useRef } from 'react'
import { Loader2, ImageIcon, Check, Upload, AlertCircle, ExternalLink, X, Search, Plus, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

export interface ImagePickerState {
  mediaSelected: string[]
  paraImages: Record<number, string>
}

interface Paragraphe {
  titre: string
  texte: string
}

interface ShopifyImagePickerProps {
  produit: string
  pays?: string
  prix?: number
  currency?: string
  paragraphes: Paragraphe[]
  bullets?: string[]
  titre: string
  tags?: string
  quantite?: number
  status?: 'draft' | 'active'
  onPublished?: (productUrl: string) => void
  onImagesChange?: (state: ImagePickerState) => void
}

export default function ShopifyImagePicker({
  produit, prix = 0, currency = 'FCFA',
  paragraphes, bullets = [], titre, tags, quantite = 10, status = 'draft',
  onPublished, onImagesChange,
}: ShopifyImagePickerProps) {

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  
  const [mediaSelected, setMediaSelected] = useState<string[]>([])
  const [paraImages, setParaImages] = useState<Record<number, string>>({})
  const [assigningToPara, setAssigningToPara] = useState<number | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const notifyParent = (media: string[], para: Record<number, string>) => {
    onImagesChange?.({ mediaSelected: media, paraImages: para })
  }

  // ── Liens de recherche ──────────────────────────────────────────
  const searchLinks = [
    { name: 'Pinterest', url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(produit)}`, icon: '📌' },
    { name: 'Google Images', url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(produit)}`, icon: '🖼️' },
    { name: 'Google Shopping', url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(produit)}`, icon: '🛍️' },
    { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent(produit)}`, icon: '🛒' },
    { name: 'AliExpress', url: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(produit)}`, icon: '📦' },
    { name: 'Etsy', url: `https://www.etsy.com/search?q=${encodeURIComponent(produit)}`, icon: '🎨' },
    { name: 'Google (Nom + Shopify)', url: `https://www.google.com/search?q=${encodeURIComponent(produit + ' Shopify')}`, icon: '🔍' },
    { name: 'Giphy', url: `https://giphy.com/search/${encodeURIComponent(produit)}`, icon: '✨' },
    { name: 'Tenor', url: `https://tenor.com/search/${encodeURIComponent(produit)}`, icon: '🎭' },
    { name: 'YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(produit)}`, icon: '▶️' },
  ]

  // ── Upload manuel ──────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    let loadedCount = 0

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string)
        }
        loadedCount++
        if (loadedCount === files.length) {
          setUploadedImages(prev => [...prev, ...newImages])
          toast.success(`${files.length} image(s) importée(s)`)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // ── Sélection médias ────────────────────────────────────────────
  const toggleMedia = (url: string) => {
    if (assigningToPara !== null) {
      const next = { ...paraImages, [assigningToPara]: url }
      setParaImages(next)
      setAssigningToPara(null)
      toast.success(`📎 Image assignée au §${assigningToPara + 1}`)
      notifyParent(mediaSelected, next)
      return
    }
    const next = mediaSelected.includes(url)
      ? mediaSelected.filter(u => u !== url)
      : mediaSelected.length < 10 ? [...mediaSelected, url] : mediaSelected
    setMediaSelected(next)
    notifyParent(next, paraImages)
  }

  const removeParaImage = (i: number) => {
    const next = { ...paraImages }
    delete next[i]
    setParaImages(next)
    notifyParent(mediaSelected, next)
  }

  const deleteUploadedImage = (url: string) => {
    setUploadedImages(prev => prev.filter(u => u !== url))
    const nextMedia = mediaSelected.filter(u => u !== url)
    const nextPara = { ...paraImages }
    Object.keys(nextPara).forEach(k => {
      if (nextPara[Number(k)] === url) delete nextPara[Number(k)]
    })
    setMediaSelected(nextMedia)
    setParaImages(nextPara)
    notifyParent(nextMedia, nextPara)
  }

  // ── Publication Shopify ───────────────────────────────────────
  const publishToShopify = async () => {
    if (!titre) { toast.error('Sélectionnez un titre'); return }
    if (paragraphes.length === 0) { toast.error('Aucun paragraphe'); return }

    setPublishing(true)
    try {
      const res = await fetch('/api/shopify/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titre, paragraphes, bullets, prix, currency,
          tags: tags || produit, status: status,
          mediaImages: mediaSelected, paragraphImages: paraImages, quantite,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPublishedUrl(data.product.admin_url)
      toast.success(`✅ Produit créé — ${data.product.images_count} image(s) uploadée(s)`)
      onPublished?.(data.product.admin_url)
    } catch (err: any) {
      toast.error('Erreur publication: ' + err.message)
    } finally {
      setPublishing(false)
    }
  }

  const totalAssigned = Object.keys(paraImages).length

  return (
    <div className="space-y-8 mt-6">

      {/* ── 1. Liens de recherche ────────────────────────────── */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-500" /> Liens de Recherche Pré-remplis
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
          Cliquez sur ces liens pour trouver des images, vidéos ou GIFs pour "<strong>{produit}</strong>". Téléchargez-les sur votre appareil puis importez-les ci-dessous.
        </p>
        <div className="flex flex-wrap gap-3">
          {searchLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all hover:-translate-y-0.5"
            >
              <span>{link.icon}</span> {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* ── 2. Import et Galerie ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-500" /> Vos Images Importées
          </h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={14} /> Importer des fichiers
          </button>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>

        {uploadedImages.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center bg-slate-50 dark:bg-slate-800/30">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <ImageIcon size={24} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Aucune image importée pour le moment.
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Utilisez les liens de recherche ci-dessus pour télécharger des visuels, puis importez-les ici.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-xl p-3 flex gap-2 border text-xs font-medium transition-all ${
              assigningToPara !== null
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            }`}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {assigningToPara !== null ? (
                <span>
                  🎯 <strong>Mode assignation §{assigningToPara + 1}</strong> — Cliquez une image pour l'injecter dans la description.
                  <button onClick={() => setAssigningToPara(null)} className="underline text-red-500 ml-2">Annuler</button>
                </span>
              ) : (
                <span>
                  <strong>Cliquez</strong> sur une image pour l'ajouter à la galerie principale (✅).
                  Utilisez <strong>"📎 Assigner"</strong> plus bas pour injecter une image dans un paragraphe.
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {uploadedImages.map((url, i) => (
                <div
                  key={i}
                  onClick={() => toggleMedia(url)}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                    mediaSelected.includes(url)
                      ? 'border-blue-500 shadow-lg shadow-blue-500/25 scale-[1.03]'
                      : assigningToPara !== null
                        ? 'border-blue-300 hover:border-blue-500 hover:scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:scale-[1.02]'
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full aspect-square object-cover bg-white dark:bg-slate-900"
                  />
                  {mediaSelected.includes(url) && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-start justify-end p-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                  {assigningToPara !== null && !mediaSelected.includes(url) && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-white text-[10px] font-black bg-black/70 px-2 py-1 rounded-lg">Assigner</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteUploadedImage(url)
                    }}
                    className="absolute bottom-2 right-2 w-6 h-6 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400">
              <span>
                <strong className="text-slate-800 dark:text-white">{mediaSelected.length}</strong> dans la galerie
                {' · '}
                <strong className="text-slate-800 dark:text-white">{totalAssigned}</strong> images inline
              </span>
              {mediaSelected.length > 0 && (
                <button
                  onClick={() => { setMediaSelected([]); notifyParent([], paraImages) }}
                  className="text-red-400 hover:text-red-600 font-bold transition-colors"
                >
                  Tout désélectionner
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Paragraphes + assignation ───────────────────────── */}
      {paragraphes.length > 0 && uploadedImages.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Layers size={16} /> Placement des images dans le texte
          </h3>
          <div className="space-y-2">
            {paragraphes.map((p, i) => (
              <div
                key={i}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                  assigningToPara === i
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10'
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{p.titre}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{p.texte}</p>
                    </div>
                    {paraImages[i] && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={paraImages[i]}
                          alt={p.titre}
                          className="w-14 h-14 object-cover bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-300"
                        />
                        <button
                          onClick={() => removeParaImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setAssigningToPara(assigningToPara === i ? null : i)}
                    className={`mt-2 ml-9 text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all ${
                      assigningToPara === i
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : paraImages[i]
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700'
                    }`}
                  >
                    {assigningToPara === i ? '✏️ Cliquez une image ci-dessus...'
                      : paraImages[i] ? '🔄 Changer image'
                      : '📎 Assigner image'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Publication Shopify ────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
        {publishedUrl ? (
          <a href={publishedUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all"
          >
            <ExternalLink size={16} /> Voir le produit sur Shopify ↗
          </a>
        ) : (
          <button
            onClick={publishToShopify}
            disabled={publishing || paragraphes.length === 0}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            {publishing
              ? <><Loader2 size={16} className="animate-spin" /> Publication...</>
              : <>
                  <Upload size={16} />
                  Créer sur Shopify
                  <span className="bg-white/20 rounded-lg px-2 py-0.5 text-[10px]">
                    {mediaSelected.length} média · {totalAssigned} inline
                  </span>
                </>
            }
          </button>
        )}
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
          Produit créé en statut : <strong>{status === 'active' ? 'ACTIF' : 'BROUILLON'}</strong>.
        </p>
      </div>
    </div>
  )
}
