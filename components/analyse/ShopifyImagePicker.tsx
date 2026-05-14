'use client'
// components/analyse/ShopifyImagePicker.tsx
// Galerie images Serper + sélection double usage + Live Preview intégré

import { useState, useCallback } from 'react'
import { Loader2, ImageIcon, Check, Upload, AlertCircle, ExternalLink, X, Search, RefreshCw, Layers, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export interface SearchedImage {
  url: string
  title: string
  source: string
  type: 'pinterest' | 'amazon' | 'ecom' | 'lifestyle' | 'white_bg' | 'in_action' | 'closeup'
  thumbnail?: string
  width?: number
  height?: number
}

interface Paragraphe {
  titre: string
  texte: string
}

export interface ImagePickerState {
  mediaSelected: string[]
  paraImages: Record<number, string>
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
  onPublished?: (productUrl: string) => void
  onImagesChange?: (state: ImagePickerState) => void
}

const TYPE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  pinterest: { label: 'Pinterest',       icon: '📌', desc: 'inspirations & lifestyle de qualité' },
  amazon:    { label: 'Amazon',          icon: '🛒', desc: 'photos produit professionnelles' },
  ecom:      { label: 'E-commerce',      icon: '🛍️', desc: 'AliExpress · Shein · Etsy · Walmart' },
  lifestyle: { label: 'Lifestyle',       icon: '🌅', desc: 'produit en situation réelle' },
  white_bg:  { label: 'Fond blanc',      icon: '⬜', desc: '' },
  in_action: { label: 'En action',       icon: '🎬', desc: '' },
  closeup:   { label: 'Gros plan',       icon: '🔍', desc: '' },
}

