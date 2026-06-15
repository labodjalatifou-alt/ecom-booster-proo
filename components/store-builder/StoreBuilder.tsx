'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  BuilderPage,
  BuilderSection,
  SectionType,
  StoreSettings,
  StoreType,
} from '@/lib/store-builder/types'
import {
  DEFAULT_COLORS,
  DEFAULT_FONTS,
  SECTIONS_CATALOG,
  THEMES,
  generateSectionId,
} from '@/lib/store-builder/defaults'
import SectionPanel from './SectionPanel'
import PropertiesPanel from './PropertiesPanel'
import SectionRenderer from './SectionRenderer'
import {
  Monitor,
  Smartphone,
  Save,
  Globe,
  Loader2,
  Cloud,
  CloudOff,
  ExternalLink,
} from 'lucide-react'

interface StoreBuilderProps {
  store: StoreType
  initialPage: BuilderPage | null
  initialSettings: StoreSettings | null
  onSave: (builderPage: BuilderPage, settings: StoreSettings, publish?: boolean) => Promise<void>
}

function createSection(type: SectionType): BuilderSection {
  const catalogItem = SECTIONS_CATALOG.find(item => item.type === type)
  return {
    id: generateSectionId(type),
    type,
    visible: true,
    props: catalogItem?.defaultProps ?? ({} as any),
  }
}

function buildInitialSections(initialPage: BuilderPage | null) {
  if (initialPage?.sections?.length) return initialPage.sections
  return [
    createSection('hero'),
    createSection('benefits'),
    createSection('order_form'),
    createSection('footer'),
  ]
}

