'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Monitor, Smartphone, Save, Rocket, Check, Copy, ExternalLink, Globe, Eye, EyeOff } from 'lucide-react'
import { Browser } from '@capacitor/browser'

interface ToolbarProps {
  storeName: string
  storeId: string
  storeSlug?: string
  storeStatus?: string
  previewMode: 'desktop' | 'mobile'
  onPreviewModeChange: (mode: 'desktop' | 'mobile') => void
  onSave: () => void
  saving: boolean
  saved: boolean
  /** Appelé quand l'utilisateur clique sur Publier/Mettre en pause / Dépublier */
  onPublish?: (nextStatus: 'published' | 'paused' | 'draft') => Promise<void> | void
}

export default function Toolbar({
  storeName,
  storeId,
  storeSlug,
  storeStatus = 'draft',
  previewMode,
  onPreviewModeChange,
  onSave,
  saving,
  saved,
  onPublish,
}: ToolbarProps) {
  const [publishing, setPublishing] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)

  const isPublished = storeStatus === 'published'
  const shareUrl = typeof window !== 'undefined' && storeSlug
    ? `${window.location.origin}/s/${storeSlug}`
    : `/s/${storeSlug || ''}`

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await onPublish?.('published')
      setShowShare(true)
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!confirm("Voulez-vous vraiment dépublier cette page ? Elle ne sera plus accessible au public.")) return
    setPublishing(true)
    try {
      await onPublish?.('draft')
    } finally {
      setPublishing(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleOpenStore = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await Browser.open({ url: shareUrl })
    } catch (err) {
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <>
      <div className="h-[52px] w-full bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-4 flex-shrink-0 z-20 gap-2">

        {/* Left */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link href="/boutiques" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Pages</span>
          </Link>
          <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
          <span className="text-sm font-semibold text-gray-500 truncate">
            {storeName}
          </span>
          {/* Voyant de statut */}
          <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
            isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isPublished ? 'En ligne' : 'Brouillon'}
          </span>
        </div>

        {/* Center - View Toggles (desktop only) */}
        <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-lg flex-shrink-0">
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              previewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => onPreviewModeChange('mobile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              previewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Toggle mobile/desktop pour petits écrans */}
          <div className="flex md:hidden items-center bg-gray-100 p-1 rounded-lg">
            <button onClick={() => onPreviewModeChange('desktop')} className={`p-1.5 rounded-md ${previewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <Monitor size={14} />
            </button>
            <button onClick={() => onPreviewModeChange('mobile')} className={`p-1.5 rounded-md ${previewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <Smartphone size={14} />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${saved ? 'bg-green-500' : 'bg-orange-500'}`}></span>
            <span className={saved ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
              {saved ? '✓ Sauvegardé' : '● Non sauvegardé'}
            </span>
          </div>

          <button
            onClick={onSave}
            disabled={saving || saved}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            <span className="hidden md:inline">{saving ? 'Enregistrement...' : saved ? 'Enregistré' : 'Enregistrer'}</span>
          </button>

          {/* Bouton APERÇU (lien privé) */}
          <button
            onClick={() => window.open(`${shareUrl}?preview=true`, '_blank')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye size={16} />
            <span className="hidden md:inline">Aperçu</span>
          </button>

          {/* Boutons PUBLIER / DÉPUBLIER / VOIR */}
          {isPublished ? (
            <div className="flex items-center gap-1 bg-green-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-white text-sm font-bold hover:bg-green-700 transition-colors"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">Lien public</span>
              </button>
              <button
                onClick={handleUnpublish}
                disabled={publishing}
                title="Dépublier"
                className="px-2 py-1.5 text-white hover:bg-green-700 transition-colors border-l border-green-500 disabled:opacity-50"
              >
                <EyeOff size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Rocket size={16} />
              <span className="hidden sm:inline">{publishing ? 'Action...' : 'Publier'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MODALE DE PARTAGE ── */}
      {showShare && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-900">Page en ligne ! 🎉</h3>
                <p className="text-sm text-gray-500">Partage ce lien pour recevoir des commandes.</p>
              </div>
            </div>

            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lien de la page</label>
            <div className="flex items-center gap-2 mb-4">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono outline-none"
              />
              <button
                onClick={copyLink}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                title="Copier"
              >
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={shareUrl}
                onClick={handleOpenStore}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={16} /> Ouvrir la page
              </a>
              <button
                onClick={() => setShowShare(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
