'use client'

import { useState } from 'react'
import { Eye, EyeOff, MoreVertical, Plus, Trash2, Edit3, X, Palette, LayoutTemplate, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import type { EditorData, EditorBlock } from './Editor'
import ColorField from './fields/ColorField'
import SelectField from './fields/SelectField'
import SliderField from './fields/SliderField'
import ImageUploadField from './fields/ImageUploadField'
import TextField from './fields/TextField'
import { STORE_THEMES } from '@/lib/store-builder/themes'
import { SECTIONS_CATALOG } from '@/lib/store-builder/defaults'

interface SidebarLeftProps {
  data: EditorData
  selectedBlockId: string | null
  activeTab: 'sections' | 'theme_settings'
  onTabChange: (tab: 'sections' | 'theme_settings') => void
  onSelectBlock: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDeleteBlock: (id: string) => void
  onAddBlock: (type: string, title: string, defaultSettings: Record<string, any>) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  themeSettings: Record<string, any>
  onUpdateThemeSettings: (settings: Record<string, any>) => void
  onClose?: () => void
  /** Mode Shopify : panneau thème seul, bouton retour */
  themeFocusMode?: boolean
}

// Dynamic catalog from defaults
const dynamicCatalog = SECTIONS_CATALOG.reduce((acc: any[], item) => {
  const cat = acc.find(c => c.title === item.category)
  const mappedItem = {
    type: item.type,
    title: item.label,
    icon: item.icon,
    description: item.description,
    defaultSettings: item.defaultProps || {}
  }
  if (cat) {
    cat.items.push(mappedItem)
  } else {
    acc.push({ title: item.category, items: [mappedItem] })
  }
  return acc
}, [] as { title: string, items: any[] }[])

export default function SidebarLeft({
  data,
  selectedBlockId,
  activeTab,
  onTabChange,
  onSelectBlock,
  onToggleVisibility,
  onDeleteBlock,
  onAddBlock,
  onReorder,
  themeSettings,
  onUpdateThemeSettings,
  onClose,
  themeFocusMode = false,
}: SidebarLeftProps) {
  const [showCatalog, setShowCatalog] = useState(false)
  const [contextMenuBlock, setContextMenuBlock] = useState<{ id: string, type: 'header' | 'template' | 'footer' } | null>(null)

  const updateTheme = (key: string, value: any) => onUpdateThemeSettings({ ...themeSettings, [key]: value })

  const BlockItem = ({ block, type, index }: { block: EditorBlock, type: 'header' | 'template' | 'footer', index?: number }) => {
    const isSelected = selectedBlockId === block.id
    const isMenuOpen = contextMenuBlock?.id === block.id

    return (
      <div 
        className={`relative flex items-center justify-between p-2 rounded-md mb-1 cursor-pointer group transition-colors ${
          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100 border border-transparent'
        }`}
        onClick={() => onSelectBlock(block.id)}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          {type === 'template' && index !== undefined && (
            <div className="flex flex-col flex-shrink-0">
              <button
                className="text-gray-300 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-gray-300 p-0 leading-none"
                disabled={index === 0}
                onClick={(e) => { e.stopPropagation(); onReorder(index, index - 1) }}
                title="Monter"
              >
                <ChevronUp size={15} />
              </button>
              <button
                className="text-gray-300 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-gray-300 p-0 leading-none"
                disabled={index === (data.template.length - 1)}
                onClick={(e) => { e.stopPropagation(); onReorder(index, index + 1) }}
                title="Descendre"
              >
                <ChevronDown size={15} />
              </button>
            </div>
          )}

          <button 
            className={`text-gray-400 hover:text-gray-700 p-1 ${block.hidden ? 'text-gray-300' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(block.id) }}
          >
            {block.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          
          <span className={`text-sm font-medium truncate ${block.hidden ? 'text-gray-400 line-through' : 'text-gray-700'} ${isSelected ? 'text-blue-700' : ''}`}>
            {block.title}
          </span>
        </div>

        <div className="relative">
          <button 
            className={`p-1 text-gray-400 hover:text-gray-800 rounded ${isMenuOpen || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation()
              setContextMenuBlock(isMenuOpen ? null : { id: block.id, type })
            }}
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setContextMenuBlock(null) }}></div>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1"
                onClick={(e) => e.stopPropagation()}>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => { onSelectBlock(block.id); setContextMenuBlock(null) }}
                >
                  <Edit3 size={14} /> Modifier
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => { onToggleVisibility(block.id); setContextMenuBlock(null) }}
                >
                  {block.hidden ? <Eye size={14} /> : <EyeOff size={14} />} {block.hidden ? 'Afficher' : 'Masquer'}
                </button>
                {type === 'template' && (
                  <>
                    <div className="h-px w-full bg-gray-100 my-1"></div>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => { onDeleteBlock(block.id); setContextMenuBlock(null) }}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full ${themeFocusMode ? 'w-[320px]' : 'w-[300px]'} flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden`}>
      <div className="flex flex-col h-full w-full min-w-0 relative">
        {/* Onglets en haut — un seul panneau, plus de double sidebar */}
        {!themeFocusMode && (
          <div className="flex border-b border-gray-100 shrink-0">
            <button
              onClick={() => onTabChange('sections')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-colors ${
                activeTab === 'sections' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LayoutTemplate size={15} /> Sections
            </button>
            <button
              onClick={() => onTabChange('theme_settings')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-colors ${
                activeTab === 'theme_settings' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Palette size={15} /> Thème
            </button>
          </div>
        )}

        <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
          <h2 className="font-bold text-xs uppercase tracking-wide text-gray-800 truncate">
            {themeFocusMode ? 'Personnaliser le thème' : activeTab === 'sections' ? 'Structure du site' : 'Couleurs & style'}
          </h2>
          {themeFocusMode && onClose && (
            <button onClick={onClose} className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap px-2 py-1 rounded-lg hover:bg-blue-50">
              ← Retour
            </button>
          )}
        </div>

        {activeTab === 'sections' && !themeFocusMode ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        
        {/* HEADER */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wide">En-tête</h3>
          <div>
            {data.header.map(block => (
              <BlockItem key={block.id} block={block} type="header" />
            ))}
          </div>
        </div>

        {/* TEMPLATE — Glisser-déposer réel */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wide flex items-center gap-1.5">
            <GripVertical size={12} /> Modèle (glisser pour réordonner)
          </h3>
          <DragDropContext onDragEnd={(result: DropResult) => {
            if (!result.destination || result.destination.index === result.source.index) return
            onReorder(result.source.index, result.destination.index)
          }}>
            <Droppable droppableId="template-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {data.template.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(drag, snap) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          style={{
                            ...drag.draggableProps.style,
                            marginBottom: 4,
                            boxShadow: snap.isDragging ? '0 8px 20px rgba(0,0,0,.15)' : 'none',
                            borderRadius: 6,
                          }}
                        >
                          {/* Poignée de glissement sur tout le BlockItem */}
                          <div {...drag.dragHandleProps} className="block">
                            <BlockItem block={block} type="template" index={index} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* FOOTER */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wide">Pied de page</h3>
          <div>
            {data.footer.map(block => (
              <BlockItem key={block.id} block={block} type="footer" />
            ))}
          </div>
        </div>

            </div>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => setShowCatalog(true)}
                className="w-full py-2.5 px-4 bg-gray-50 hover:bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-200 border-dashed"
              >
                <Plus size={16} />
                Ajouter une section
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-50/30">
            {/* ── Sélecteur de thème ── */}
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Thème prédéfini</h3>
            <div className="flex gap-2 mb-5 flex-wrap">
              {STORE_THEMES.map((theme) => {
                const isActive = themeSettings.primaryColor === theme.colors.accent
                return (
                  <button
                    key={theme.id}
                    title={theme.name}
                    onClick={() => onUpdateThemeSettings({
                      ...themeSettings,
                      primaryColor: theme.colors.accent,
                      secondaryColor: theme.colors.bg,
                      backgroundColor: theme.colors.bg,
                      textColor: theme.colors.text,
                      textSoftColor: theme.colors.text_soft,
                      accentDeep: theme.colors.accent_deep,
                      gold: theme.colors.gold,
                      border: theme.colors.border,
                      surface: theme.colors.surface,
                    })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      isActive ? 'border-current shadow-md' : 'border-transparent hover:border-gray-200'
                    }`}
                    style={{ borderColor: isActive ? theme.colors.accent : undefined }}
                  >
                    <span
                      className="w-8 h-8 rounded-full shadow-sm border-2 border-white"
                      style={{ backgroundColor: theme.preview_color }}
                    />
                    <span className="text-[10px] text-gray-600 font-medium leading-tight text-center max-w-[52px]">{theme.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="h-px w-full bg-gray-200 mb-5" />

            <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wide">Couleurs Globales</h3>
            <ColorField label="Couleur Principale" value={themeSettings.primaryColor} onChange={v => updateTheme('primaryColor', v)} />
            <ColorField label="Couleur Secondaire" value={themeSettings.secondaryColor} onChange={v => updateTheme('secondaryColor', v)} />
            <ColorField label="Arrière-plan" value={themeSettings.backgroundColor} onChange={v => updateTheme('backgroundColor', v)} />
            <ColorField label="Texte Principal" value={themeSettings.textColor} onChange={v => updateTheme('textColor', v)} />
            <ColorField label="Texte Doux" value={themeSettings.textSoftColor || '#7A6469'} onChange={v => updateTheme('textSoftColor', v)} />
            <ColorField label="Accent Profond" value={themeSettings.accentDeep || '#C23A5E'} onChange={v => updateTheme('accentDeep', v)} />
            <ColorField label="Or / Accent 2" value={themeSettings.gold || '#C9A24B'} onChange={v => updateTheme('gold', v)} />
            <ColorField label="Bordure" value={themeSettings.border || '#F0D9D2'} onChange={v => updateTheme('border', v)} />
            <ColorField label="Couleur des titres" value={themeSettings.headingColor || themeSettings.textColor} onChange={v => updateTheme('headingColor', v)} />
            <ColorField label="Couleur des prix" value={themeSettings.priceColor || themeSettings.primaryColor} onChange={v => updateTheme('priceColor', v)} />
            <ColorField label="Fond des sections" value={themeSettings.sectionBg || themeSettings.backgroundColor} onChange={v => updateTheme('sectionBg', v)} />

            <div className="h-px w-full bg-gray-200 my-5" />
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">📄 Grande feuille (fond page)</h3>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">La couleur autour de la boutique — l&apos;arrière-plan extérieur.</p>
            <ColorField label="Arrière-plan extérieur" value={themeSettings.backgroundColor} onChange={v => updateTheme('backgroundColor', v)} />

            <div className="h-px w-full bg-gray-200 my-5" />
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">📋 Petite feuille (carte centrale)</h3>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">La feuille blanche au centre où se trouve tout le contenu.</p>
            <ColorField label="Fond carte" value={themeSettings.surface || '#FFFFFF'} onChange={v => updateTheme('surface', v)} />
            <ColorField label="Couleur bordure carte" value={themeSettings.cardBorderColor || themeSettings.border} onChange={v => updateTheme('cardBorderColor', v)} />
            <SelectField label="Style bordure carte" value={themeSettings.cardBorderStyle || 'solid'} options={['solid', 'dashed', 'dotted', 'double']} onChange={v => updateTheme('cardBorderStyle', v)} />
            <SliderField label="Épaisseur bordure (px)" value={themeSettings.cardBorderWidth ?? 1} onChange={v => updateTheme('cardBorderWidth', v)} min={0} max={8} />
            <SliderField label="Arrondi carte (px)" value={themeSettings.cardBorderRadius ?? 0} onChange={v => updateTheme('cardBorderRadius', v)} min={0} max={32} />
            <SliderField label="Largeur max carte (px)" value={themeSettings.cardMaxWidth ?? 1100} onChange={v => updateTheme('cardMaxWidth', v)} min={600} max={1400} />

            <div className="h-px w-full bg-gray-200 my-5" />
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">🏷️ Logo & Favicon</h3>
            <ImageUploadField label="Logo boutique" value={themeSettings.logo_url} onChange={v => updateTheme('logo_url', v)} />
            <SliderField label="Hauteur logo (px)" value={themeSettings.logo_height ?? 40} onChange={v => updateTheme('logo_height', v)} min={24} max={80} />
            <ImageUploadField label="Favicon (onglet navigateur)" value={themeSettings.favicon_url} onChange={v => updateTheme('favicon_url', v)} />
            <p className="text-[10px] text-gray-400 mb-4">Sauvegarde automatique après upload. Ouvre la boutique en navigation privée pour voir le favicon.</p>

            <div className="h-px w-full bg-gray-200 my-5" />
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">📊 Facebook Pixel</h3>
            <TextField label="Pixel ID Meta" value={themeSettings.meta_pixel_id || ''} onChange={v => updateTheme('meta_pixel_id', v)} />
            <p className="text-[10px] text-gray-400 mb-4">Traque PageView, Lead et achats sur la boutique publique.</p>

            <div className="h-px w-full bg-gray-200 my-5" />
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">💬 Bouton WhatsApp</h3>
            <TextField label="Numéro WhatsApp" value={themeSettings.whatsapp_number || ''} onChange={v => updateTheme('whatsapp_number', v)} />
            <p className="text-[10px] text-gray-400 mb-2">Ex: +2250102030405</p>
            <SelectField label="Afficher le bouton ?" value={themeSettings.show_whatsapp !== false ? 'Oui' : 'Non'} options={['Oui', 'Non']} onChange={v => updateTheme('show_whatsapp', v === 'Oui')} />
            
            <div className="h-px w-full bg-gray-200 my-6" />
            
            <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wide">Typographie</h3>
            <SelectField 
              label="Police Principale" 
              value={themeSettings.fontFamily} 
              options={['Plus Jakarta Sans', 'Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Poppins', 'Fraunces']} 
              onChange={v => updateTheme('fontFamily', v)} 
            />
          </div>
        )}

      {/* CATALOG — overlay plein panneau, caché proprement */}
      {showCatalog && (
        <>
          <div className="absolute inset-0 bg-black/20 z-20" onClick={() => setShowCatalog(false)} />
          <div className="absolute inset-0 bg-white z-30 flex flex-col animate-drawer-left">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="font-bold text-sm text-gray-800">Catalogue de sections</h2>
              <button onClick={() => setShowCatalog(false)} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 min-h-0">
              {dynamicCatalog.map((category, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">{category.title}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {category.items.map((item: any, itemIdx: number) => (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          onAddBlock(item.type, item.title, item.defaultSettings)
                          setShowCatalog(false)
                        }}
                        className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 hover:shadow transition-all group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 block mb-0.5">{item.icon} {item.title}</span>
                        <span className="text-xs text-gray-400 block truncate">{item.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