export default function StoreBuilder({ store, initialPage, initialSettings, onSave }: StoreBuilderProps) {
  const initialSections = useMemo(() => buildInitialSections(initialPage), [initialPage])
  const [sections, setSections] = useState<BuilderSection[]>(initialSections)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(initialSections[0]?.id ?? null)
  const [settings, setSettings] = useState<StoreSettings>(
    initialSettings ?? {
      id: '',
      store_id: store.id,
      theme_id: THEMES[0].id,
      colors: DEFAULT_COLORS,
      fonts: DEFAULT_FONTS,
      pixels: { meta: '', tiktok: '', google: '' },
      custom_css: '',
      updated_at: '',
    }
  )
  const [activeTab, setActiveTab] = useState<'sections' | 'design' | 'settings'>('sections')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Keep refs for auto-save
  const sectionsRef = useRef(sections)
  const settingsRef = useRef(settings)
  sectionsRef.current = sections
  settingsRef.current = settings
  const hasUnsavedRef = useRef(hasUnsavedChanges)
  hasUnsavedRef.current = hasUnsavedChanges

  // Sync from props
  useEffect(() => {
    setSections(buildInitialSections(initialPage))
  }, [initialPage])

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings)
  }, [initialSettings])

  // Track unsaved changes
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setHasUnsavedChanges(true)
  }, [sections, settings])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasUnsavedRef.current) return
      onSave({ sections: sectionsRef.current }, settingsRef.current, false)
        .then(() => {
          setHasUnsavedChanges(false)
          setSaveMessage('Sauvegarde automatique...')
          setTimeout(() => setSaveMessage(''), 2500)
        })
        .catch(() => {})
    }, 30_000)
    return () => clearInterval(interval)
  }, [onSave])

  const activeTheme = THEMES.find(t => t.id === settings.theme_id) ?? THEMES[0]
  const previewColors = { ...activeTheme.default_colors, ...settings.colors }
  const selectedSection = sections.find(s => s.id === activeSectionId) ?? null

  // Section operations
  const updateSectionProps = useCallback((sectionId: string, patch: Partial<BuilderSection['props']>) => {
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, props: { ...s.props, ...patch } as typeof s.props } : s)
    )
  }, [])

  const addSection = useCallback((type: SectionType) => {
    const newSection = createSection(type)
    setSections(prev => [...prev, newSection])
    setActiveSectionId(newSection.id)
  }, [])

  const removeSection = useCallback((sectionId: string) => {
    setSections(prev => {
      const next = prev.filter(s => s.id !== sectionId)
      if (activeSectionId === sectionId) setActiveSectionId(next[0]?.id ?? null)
      return next
    })
  }, [activeSectionId])

  const toggleVisibility = useCallback((sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s))
  }, [])

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId)
      if (idx === -1) return prev
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= prev.length) return prev
      const next = [...prev]
      const [item] = next.splice(idx, 1)
      next.splice(targetIdx, 0, item)
      return next
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  async function handleSave(publish = false) {
    setIsSaving(true)
    setSaveMessage('')
    try {
      await onSave({ sections }, settings, publish)
      setHasUnsavedChanges(false)
      setSaveMessage(publish ? '🎉 Boutique publiée !' : '✓ Enregistré')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch {
      setSaveMessage('❌ Erreur de sauvegarde')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Design panel
  function renderDesignPanel() {
    const colorFields: { key: keyof typeof settings.colors; label: string }[] = [
      { key: 'primary', label: 'Couleur primaire' },
      { key: 'secondary', label: 'Couleur secondaire' },
      { key: 'accent', label: 'Accent' },
      { key: 'bg', label: 'Fond' },
      { key: 'text', label: 'Texte' },
    ]
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Thème actif</p>
          <p className="font-semibold text-gray-900">{activeTheme.name}</p>
        </div>
        <div className="space-y-3">
          {colorFields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-600 flex-1">{label}</label>
              <input
                type="color"
                value={settings.colors[key] || '#000000'}
                onChange={e => updateSettings({ colors: { ...settings.colors, [key]: e.target.value } })}
                className="h-9 w-14 rounded-xl border border-gray-200 p-1 cursor-pointer"
              />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Polices</p>
          {['heading', 'body'].map(key => (
            <div key={key}>
              <label className="block text-sm text-gray-600 mb-1.5 capitalize">{key === 'heading' ? 'Titres' : 'Corps'}</label>
              <select
                value={settings.fonts[key as 'heading' | 'body']}
                onChange={e => updateSettings({ fonts: { ...settings.fonts, [key]: e.target.value } })}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-indigo-400"
              >
                {['Inter', 'Poppins', 'Playfair Display', 'Roboto', 'Montserrat', 'Raleway'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Settings panel
  function renderSettingsPanel() {
    const pixelFields: { key: keyof typeof settings.pixels; label: string; placeholder: string }[] = [
      { key: 'meta', label: 'Pixel Meta (Facebook)', placeholder: '1234567890' },
      { key: 'tiktok', label: 'Pixel TikTok', placeholder: 'ABCDE12345' },
      { key: 'google', label: 'Google Analytics (GA4)', placeholder: 'G-XXXXXXXXXX' },
    ]
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Tracking pixels</p>
          <div className="space-y-3">
            {pixelFields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={settings.pixels[key] || ''}
                  onChange={e => updateSettings({ pixels: { ...settings.pixels, [key]: e.target.value } })}
                  placeholder={placeholder}
                  className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-indigo-400 font-mono"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">CSS personnalisé</label>
          <textarea
            value={settings.custom_css || ''}
            onChange={e => updateSettings({ custom_css: e.target.value })}
            placeholder=".ma-classe { ... }"
            rows={6}
            className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-indigo-400 font-mono resize-none"
          />
        </div>
        <div className="rounded-xl bg-indigo-50 p-3">
          <p className="text-xs text-indigo-700 font-medium">URL publique :</p>
          <a
            href={`/s/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-700 font-mono underline break-all"
          >
            /s/{store.slug}
          </a>
        </div>
      </div>
    )
  }

  const sectionIdx = selectedSection ? sections.findIndex(s => s.id === selectedSection.id) : -1

  return (
    <div className="flex overflow-hidden bg-gray-100" style={{ height: 'calc(100vh - 112px)' }}>

      {/* ─── LEFT PANEL ───────────────────────────────────────── */}
      <aside
        className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
        style={{ width: 280 }}
      >
        {/* Store name */}
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Boutique</p>
          <p className="font-semibold text-gray-900 truncate mt-0.5">{store.name}</p>
          <span
            className="inline-flex items-center mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: store.status === 'published' ? '#10b98120' : '#f59e0b20',
              color: store.status === 'published' ? '#10b981' : '#f59e0b',
            }}
          >
            {store.status === 'published' ? '● Publié' : '● Brouillon'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          {[
            { key: 'sections', label: 'Sections' },
            { key: 'design', label: 'Design' },
            { key: 'settings', label: 'Paramètres' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="flex-1 py-3 text-xs font-semibold transition-colors"
              style={{
                color: activeTab === tab.key ? '#6366f1' : '#9ca3af',
                borderBottom: activeTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {activeTab === 'sections' && (
            <SectionPanel
              sections={sections}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
              onAddSection={addSection}
              onToggleVisibility={toggleVisibility}
              onRemoveSection={removeSection}
              onMoveSection={moveSection}
            />
          )}
          {activeTab === 'design' && renderDesignPanel()}
          {activeTab === 'settings' && renderSettingsPanel()}
        </div>
      </aside>

      {/* ─── CENTER — Canvas ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center gap-2 px-4 flex-shrink-0">
          {/* Device toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setPreviewMode('desktop')}
              title="Vue bureau"
              className="p-2 transition-colors"
              style={{
                backgroundColor: previewMode === 'desktop' ? '#6366f1' : 'transparent',
                color: previewMode === 'desktop' ? '#fff' : '#6b7280',
              }}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              title="Vue mobile (390px)"
              className="p-2 transition-colors"
              style={{
                backgroundColor: previewMode === 'mobile' ? '#6366f1' : 'transparent',
                color: previewMode === 'mobile' ? '#fff' : '#6b7280',
              }}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Status */}
          {saveMessage && (
            <span className="text-xs text-gray-500 ml-1">{saveMessage}</span>
          )}
          {!saveMessage && hasUnsavedChanges && !isSaving && (
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <CloudOff className="w-3 h-3" />
              Non sauvegardé
            </span>
          )}
          {!saveMessage && !hasUnsavedChanges && !isSaving && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <Cloud className="w-3 h-3" />
              Sauvegardé
            </span>
          )}

          <div className="flex-1" />

          {/* Actions */}
          <a
            href={`/s/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Aperçu
          </a>

          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Enregistrer
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50 transition-all"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 2px 8px #6366f140',
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            Publier
          </button>
        </div>

        {/* Canvas scroll area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div
            className="mx-auto bg-white shadow-2xl overflow-hidden transition-all duration-500"
            style={{
              maxWidth: previewMode === 'mobile' ? 390 : '100%',
              minHeight: 600,
              borderRadius: previewMode === 'mobile' ? 32 : 8,
              border: previewMode === 'mobile' ? '8px solid #1f2937' : 'none',
            }}
          >
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-300">
                <p className="text-base font-medium">Aucune section</p>
                <p className="text-sm mt-2">Ajoutez des sections depuis le panneau gauche</p>
              </div>
            ) : (
              sections.map(section => (
                <div
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className="relative cursor-pointer"
                  style={{
                    outline: activeSectionId === section.id
                      ? '2px solid #6366f1'
                      : 'none',
                    outlineOffset: -2,
                  }}
                >
                  {/* Label badge */}
                  {activeSectionId === section.id && (
                    <div
                      className="absolute top-2 left-2 z-20 text-white text-xs px-2.5 py-1 rounded-full font-semibold pointer-events-none capitalize"
                      style={{ backgroundColor: '#6366f1', boxShadow: '0 2px 8px #6366f160' }}
                    >
                      {section.type.replace(/_/g, ' ')}
                    </div>
                  )}

                  {/* Transparent click interceptor */}
                  <div className="absolute inset-0 z-10" />

                  {/* Section content */}
                  {section.visible ? (
                    <SectionRenderer
                      section={section}
                      colors={previewColors}
                      fonts={settings.fonts}
                    />
                  ) : (
                    <div className="py-5 px-6 text-center text-xs font-medium text-gray-400 bg-gray-50 border-y border-dashed border-gray-200">
                      Section masquée — {section.type.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ─── RIGHT PANEL — Properties ─────────────────────────── */}
      <aside
        className="flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto scrollbar-hide"
        style={{ width: 320 }}
      >
        <div className="p-4">
          <PropertiesPanel
            section={selectedSection}
            onUpdateSection={updateSectionProps}
            onToggleVisibility={toggleVisibility}
            onRemoveSection={removeSection}
            onMoveSection={moveSection}
            disableMoveUp={sectionIdx <= 0}
            disableMoveDown={sectionIdx === -1 || sectionIdx >= sections.length - 1}
          />
        </div>
      </aside>
    </div>
  )
}