export default function ShopifyImagePicker({
  produit, pays = 'Sénégal', prix = 0, currency = 'FCFA',
  paragraphes, bullets = [], titre, tags, quantite = 10,
  onPublished, onImagesChange,
}: ShopifyImagePickerProps) {

  const [images, setImages] = useState<SearchedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [mediaSelected, setMediaSelected] = useState<string[]>([])
  const [paraImages, setParaImages] = useState<Record<number, string>>({})
  const [assigningToPara, setAssigningToPara] = useState<number | null>(null)

  const notifyParent = (media: string[], para: Record<number, string>) => {
    onImagesChange?.({ mediaSelected: media, paraImages: para })
  }

  // ── Recherche images ──────────────────────────────────────────
  const searchImages = useCallback(async () => {
    setLoading(true)
    setImages([])
    setAssigningToPara(null)
    try {
      const res = await fetch('/api/images/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produit, pays }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')

      setImages(data.images || [])
      setSearchTerm(data.searchTerm || '')

      if ((data.images?.length || 0) > 0) {
        toast.success(`${data.images.length} images trouvées — "${data.searchTerm}"`)
        if (data.warning) toast(`⚠️ ${data.warning}`, { duration: 5000 })
      } else {
        toast.error(`⚠️ ${data.warning || data.error || 'Aucune image trouvée.'}`, { duration: 8000 })
      }
    } catch (err: any) {
      toast.error('❌ ' + err.message, { duration: 10000 })
    } finally {
      setLoading(false)
    }
  }, [produit, pays])

  // ── Sélection médias galerie ──────────────────────────────────
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
          tags: tags || produit, status: 'draft',
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

  // ── Grouper les images par type ───────────────────────────────
  const byType = (type: string) => images.filter(i => i.type === type)
  const totalAssigned = Object.keys(paraImages).length
  const imageGroups = [
    { type: 'pinterest', items: byType('pinterest') },
    { type: 'amazon', items: byType('amazon') },
    { type: 'ecom', items: byType('ecom') },
    { type: 'lifestyle', items: byType('lifestyle') },
  ].filter(g => g.items.length > 0)

  return (
    <div className="space-y-6 mt-6">

      {/* ── Header + bouton recherche ─────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🖼️</span> Images produit
          </h3>
          {searchTerm && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Recherche : <span className="font-bold text-blue-600 dark:text-blue-400">"{searchTerm}"</span>
              <span className="ml-2 text-slate-400">(fond blanc · lifestyle · action · gros plan)</span>
            </p>
          )}
        </div>
        <button
          onClick={searchImages}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Recherche...</>
            : images.length > 0 ? <><RefreshCw size={14} /> Nouvelles images</>
            : <><Search size={14} /> Chercher images</>}
        </button>
      </div>

      {/* ── Zone vide ──────────────────────────────────────── */}
      {images.length === 0 && !loading && (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
          <ImageIcon size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Cliquez sur <strong>"Chercher images"</strong> pour trouver des visuels de qualité.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
            <span>📌 Pinterest</span>
            <span>🛒 Amazon</span>
            <span>🛍️ AliExpress · Shein · Etsy</span>
            <span>🌅 Lifestyle</span>
          </div>
        </div>
      )}

      {/* ── Galerie par catégorie ───────────────────────────── */}
      {images.length > 0 && (
        <>
          {/* Bandeau instructions */}
          <div className={`rounded-xl p-3 flex gap-2 border text-xs font-medium transition-all ${
            assigningToPara !== null
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}>
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            {assigningToPara !== null ? (
              <span>
                🎯 <strong>Mode assignation §{assigningToPara + 1}</strong> — Cliquez une image pour l'injecter dans la description.
                <button onClick={() => setAssigningToPara(null)} className="underline text-red-500 ml-2">Annuler</button>
              </span>
            ) : (
              <span>
                <strong>Cliquez</strong> une image pour la sélectionner en galerie Shopify (✅).
                Puis <strong>"📎 Assigner"</strong> sous un paragraphe pour l'injecter dans le texte.
              </span>
            )}
          </div>

          {/* Groupes d'images */}
          {imageGroups.map(({ type, items }) => {
            const meta = TYPE_LABELS[type] || { label: type, icon: '📷', desc: '' }
            return (
              <div key={type}>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  {meta.icon} {meta.label}
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full px-2 py-0.5 text-[9px] font-black">
                    {items.length}
                  </span>
                  {meta.desc && (
                    <span className="text-[9px] text-slate-400 font-normal normal-case tracking-normal">— {meta.desc}</span>
                  )}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {items.map((img, i) => (
                    <ImageCard
                      key={`${type}-${i}`}
                      img={img}
                      isMediaSelected={mediaSelected.includes(img.url)}
                      isAssigning={assigningToPara !== null}
                      onClick={() => toggleMedia(img.url)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Compteur */}
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400">
            <span>
              <strong className="text-slate-800 dark:text-white">{mediaSelected.length}</strong> galerie principale
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

          {/* Aperçu sélection galerie */}
          {mediaSelected.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Aperçu galerie Shopify ({mediaSelected.length} image{mediaSelected.length > 1 ? 's' : ''})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mediaSelected.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0 group">
                    <img
                      src={url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-xl border-2 border-blue-300"
                      onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    <button
                      onClick={() => { const next = mediaSelected.filter(u => u !== url); setMediaSelected(next); notifyParent(next, paraImages) }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center"
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Paragraphes + assignation image ────────────────── */}
      {paragraphes.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Layers size={16} /> Description — Titre · Texte · Image (alternance)
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
                          className="w-14 h-14 object-cover rounded-xl border-2 border-blue-300"
                          onError={e => (e.target as HTMLImageElement).style.display = 'none'}
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

                  {images.length > 0 && (
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
                      {assigningToPara === i ? '✏️ Cliquez une image...'
                        : paraImages[i] ? '🔄 Changer image'
                        : '📎 Assigner image'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bouton publication ──────────────────────────────── */}
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
          Produit créé en <strong>brouillon</strong> — activez dans Shopify après vérification.
        </p>
      </div>
    </div>
  )
}

// ── ImageCard ─────────────────────────────────────────────────
interface ImageCardProps {
  img: SearchedImage
  isMediaSelected: boolean
  isAssigning: boolean
  onClick: () => void
}

function ImageCard({ img, isMediaSelected, isAssigning, onClick }: ImageCardProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  if (error) return null

  return (
    <div
      onClick={onClick}
      title={img.title}
      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-150 ${
        isMediaSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/25 scale-[1.03]'
          : isAssigning
            ? 'border-blue-300 dark:border-blue-600 hover:border-blue-500 hover:scale-[1.02]'
            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02]'
      }`}
    >
      {!loaded && <div className="w-full aspect-square bg-slate-100 dark:bg-slate-700 animate-pulse" />}
      <img
        src={img.thumbnail || img.url}
        alt={img.title}
        className={`w-full aspect-square object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {isMediaSelected && (
        <div className="absolute inset-0 bg-blue-500/20 flex items-start justify-end p-1.5">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
            <Check size={11} className="text-white" />
          </div>
        </div>
      )}
      {isAssigning && !isMediaSelected && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <span className="text-white text-[10px] font-black bg-black/70 px-2 py-1 rounded-lg">Assigner ici</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-150">
        <p className="text-[8px] text-white/90 truncate font-medium">{img.source}</p>
      </div>
    </div>
  )
}
