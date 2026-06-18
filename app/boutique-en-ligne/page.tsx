'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  ImageIcon,
  Table,
  MoreHorizontal,
  Code,
  Upload,
  FolderOpen,
  ChevronDown,
  X,
  Plus,
  Save,
  Globe,
  Tag,
  Loader2,
} from 'lucide-react'

type StatusType = 'Actif' | 'Brouillon' | 'Archivé'

export default function BoutiqueEnLignePage() {
  const router = useRouter()

  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [statut, setStatut] = useState<StatusType>('Actif')
  const [type, setType] = useState('Aucun')
  const [fournisseur, setFournisseur] = useState('Aucun')
  const [categorie, setCategorie] = useState('')
  const [collections, setCollections] = useState<string[]>([])
  const [balises, setBalises] = useState<string[]>([])
  const [newBalise, setNewBalise] = useState('')
  const [modeleTheme, setModeleTheme] = useState('Modèle par défaut : Produit')
  const [medias, setMedias] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const handleMediaUpload = useCallback((files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setMedias(prev => [...prev, ...newFiles])
    setMediaPreviews(prev => [...prev, ...newPreviews])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleMediaUpload(e.dataTransfer.files)
  }, [handleMediaUpload])

  const removeMedia = (idx: number) => {
    setMedias(prev => prev.filter((_, i) => i !== idx))
    setMediaPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const addBalise = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && newBalise.trim()) {
      e.preventDefault()
      setBalises(prev => [...prev, newBalise.trim()])
      setNewBalise('')
    }
  }

  const removeBalise = (tag: string) => {
    setBalises(prev => prev.filter(b => b !== tag))
  }

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
  }

  const handleSave = async () => {
    if (!titre.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#f1f1f1] dark:bg-slate-950">

      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-20 bg-[#1a1a1a] text-white flex items-center gap-3 px-5 py-3 shadow-xl">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="hover:text-white cursor-pointer transition-colors">Produits</span>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium">
            {titre.trim() ? titre : 'Produit non enregistré'}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !titre.trim()}
            className="flex items-center gap-2 px-5 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-emerald-900/30"
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...</>
            ) : saved ? (
              <><Save className="w-3.5 h-3.5" /> Enregistré !</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> Enregistrer</>
            )}
          </button>
        </div>
      </div>

      {/* ─── Page Header ─── */}
      <div className="max-w-6xl mx-auto px-5 pt-7 pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span
            onClick={() => router.back()}
            className="cursor-pointer hover:text-indigo-600 transition-colors"
          >
            Produits
          </span>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">Ajouter un produit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajouter un produit</h1>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="max-w-6xl mx-auto px-5 py-5 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="space-y-4">

          {/* — Titre + Description — */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Titre */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                placeholder="T-shirt à manches courtes"
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all placeholder-gray-400"
              />
            </div>

            {/* Description */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-0.5 p-1.5 border border-gray-200 dark:border-slate-600 border-b-0 rounded-t-lg bg-gray-50 dark:bg-slate-800">
                {/* Formatting */}
                <div className="flex items-center">
                  <ToolbarBtn icon={<span className="text-xs font-bold font-serif">¶</span>} tooltip="Paragraphe" />
                  <select
                    onChange={e => execCmd('formatBlock', e.target.value)}
                    className="text-xs border-none bg-transparent text-gray-600 dark:text-gray-300 outline-none cursor-pointer px-1 py-1"
                  >
                    <option value="p">Paragraphe</option>
                    <option value="h1">Titre 1</option>
                    <option value="h2">Titre 2</option>
                    <option value="h3">Titre 3</option>
                    <option value="blockquote">Citation</option>
                  </select>
                </div>
                <Divider />
                <ToolbarBtn icon={<Bold className="w-3.5 h-3.5" />} tooltip="Gras" onClick={() => execCmd('bold')} />
                <ToolbarBtn icon={<Italic className="w-3.5 h-3.5" />} tooltip="Italique" onClick={() => execCmd('italic')} />
                <ToolbarBtn icon={<Underline className="w-3.5 h-3.5" />} tooltip="Souligné" onClick={() => execCmd('underline')} />
                <ToolbarBtn icon={<span className="text-xs font-bold">S̶</span>} tooltip="Barré" onClick={() => execCmd('strikeThrough')} />
                <ToolbarBtn
                  icon={<span className="text-xs font-bold" style={{color: '#e11d48'}}>A</span>}
                  tooltip="Couleur du texte"
                />
                <Divider />
                <ToolbarBtn icon={<AlignLeft className="w-3.5 h-3.5" />} tooltip="Aligner à gauche" onClick={() => execCmd('justifyLeft')} />
                <ToolbarBtn icon={<AlignCenter className="w-3.5 h-3.5" />} tooltip="Centrer" onClick={() => execCmd('justifyCenter')} />
                <ToolbarBtn icon={<AlignRight className="w-3.5 h-3.5" />} tooltip="Aligner à droite" onClick={() => execCmd('justifyRight')} />
                <ToolbarBtn icon={<AlignJustify className="w-3.5 h-3.5" />} tooltip="Justifier" onClick={() => execCmd('justifyFull')} />
                <Divider />
                <ToolbarBtn icon={<Link2 className="w-3.5 h-3.5" />} tooltip="Lien" onClick={() => {
                  const url = prompt('URL du lien :')
                  if (url) execCmd('createLink', url)
                }} />
                <ToolbarBtn icon={<ImageIcon className="w-3.5 h-3.5" />} tooltip="Image" />
                <ToolbarBtn icon={<Table className="w-3.5 h-3.5" />} tooltip="Tableau" />
                <ToolbarBtn icon={<MoreHorizontal className="w-3.5 h-3.5" />} tooltip="Plus" />
                <Divider />
                <ToolbarBtn icon={<Code className="w-3.5 h-3.5" />} tooltip="Code source" />
              </div>

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e => setDescription((e.target as HTMLDivElement).innerHTML)}
                data-placeholder="Décrivez votre produit..."
                className="min-h-[160px] p-3.5 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-b-lg outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all leading-relaxed prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
                style={{ minHeight: 160 }}
              />
            </div>
          </div>

          {/* — Supports multimédias — */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Supports multimédias
            </h2>

            {/* Previews */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                {mediaPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[9px] font-bold text-center py-0.5">
                        PRINCIPALE
                      </div>
                    )}
                  </div>
                ))}
                {/* Add more */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-indigo-500 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Ajouter</span>
                </button>
              </div>
            )}

            {/* Drop Zone */}
            {mediaPreviews.length === 0 && (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Importer
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Sélectionner un fichier existant
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Accepte les images, les vidéos ou les modèles 3D
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={e => handleMediaUpload(e.target.files)}
            />
          </div>

          {/* — Catégorie — */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Catégorie
            </label>
            <div className="relative">
              <select
                value={categorie}
                onChange={e => setCategorie(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 cursor-pointer transition-all"
              >
                <option value="">Choisir une catégorie de produits</option>
                <option value="beaute">Beauté &amp; Cosmétiques</option>
                <option value="hightech">High-Tech &amp; Électronique</option>
                <option value="mode">Mode &amp; Vêtements</option>
                <option value="maison">Maison &amp; Décoration</option>
                <option value="sport">Sport &amp; Fitness</option>
                <option value="sante">Santé &amp; Bien-être</option>
                <option value="enfants">Enfants &amp; Jouets</option>
                <option value="alimentation">Alimentation</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
              Détermine les taux de taxation et ajoute des champs méta pour améliorer la recherche, les filtres et les ventes intercanaux.
            </p>
          </div>

        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="space-y-4">

          {/* — Statut — */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <div className="relative">
              <select
                value={statut}
                onChange={e => setStatut(e.target.value as StatusType)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 cursor-pointer transition-all"
                style={{
                  color: statut === 'Actif' ? '#059669' : statut === 'Brouillon' ? '#6b7280' : '#d97706'
                }}
              >
                <option value="Actif">Actif</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Archivé">Archivé</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* — Publication — */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Publication</h2>
              <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Tous les canaux</span>
            </div>
          </div>

          {/* — Organisation du produit — */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Organisation du produit
              </h2>
              <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Type</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 cursor-pointer transition-all"
                  >
                    <option value="Aucun">Aucun</option>
                    <option value="Physique">Physique</option>
                    <option value="Numérique">Numérique</option>
                    <option value="Service">Service</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Fournisseur */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Fournisseur</label>
                <div className="relative">
                  <select
                    value={fournisseur}
                    onChange={e => setFournisseur(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 cursor-pointer transition-all"
                  >
                    <option value="Aucun">Aucun</option>
                    <option value="Fournisseur A">Fournisseur A</option>
                    <option value="Fournisseur B">Fournisseur B</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Collections */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Collections</label>
                <div className="min-h-[42px] px-3.5 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 flex flex-wrap items-center gap-1.5">
                  {collections.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-medium">
                      {c}
                      <button onClick={() => setCollections(prev => prev.filter(x => x !== c))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const val = prompt('Nom de la collection :')
                      if (val?.trim()) setCollections(prev => [...prev, val.trim()])
                    }}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter collections
                  </button>
                </div>
              </div>

              {/* Balises */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Balises</label>
                <div className="min-h-[42px] px-3.5 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 flex flex-wrap items-center gap-1.5">
                  {balises.map(b => (
                    <span key={b} className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-medium">
                      <Tag className="w-2.5 h-2.5" />
                      {b}
                      <button onClick={() => removeBalise(b)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newBalise}
                    onChange={e => setNewBalise(e.target.value)}
                    onKeyDown={addBalise}
                    placeholder="Ajouter balises"
                    className="text-xs flex-1 min-w-[80px] outline-none bg-transparent text-gray-600 dark:text-gray-400 placeholder-indigo-400 dark:placeholder-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Appuyez sur Entrée pour ajouter une balise</p>
              </div>
            </div>
          </div>

          {/* — Modèle de thème — */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Modèle de thème
            </label>
            <div className="relative">
              <select
                value={modeleTheme}
                onChange={e => setModeleTheme(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 cursor-pointer transition-all"
              >
                <option value="Modèle par défaut : Produit">Modèle par défaut : Produit</option>
                <option value="Produit Premium">Produit Premium</option>
                <option value="Produit Minimaliste">Produit Minimaliste</option>
                <option value="Produit Beauté">Produit Beauté</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* ─── Bottom Save Bar (mobile) ─── */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-5 py-3 flex gap-3 shadow-xl z-10">
        <button
          onClick={() => router.back()}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !titre.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

    </div>
  )
}

/* ─── Sub-components ─── */
function ToolbarBtn({
  icon,
  tooltip,
  onClick,
}: {
  icon: React.ReactNode
  tooltip: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={tooltip}
      onClick={onClick}
      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
    >
      {icon}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-slate-600 mx-0.5" />
}
