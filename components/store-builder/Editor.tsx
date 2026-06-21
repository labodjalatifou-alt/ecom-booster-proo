'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toolbar from './Toolbar'
import SidebarLeft from './SidebarLeft'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'

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
}

interface EditorProps {
  storeId: string
  storeName?: string
  initialData: EditorData
}

export default function Editor({ storeId, storeName, initialData }: EditorProps) {
  const supabase = createClient()
  const [data, setData] = useState<EditorData>(initialData)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const saveTimer = useRef<NodeJS.Timeout>()

  // Trouver le bloc sélectionné dans toutes les zones
  const allBlocks = [...data.header, ...data.template, ...data.footer]
  const selectedBlock = allBlocks.find(b => b.id === selectedBlockId) || null

  // Marquer comme non sauvegardé à chaque changement
  useEffect(() => {
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      handleSave()
    }, 30000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [data])

  // Sauvegarder dans Supabase
  async function handleSave() {
    setSaving(true)
    await supabase
      .from('store_pages')
      .update({ builder_json: data, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .eq('slug', 'home')
    setSaving(false)
    setSaved(true)
  }

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

  // Réordonner les blocs du template
  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setData(prev => {
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
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onSave={handleSave}
        saving={saving}
        saved={saved}
      />
      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft
          data={data}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onToggleVisibility={toggleBlockVisibility}
          onDeleteBlock={deleteBlock}
          onAddBlock={addBlock}
          onReorder={reorderBlocks}
        />
        <Canvas
          data={data}
          selectedBlockId={selectedBlockId}
          previewMode={previewMode}
          onSelectBlock={setSelectedBlockId}
        />
        <PropertiesPanel
          block={selectedBlock}
          onUpdateSettings={updateBlockSettings}
          onDelete={deleteBlock}
        />
      </div>
    </div>
  )
}
