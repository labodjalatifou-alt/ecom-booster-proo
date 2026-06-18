'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  Upload,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Save,
  Globe,
  Tag,
  Loader2,
  Truck,
  Search,
  Info,
  Pencil,
} from 'lucide-react'

// Chargement dynamique pour éviter les erreurs SSR avec Tiptap
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false, loading: () => <div className="h-[240px] border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800 animate-pulse" /> })

type StatusType = 'Actif' | 'Brouillon' | 'Archivé'

interface FormData {
  titre: string
  description: string
  statut: StatusType
  type: string
  fournisseur: string
  categorie: string
  collections: string[]
  balises: string[]
  modeleTheme: string
  medias: File[]
  mediaPreviews: string[]
  // Prix
  prix: string
  prixAvantReduction: string
  facturationTaxe: boolean
  coutParArticle: string
  // Stock
  suivreStock: boolean
  quantite: string
  sku: string
  codeBarres: string
  vendreEnRupture: boolean
  // Expédition
  produitPhysique: boolean
  emballage: string
  poids: string
  unitePoids: string
  paysOrigine: string
  codeSH: string
  // SEO
  seoTitre: string
  seoDescription: string
  seoUrl: string
}

const INITIAL: FormData = {
  titre: '', description: '', statut: 'Actif',
  type: 'Aucun', fournisseur: 'Aucun', categorie: '',
  collections: [], balises: [], modeleTheme: 'Modèle par défaut : Produit',
  medias: [], mediaPreviews: [],
  prix: '', prixAvantReduction: '', facturationTaxe: true, coutParArticle: '',
  suivreStock: true, quantite: '0', sku: '', codeBarres: '', vendreEnRupture: false,
  produitPhysique: true, emballage: 'Par défaut de la boutique • Boîte d\'échantillons', poids: '0.0', unitePoids: 'kg', paysOrigine: '', codeSH: '',
  seoTitre: '', seoDescription: '', seoUrl: '',
}

