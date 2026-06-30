'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, PanelLeft, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Toolbar from './Toolbar'
import SidebarLeft from './SidebarLeft'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'
import { ensureOrderFormSettings } from '@/lib/store-builder/form-presets'

function hydrateEditorData(data: EditorData, products: any[] = [], productId: string | null): EditorData {
  const product = products.find(p => p.id === productId) || products[0]
  const unitPrice = product?.price ? Number(product.price) : 15000
  const currency = product?.currency || 'FCFA'

  const hydrateBlock = (block: EditorBlock): EditorBlock => {
    if (block.type !== 'OrderForm' && block.type !== 'order_form') return block
    return {
      ...block,
      settings: ensureOrderFormSettings(block.settings || {}, unitPrice, currency),
    }
  }

  const header = [...(data.header || [])]
  const hasHeader = header.some(b => b.type === 'Header' || b.type === 'header')
  if (!hasHeader) {
    header.unshift({
      id: `h-header-${Date.now()}`,
      type: 'Header',
      title: 'En-tête',
      hidden: false,
      settings: { logo_position: 'center', show_cart: true, show_search: false },
    })
  }

  return {
    ...data,
    header,
    template: (data.template || []).map(hydrateBlock),
  }
}

export interface EditorBlock {
  id: string
  type: string
  title: string
  hidden: boolean
  settings: Record<string, any>
}

export interface EditorData {
  header: EditorBlock[]
  template: EditorBlock[]
  footer: EditorBlock[]
  themeSettings?: Record<string, any>
  selectedProductId?: string | null
}

interface EditorProps {
  storeId: string
  storeName?: string
  storeSlug?: string
  storeStatus?: string
  initialData: EditorData
  products?: any[]
}

