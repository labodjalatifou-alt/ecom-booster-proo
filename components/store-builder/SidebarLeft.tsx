'use client'

import { useState } from 'react'
import { Eye, EyeOff, MoreVertical, GripVertical, Plus, Trash2, Edit3, X } from 'lucide-react'
import type { EditorData, EditorBlock } from './Editor'

interface SidebarLeftProps {
  data: EditorData
  selectedBlockId: string | null
  onSelectBlock: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDeleteBlock: (id: string) => void
  onAddBlock: (type: string, title: string, defaultSettings: Record<string, any>) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

const CATALOG_CATEGORIES = [
  {
    title: '⏱️ Urgence & Marketing',
    items: [
      { type: 'countdown', title: 'Compte à rebours', defaultSettings: { title: "Offre expire dans", target_date: new Date(Date.now() + 86400000).toISOString(), bg_color: "#1e1b4b", text_color: "#ffffff", accent_color: "#ef4444" } },
      { type: 'marquee', title: 'Barre défilante', defaultSettings: { text: "⭐ Livraison gratuite ⭐", bg_color: "#000000", text_color: "#ffffff", speed: 30 } },
      { type: 'stats', title: 'Statistiques', defaultSettings: { items: [{id:'1', number: 2000, suffix: '+', label: 'Clients satisfaits', icon: '😊'}, {id:'2', number: 98, suffix: '%', label: 'Satisfaction', icon: '⭐'}, {id:'3', number: 5, suffix: 'j', label: 'Délai livraison', icon: '🚚'}], bg_color: "#ffffff" } }
    ]
  },
  {
    title: '⭐ Preuve sociale',
    items: [
      { type: 'testimonials', title: 'Avis clients', defaultSettings: { title: "Ce que disent nos clients", items: [{id:'1', name:'Sophie L.', rating:5, text:'Produit incroyable !', location:'Paris', verified:true}, {id:'2', name:'Marc D.', rating:5, text:'Qualité au rendez-vous.', location:'Lyon', verified:true}, {id:'3', name:'Julie M.', rating:4, text:'Très satisfaite !', location:'Marseille', verified:true}], layout: 'grid', bg_color: "#f9fafb" } },
      { type: 'before_after', title: 'Avant / Après', defaultSettings: { title: "La différence", before_label: "Avant", after_label: "Après", before_image: "", after_image: "", bg_color: "#ffffff" } },
      { type: 'comparison', title: 'Tableau comparatif', defaultSettings: { title: "Pourquoi nous ?", our_label: "Notre Produit", competitor_label: "Les Autres", rows: [{id:'1', feature:'Qualité Premium', us: true, them: false}, {id:'2', feature:'Garantie à vie', us: true, them: false}, {id:'3', feature:'Support 24/7', us: true, them: true}], bg_color: "#ffffff" } }
    ]
  },
  {
    title: '✅ Confiance',
    items: [
      { type: 'benefits', title: 'Avantages', defaultSettings: { title: "Pourquoi nous choisir ?", items: [{id:'1', icon:'🚚', title:'Livraison Rapide', text:'Chez vous en 48h'}, {id:'2', icon:'🔒', title:'Paiement Sécurisé', text:'100% sécurisé'}, {id:'3', icon:'⭐', title:'Qualité Garantie', text:'Satisfait ou remboursé'}, {id:'4', icon:'↩️', title:'Retours Faciles', text:'30 jours'}], bg_color: "#f9fafb" } },
      { type: 'guarantees', title: 'Garanties', defaultSettings: { items: [{id:'1', icon:'🛡️', title:'Paiement Sécurisé', text:'Cryptage SSL'}, {id:'2', icon:'📦', title:'Livraison Garantie', text:'Suivi en temps réel'}, {id:'3', icon:'↩️', title:'Retour Gratuit', text:'Sous 30 jours'}, {id:'4', icon:'📞', title:'Support 7j/7', text:'Toujours disponible'}], bg_color: "#ffffff" } },
      { type: 'faq', title: 'FAQ', defaultSettings: { title: "Questions fréquentes", items: [{id:'1', question:'Quel est le délai de livraison ?', answer:'2 à 5 jours ouvrables selon votre localisation.'}, {id:'2', question:'Comment passer une commande ?', answer:'Remplissez le formulaire et notre équipe vous contactera.'}, {id:'3', question:'Puis-je payer à la livraison ?', answer:'Oui, le paiement à la livraison est disponible.'}], bg_color: "#ffffff" } }
    ]
  },
  {
    title: '📝 Contenu',
    items: [
      { type: 'image_text', title: 'Image + Texte', defaultSettings: { title: "Notre Histoire", text: "Découvrez notre engagement...", image_url: "", image_position: "left", bg_color: "#ffffff" } },
      { type: 'video', title: 'Vidéo', defaultSettings: { title: "Voyez-le en action", url: "", bg_color: "#000000" } },
      { type: 'text_block', title: 'Bloc texte', defaultSettings: { content: "Votre texte ici...", text_align: "center", bg_color: "#ffffff", text_color: "#111827" } },
      { type: 'spacer', title: 'Espaceur', defaultSettings: { height: 48, bg_color: "transparent" } }
    ]
  }
]

export default function SidebarLeft({
  data,
  selectedBlockId,
  onSelectBlock,
  onToggleVisibility,
  onDeleteBlock,
  onAddBlock,
  onReorder
}: SidebarLeftProps) {
  const [showCatalog, setShowCatalog] = useState(false)
  const [contextMenuBlock, setContextMenuBlock] = useState<{ id: string, type: 'header' | 'template' | 'footer' } | null>(null)

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
        <div className="flex items-center gap-2 overflow-hidden">
          {type === 'template' && (
            <button className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-0.5"
              onClick={(e) => { e.stopPropagation(); /* Implementing actual drag/drop is complex here, we'll assume a basic layout */ }}
            >
              <GripVertical size={14} />
            </button>
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
    <div className="w-[260px] h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0 relative">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Structure</h2>
      </div>

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

        {/* TEMPLATE */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wide">Modèle</h3>
          <div>
            {data.template.map((block, index) => (
              <BlockItem key={block.id} block={block} type="template" index={index} />
            ))}
          </div>
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

      {/* CATALOG SLIDE PANEL */}
      <div className={`absolute top-0 bottom-0 left-0 w-full bg-white z-30 transition-transform duration-300 flex flex-col ${showCatalog ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
          <h2 className="font-bold text-sm text-gray-800">Catalogue</h2>
          <button onClick={() => setShowCatalog(false)} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
          {CATALOG_CATEGORIES.map((category, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">{category.title}</h3>
              <div className="grid grid-cols-1 gap-2">
                {category.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => {
                      onAddBlock(item.type, item.title, item.defaultSettings)
                      setShowCatalog(false)
                    }}
                    className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 hover:shadow transition-all group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 block mb-0.5">{item.title}</span>
                    <span className="text-xs text-gray-400 block truncate">Type: {item.type}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