export default function BoutiqueEnLignePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [savedForm, setSavedForm] = useState<FormData>(INITIAL)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newBalise, setNewBalise] = useState('')
  const [variantesOpen, setVariantesOpen] = useState(false)
  const [champsMeta, setChampsMeta] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [stockExpanded, setStockExpanded] = useState(false)
  const [expeditionExpanded, setExpeditionExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect changes
  useEffect(() => {
    const changed = JSON.stringify({ ...form, medias: [] }) !== JSON.stringify({ ...savedForm, medias: [] })
    setHasChanges(changed)
  }, [form, savedForm])

  const set = (patch: Partial<FormData>) => setForm(prev => ({ ...prev, ...patch }))

  const handleMediaUpload = useCallback((files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    set({ medias: [...form.medias, ...newFiles], mediaPreviews: [...form.mediaPreviews, ...newPreviews] })
  }, [form.medias, form.mediaPreviews])

  const removeMedia = (idx: number) => {
    set({
      medias: form.medias.filter((_, i) => i !== idx),
      mediaPreviews: form.mediaPreviews.filter((_, i) => i !== idx),
    })
  }

  const addBalise = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && newBalise.trim()) {
      e.preventDefault()
      set({ balises: [...form.balises, newBalise.trim()] })
      setNewBalise('')
    }
  }

  const handleSave = async () => {
    if (!form.titre.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSavedForm({ ...form })
    setSaving(false)
    setHasChanges(false)
  }

  const handleDiscard = () => {
    setForm({ ...savedForm })
    setHasChanges(false)
  }

  const margin = form.prix && form.coutParArticle
    ? ((parseFloat(form.prix) - parseFloat(form.coutParArticle)) / parseFloat(form.prix) * 100).toFixed(0)
    : null

  return (
    <div className="min-h-screen bg-[#f1f1f1] dark:bg-slate-950 pb-20">

      {/* ─── Top Bar (always visible) ─── */}
      <div className="sticky top-0 z-20 bg-[#1a1a1a] text-white flex items-center gap-3 px-5 py-3 shadow-xl">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="hover:text-white cursor-pointer transition-colors">Produits</span>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium">
            {form.titre.trim() ? form.titre : 'Produit non enregistré'}
          </span>
        </div>
        {/* Save bar only when there are unsaved changes */}
        {hasChanges && (
          <div className="ml-auto flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
            <button
              onClick={handleDiscard}
              className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.titre.trim()}
              className="flex items-center gap-2 px-5 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-emerald-900/30"
            >
              {saving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Enregistrer</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── Page Title ─── */}
      <div className="max-w-6xl mx-auto px-5 pt-7 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-gray-400 text-base font-normal cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => router.back()}>Produits</span>
          <span className="text-gray-300 dark:text-gray-600">›</span>
          Ajouter un produit
        </h1>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="max-w-6xl mx-auto px-5 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="space-y-4">

          {/* ─ Titre + Description ─ */}
          <Card>
            <div className="p-5 border-b border-gray-100 dark:border-slate-800">
              <Label>Titre</Label>
              <input
                type="text"
                value={form.titre}
                onChange={e => set({ titre: e.target.value })}
                placeholder="T-shirt à manches courtes"
                className={Input}
              />
            </div>
            <div className="p-5">
              <Label>Description</Label>
              <div className="mt-1">
                <RichTextEditor
                  content={form.description}
                  onChange={html => set({ description: html })}
                  placeholder="Décrivez votre produit en détail..."
                />
              </div>
            </div>
          </Card>

          {/* ─ Médias ─ */}
          <Card>
            <div className="p-5">
              <Label>Supports multimédias</Label>
              {form.mediaPreviews.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
                  {form.mediaPreviews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[9px] font-bold text-center py-0.5">PRINCIPALE</div>}
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-indigo-500 transition-all">
                    <Plus className="w-5 h-5" /><span className="text-[9px] font-bold uppercase">Ajouter</span>
                  </button>
                </div>
              ) : (
                <div
                  onDrop={e => { e.preventDefault(); handleMediaUpload(e.dataTransfer.files) }}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-all cursor-pointer"
                >
                  <div className="flex gap-3">
                    <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-gray-50 transition-all pointer-events-none">
                      <Upload className="w-4 h-4" /> Importer
                    </button>
                    <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-gray-50 transition-all pointer-events-none">
                      <FolderOpen className="w-4 h-4" /> Sélectionner un fichier existant
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Accepte les images, les vidéos ou les modèles 3D</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleMediaUpload(e.target.files)} />
            </div>
          </Card>

          {/* ─ Catégorie ─ */}
          <Card>
            <div className="p-5">
              <Label>Catégorie</Label>
              <SelectField value={form.categorie} onChange={v => set({ categorie: v })} placeholder="Choisir une catégorie de produits">
                <option value="">Choisir une catégorie de produits</option>
                <option value="beaute">Beauté &amp; Cosmétiques</option>
                <option value="hightech">High-Tech &amp; Électronique</option>
                <option value="mode">Mode &amp; Vêtements</option>
                <option value="maison">Maison &amp; Décoration</option>
                <option value="sport">Sport &amp; Fitness</option>
                <option value="sante">Santé &amp; Bien-être</option>
                <option value="enfants">Enfants &amp; Jouets</option>
                <option value="alimentation">Alimentation</option>
              </SelectField>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
                Détermine les taux de taxation et ajoute des champs méta pour améliorer la recherche, les filtres et les ventes intercanaux.
              </p>
            </div>
          </Card>

          {/* ─ Prix ─ */}
          <Card>
            <div className="p-5">
              <Label>Prix</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.prix}
                    onChange={e => set({ prix: e.target.value })}
                    placeholder="0"
                    className={`${Input} pr-14`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">FCFA</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.prixAvantReduction}
                    onChange={e => set({ prixAvantReduction: e.target.value })}
                    placeholder="Prix avant réduction"
                    className={`${Input} pr-14`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">FCFA</span>
                </div>
              </div>

              {/* Tabs: Prix unitaire, Taxe, Coût */}
              <div className="mt-4 flex flex-wrap gap-2">
                <TabBtn label="Prix unitaire" active={false} />
                <TabBtn
                  label={`Facturer la taxe ${form.facturationTaxe ? '· Oui' : '· Non'}`}
                  active={form.facturationTaxe}
                  onClick={() => set({ facturationTaxe: !form.facturationTaxe })}
                />
              </div>

              {/* Coût par article */}
              <div className="mt-4 border-t border-gray-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Label>Coût par article</Label>
                  <button title="Le coût d'achat de cet article. Il ne s'affiche pas aux clients.">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.coutParArticle}
                      onChange={e => set({ coutParArticle: e.target.value })}
                      placeholder="0"
                      className={`${Input} pr-14`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">FCFA</span>
                  </div>
                  <div className="flex items-center px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                    {margin !== null ? (
                      <span>Marge : <span className="font-semibold text-gray-800 dark:text-gray-200">{margin} %</span></span>
                    ) : (
                      <span className="text-gray-400">Marge : --</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ─ Stock ─ */}
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Label>Stock</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Stock suivi</span>
                  <Toggle checked={form.suivreStock} onChange={v => set({ suivreStock: v })} />
                </label>
              </div>

              {/* Header */}
              <div className="grid grid-cols-[1fr_120px] gap-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Quantité</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1 text-right">Quantité</span>
              </div>

              {/* Row: Emplacement de la boutique */}
              <div className="grid grid-cols-[1fr_120px] gap-3 items-center py-2 border-t border-gray-100 dark:border-slate-800">
                <span className="text-sm text-gray-700 dark:text-gray-300">Emplacement de la boutique</span>
                <input
                  type="number"
                  min="0"
                  value={form.quantite}
                  onChange={e => set({ quantite: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-right text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Expanded fields */}
              <div className="mt-4 flex flex-wrap gap-2">
                <TabBtn label="SKU" active={false} onClick={() => setStockExpanded(!stockExpanded)} />
                <TabBtn label="Code-barres" active={false} onClick={() => setStockExpanded(!stockExpanded)} />
                <TabBtn
                  label={`Vendre en cas de rupture de stock · ${form.vendreEnRupture ? 'Activé' : 'Désactivé'}`}
                  active={form.vendreEnRupture}
                  onClick={() => set({ vendreEnRupture: !form.vendreEnRupture })}
                />
              </div>

              {stockExpanded && (
                <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-200">
                  <div>
                    <Label>SKU (unité de gestion de stock)</Label>
                    <input type="text" value={form.sku} onChange={e => set({ sku: e.target.value })} placeholder="SKU-001" className={`${Input} mt-1`} />
                  </div>
                  <div>
                    <Label>Code-barres (ISBN, UPC, GTIN, etc.)</Label>
                    <input type="text" value={form.codeBarres} onChange={e => set({ codeBarres: e.target.value })} placeholder="0123456789" className={`${Input} mt-1`} />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ─ Expédition ─ */}
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <Label>Expédition</Label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Produit physique</span>
                  <Toggle checked={form.produitPhysique} onChange={v => set({ produitPhysique: v })} />
                </label>
              </div>

              {form.produitPhysique && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Emballage */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label>Emballage</Label>
                      <button title="Type d'emballage utilisé pour ce produit"><Info className="w-3.5 h-3.5 text-gray-400" /></button>
                    </div>
                    <SelectField value={form.emballage} onChange={v => set({ emballage: v })}>
                      <option value="Par défaut de la boutique • Boîte d'échantillons">Par défaut de la boutique • Boîte d'échantillons</option>
                      <option value="Enveloppe">Enveloppe</option>
                      <option value="Boîte">Boîte</option>
                      <option value="Tube">Tube</option>
                    </SelectField>
                  </div>

                  {/* Poids */}
                  <div>
                    <Label>Poids du produit</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.poids}
                        onChange={e => set({ poids: e.target.value })}
                        className={`${Input} flex-1`}
                      />
                      <SelectField value={form.unitePoids} onChange={v => set({ unitePoids: v })} className="w-20">
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </SelectField>
                    </div>
                  </div>

                  {/* Pays + SH */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <TabBtn label="Pays d'origine" active={!!form.paysOrigine} onClick={() => setExpeditionExpanded(!expeditionExpanded)} />
                    <TabBtn label="Code SH" active={!!form.codeSH} onClick={() => setExpeditionExpanded(!expeditionExpanded)} />
                  </div>

                  {expeditionExpanded && (
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-200">
                      <div>
                        <Label>Pays d'origine</Label>
                        <input type="text" value={form.paysOrigine} onChange={e => set({ paysOrigine: e.target.value })} placeholder="Ex: Côte d'Ivoire" className={`${Input} mt-1`} />
                      </div>
                      <div>
                        <Label>Code SH</Label>
                        <input type="text" value={form.codeSH} onChange={e => set({ codeSH: e.target.value })} placeholder="Ex: 6109.10" className={`${Input} mt-1`} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* ─ Variantes ─ */}
          <Card>
            <div className="p-5">
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setVariantesOpen(!variantesOpen)}
              >
                <Label>Variantes</Label>
                {variantesOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {!variantesOpen && (
                <button
                  onClick={() => setVariantesOpen(true)}
                  className="mt-3 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter des options comme la taille ou la couleur
                </button>
              )}
              {variantesOpen && (
                <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                  {[
                    { label: 'Taille', placeholder: 'S, M, L, XL' },
                    { label: 'Couleur', placeholder: 'Noir, Blanc, Bleu' },
                    { label: 'Matière', placeholder: 'Coton, Polyester' },
                  ].map(opt => (
                    <div key={opt.label} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input type="text" placeholder={opt.label} className={Input} />
                      </div>
                      <div className="flex-[2]">
                        <input type="text" placeholder={opt.placeholder} className={Input} />
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium mt-2">
                    <Plus className="w-3.5 h-3.5" /> Ajouter une option
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* ─ Champs méta ─ */}
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <Label>Champs méta de produit</Label>
                <button
                  onClick={() => setChampsMeta(!champsMeta)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Ajouter une définition
                </button>
              </div>
              {champsMeta && (
                <div className="mt-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-1.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-100 transition-colors">
                      <Plus className="w-3 h-3" /> Mentions obligatoires
                    </button>
                  </div>
                </div>
              )}
              {!champsMeta && (
                <button
                  onClick={() => setChampsMeta(true)}
                  className="mt-3 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Mentions obligatoires
                </button>
              )}
            </div>
          </Card>

          {/* ─ SEO ─ */}
          <Card>
            <div className="p-5">
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setSeoOpen(!seoOpen)}
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Label>Aperçu sur les moteurs de recherche</Label>
                </div>
                <Pencil className="w-4 h-4 text-gray-400 hover:text-indigo-500 transition-colors" />
              </button>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
                {form.seoTitre || form.seoDescription
                  ? <span className="text-gray-700 dark:text-gray-300">{form.seoTitre || form.titre}</span>
                  : 'Ajoutez un titre et une description pour voir comment ce/cette produit pourrait apparaître dans un aperçu sur les moteurs de recherche.'
                }
              </p>

              {seoOpen && (
                <div className="mt-4 space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-200">
                  <div>
                    <Label>Titre de la page</Label>
                    <input type="text" value={form.seoTitre} onChange={e => set({ seoTitre: e.target.value })} placeholder={form.titre || 'Titre SEO'} className={`${Input} mt-1`} />
                    <p className="text-[11px] text-gray-400 mt-1">{form.seoTitre.length} / 70 caractères</p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <textarea
                      value={form.seoDescription}
                      onChange={e => set({ seoDescription: e.target.value })}
                      placeholder="Description pour les moteurs de recherche..."
                      rows={3}
                      className="mt-1 w-full px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 resize-none transition-all"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">{form.seoDescription.length} / 160 caractères</p>
                  </div>
                  <div>
                    <Label>URL et handle</Label>
                    <input type="text" value={form.seoUrl} onChange={e => set({ seoUrl: e.target.value })} placeholder={form.titre.toLowerCase().replace(/\s+/g, '-') || 'mon-produit'} className={`${Input} mt-1`} />
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="space-y-4">

          {/* Statut */}
          <Card>
            <div className="p-5">
              <Label>Statut</Label>
              <SelectField
                value={form.statut}
                onChange={v => set({ statut: v as StatusType })}
                className="mt-1"
                style={{ color: form.statut === 'Actif' ? '#059669' : form.statut === 'Brouillon' ? '#6b7280' : '#d97706' }}
              >
                <option value="Actif">Actif</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Archivé">Archivé</option>
              </SelectField>
            </div>
          </Card>

          {/* Publication */}
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Label>Publication</Label>
                <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Tous les canaux</span>
              </div>
            </div>
          </Card>

          {/* Organisation */}
          <Card>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Label>Organisation du produit</Label>
                <button title="Classification interne du produit"><Info className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <SmLabel>Type</SmLabel>
                  <SelectField value={form.type} onChange={v => set({ type: v })}>
                    <option>Aucun</option>
                    <option>Physique</option>
                    <option>Numérique</option>
                    <option>Service</option>
                  </SelectField>
                </div>
                <div>
                  <SmLabel>Fournisseur</SmLabel>
                  <SelectField value={form.fournisseur} onChange={v => set({ fournisseur: v })}>
                    <option>Aucun</option>
                    <option>Fournisseur A</option>
                    <option>Fournisseur B</option>
                  </SelectField>
                </div>
                <div>
                  <SmLabel>Collections</SmLabel>
                  <div className="min-h-[42px] px-3.5 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 flex flex-wrap items-center gap-1.5">
                    {form.collections.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-medium">
                        {c}<button onClick={() => set({ collections: form.collections.filter(x => x !== c) })}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <button
                      onClick={() => { const v = prompt('Nom :'); if (v?.trim()) set({ collections: [...form.collections, v.trim()] }) }}
                      className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter collections
                    </button>
                  </div>
                </div>
                <div>
                  <SmLabel>Balises</SmLabel>
                  <div className="min-h-[42px] px-3.5 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 flex flex-wrap items-center gap-1.5">
                    {form.balises.map(b => (
                      <span key={b} className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-medium">
                        <Tag className="w-2.5 h-2.5" />{b}<button onClick={() => set({ balises: form.balises.filter(x => x !== b) })}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newBalise}
                      onChange={e => setNewBalise(e.target.value)}
                      onKeyDown={addBalise}
                      placeholder="Ajouter balises"
                      className="text-xs flex-1 min-w-[80px] outline-none bg-transparent text-gray-600 dark:text-gray-400 placeholder-indigo-400"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Appuyez sur Entrée pour ajouter</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Modèle de thème */}
          <Card>
            <div className="p-5">
              <Label>Modèle de thème</Label>
              <SelectField value={form.modeleTheme} onChange={v => set({ modeleTheme: v })} className="mt-1">
                <option>Modèle par défaut : Produit</option>
                <option>Produit Premium</option>
                <option>Produit Minimaliste</option>
                <option>Produit Beauté</option>
              </SelectField>
            </div>
          </Card>

        </div>
      </div>

      {/* ─── Bottom floating save bar (mobile) — same logic ─── */}
      {hasChanges && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-5 py-3 flex gap-3 shadow-2xl z-10 animate-in slide-in-from-bottom-4 duration-200">
          <button onClick={handleDiscard} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving || !form.titre.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────

const Input = 'w-full px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all placeholder-gray-400'

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">{children}</div>
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{children}</label>
}

function SmLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{children}</label>
}

function SelectField({ value, onChange, children, className = '', placeholder, style }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string; placeholder?: string; style?: React.CSSProperties
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={style}
        className={`w-full appearance-none px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 cursor-pointer transition-all ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${active
        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
        : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 hover:text-gray-700'}`}
    >
      {label}
    </button>
  )
}