export default function Editor({ storeId, storeName, storeSlug, storeStatus = 'draft', initialData, products }: EditorProps) {
  const supabase = createClient()
  const initialProductId = initialData?.selectedProductId || (products && products.length > 0 ? products[0].id : null)
  const [data, setData] = useState<EditorData>(() => hydrateEditorData(initialData, products || [], initialProductId))
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'sections' | 'theme_settings'>('sections')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile')
  const [themeFocusMode, setThemeFocusMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [status, setStatus] = useState(storeStatus)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialProductId)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const brandingSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  // ── Mobile drawer state ──
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [propsPanelOpen, setPropsPanelOpen] = useState(false)

  // Initialiser les paramètres de thème si absents
  const [themeSettings, setThemeSettings] = useState<Record<string, any>>(initialData.themeSettings || {
    primaryColor: '#E8527A',
    secondaryColor: '#FFF8F3',
    backgroundColor: '#FFF8F3',
    textColor: '#3A2A2E',
    fontFamily: 'Plus Jakarta Sans',
    textSoftColor: '#7A6469',
    accentDeep: '#C23A5E',
    gold: '#C9A24B',
    border: '#F0D9D2',
    surface: '#FFFFFF',
  })

  // Trouver le bloc sélectionné dans toutes les zones
  const allBlocks = [...data.header, ...data.template, ...data.footer]
  const selectedBlock = allBlocks.find(b => b.id === selectedBlockId) || null
  const selectedProduct = products?.find(p => p.id === selectedProductId) || products?.[0] || null

  // Quand un bloc est sélectionné, ouvrir le panneau propriétés sur mobile
  useEffect(() => {
    if (selectedBlockId) setPropsPanelOpen(true)
  }, [selectedBlockId])

  // Marquer comme non sauvegardé à chaque changement
  useEffect(() => {
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      handleSave()
    }, 30000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [data, themeSettings, selectedProductId])

  // Sync logo thème → bloc Header (boutique publique)
  useEffect(() => {
    if (!themeSettings.logo_url?.trim()) return
    setData(prev => ({
      ...prev,
      header: prev.header.map(b =>
        (b.type === 'Header' || b.type === 'header')
          ? {
              ...b,
              settings: {
                ...b.settings,
                logo_image: themeSettings.logo_url,
                logo_height: themeSettings.logo_height ?? 40,
              },
            }
          : b
      ),
    }))
  }, [themeSettings.logo_url, themeSettings.logo_height])
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (brandingSaveTimer.current) clearTimeout(brandingSaveTimer.current)
    brandingSaveTimer.current = setTimeout(() => {
      handleSave()
    }, 800)
    return () => { if (brandingSaveTimer.current) clearTimeout(brandingSaveTimer.current) }
  }, [themeSettings.logo_url, themeSettings.favicon_url])

  // Sauvegarder dans Supabase
  async function handleSave() {
    setSaving(true)
    const dataToSave = { ...data, themeSettings, selectedProductId }
    
    try {
      const response = await fetch('/api/stores/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          builderJson: dataToSave,
        })
      })

      const result = await response.json()
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erreur inconnue')
      }

      setSaved(true)
      toast.success('Boutique sauvegardée avec succès !')
    } catch (err: any) {
      console.error('[Editor Save Error]:', err)
      toast.error(`Échec de la sauvegarde : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Publier / mettre en pause la boutique → met à jour stores.status
  // et store_pages.is_published. Sauvegarde aussi le builder au passage.
  const handlePublish = useCallback(async (nextStatus: 'published' | 'paused') => {
    setSaving(true)
    const dataToSave = { ...data, themeSettings, selectedProductId }
    
    try {
      const response = await fetch('/api/stores/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          builderJson: dataToSave,
          isPublished: nextStatus === 'published',
          status: nextStatus,
        })
      })

      const result = await response.json()
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erreur inconnue')
      }

      setStatus(nextStatus)
      setSaved(true)
      toast.success(nextStatus === 'published' ? 'Félicitations ! Votre boutique est en ligne.' : 'Boutique mise en pause.')
    } catch (err: any) {
      console.error('[Editor Publish Error]:', err)
      toast.error(`Échec de la publication : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }, [data, themeSettings, selectedProductId, storeId])

  // Mettre à jour les settings d'un bloc
  const updateBlockSettings = useCallback((blockId: string, newSettings: Record<string, any>) => {
    setData(prev => {
      const updateInList = (list: EditorBlock[]) =>
        list.map(b => b.id === blockId ? { ...b, settings: { ...b.settings, ...newSettings } } : b)
      return {
        header: updateInList(prev.header),
        template: updateInList(prev.template),
        footer: updateInList(prev.footer),
      }
    })
  }, [])

  // Toggle visibilité d'un bloc
  const toggleBlockVisibility = useCallback((blockId: string) => {
    setData(prev => {
      const toggle = (list: EditorBlock[]) =>
        list.map(b => b.id === blockId ? { ...b, hidden: !b.hidden } : b)
      return {
        header: toggle(prev.header),
        template: toggle(prev.template),
        footer: toggle(prev.footer),
      }
    })
  }, [])

  // Supprimer un bloc du template
  const deleteBlock = useCallback((blockId: string) => {
    setData(prev => ({
      ...prev,
      template: prev.template.filter(b => b.id !== blockId),
    }))
    setSelectedBlockId(null)
    setPropsPanelOpen(false)
  }, [])

  // Ajouter un bloc au template
  const addBlock = useCallback((type: string, title: string, defaultSettings: Record<string, any>) => {
    const newBlock: EditorBlock = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      hidden: false,
      settings: defaultSettings,
    }
    setData(prev => ({
      ...prev,
      template: [...prev.template, newBlock],
    }))
    setSelectedBlockId(newBlock.id)
  }, [])

  // Réordonner les blocs du template (avec garde-fou contre les index hors limites)
  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setData(prev => {
      const len = prev.template.length
      if (toIndex < 0 || toIndex >= len || fromIndex < 0 || fromIndex >= len) return prev
      const newTemplate = [...prev.template]
      const [moved] = newTemplate.splice(fromIndex, 1)
      newTemplate.splice(toIndex, 0, moved)
      return { ...prev, template: newTemplate }
    })
  }, [])

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#f1f2f4]">
      <Toolbar
        storeName={storeName || 'Ma Boutique'}
        storeId={storeId}
        storeSlug={storeSlug}
        storeStatus={status}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        onPublish={handlePublish}
      />
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* ── SIDEBAR GAUCHE ── masquée en mode "Personnaliser le thème" (style Shopify) ── */}
        {!themeFocusMode && (
          <div className="hidden md:block flex-shrink-0">
            <SidebarLeft
              data={data}
              selectedBlockId={selectedBlockId}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab)
                if (tab === 'theme_settings') setThemeFocusMode(true)
              }}
              onSelectBlock={(id) => { setSelectedBlockId(id); setSidebarOpen(false) }}
              onToggleVisibility={toggleBlockVisibility}
              onDeleteBlock={deleteBlock}
              onAddBlock={addBlock}
              onReorder={reorderBlocks}
              themeSettings={themeSettings}
              onUpdateThemeSettings={setThemeSettings}
              onClose={undefined}
            />
          </div>
        )}
        {/* Mode thème plein écran : panneau thème flottant à gauche */}
        {themeFocusMode && (
          <div className="hidden md:block flex-shrink-0 w-[320px] animate-drawer-left">
            <SidebarLeft
              data={data}
              selectedBlockId={selectedBlockId}
              activeTab="theme_settings"
              onTabChange={(tab) => {
                setActiveTab(tab)
                if (tab === 'sections') setThemeFocusMode(false)
              }}
              onSelectBlock={(id) => { setSelectedBlockId(id); setSidebarOpen(false) }}
              onToggleVisibility={toggleBlockVisibility}
              onDeleteBlock={deleteBlock}
              onAddBlock={addBlock}
              onReorder={reorderBlocks}
              themeSettings={themeSettings}
              onUpdateThemeSettings={setThemeSettings}
              onClose={() => { setThemeFocusMode(false); setActiveTab('sections') }}
              themeFocusMode
            />
          </div>
        )}
        {/* Mobile: overlay drawer (slide-in gauche avec backdrop fade) */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[300px] md:hidden animate-drawer-left">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
              <SidebarLeft
                data={data}
                selectedBlockId={selectedBlockId}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSelectBlock={(id) => { setSelectedBlockId(id); setSidebarOpen(false) }}
                onToggleVisibility={toggleBlockVisibility}
                onDeleteBlock={deleteBlock}
                onAddBlock={addBlock}
                onReorder={reorderBlocks}
                themeSettings={themeSettings}
                onUpdateThemeSettings={setThemeSettings}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* ── CANVAS (centre) ── */}
        <Canvas
          data={data}
          selectedBlockId={selectedBlockId}
          previewMode={previewMode}
          onSelectBlock={setSelectedBlockId}
          products={products}
          selectedProductId={selectedProductId}
          onProductChange={setSelectedProductId}
          themeSettings={themeSettings}
        />

        {/* ── PANNEAU PROPRIÉTÉS ── Desktop large: fixe | sinon: drawer overlay animé ── */}
        {selectedBlockId && (
          <>
            {/* Desktop large (xl+) : assez d'espace pour 3 colonnes */}
            <div className="hidden xl:block flex-shrink-0">
              <PropertiesPanel
                block={selectedBlock}
                onUpdateSettings={updateBlockSettings}
                onDelete={deleteBlock}
                selectedProduct={selectedProduct}
              />
            </div>
            {/* Mobile/tablet/desktop-petit: overlay drawer (sous xl) slide-in droite */}
            {propsPanelOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 xl:hidden transition-opacity duration-300"
                  onClick={() => setPropsPanelOpen(false)}
                />
                <div className="fixed inset-y-0 right-0 z-50 w-[300px] xl:hidden animate-drawer-right">
                  <PropertiesPanel
                    block={selectedBlock}
                    onUpdateSettings={updateBlockSettings}
                    onDelete={deleteBlock}
                    onClose={() => setPropsPanelOpen(false)}
                    selectedProduct={selectedProduct}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── BOUTONS FLOTTANTS ── pour ouvrir sidebar (mobile) / propriétés (sous xl) ── */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
        {selectedBlock && (
          <button
            onClick={() => setPropsPanelOpen(!propsPanelOpen)}
            className="xl:hidden w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            title="Propriétés"
          >
            <Settings2 size={20} />
          </button>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          title="Sections"
        >
          <PanelLeft size={20} />
        </button>
      </div>
    </div>
  )
}
