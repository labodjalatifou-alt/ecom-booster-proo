"use client";

import React, { useState } from 'react';
import { 
  Monitor, Smartphone, CornerUpLeft, CornerUpRight, EyeOff, GripVertical, 
  Plus, ChevronRight, ChevronDown, Edit2, LayoutTemplate, MoreHorizontal,
  Search, Home, Tags, Box, LayoutList, Gift, ShoppingBag, FileText, 
  MessageSquare, Lock
} from 'lucide-react';
import StorePreview, { ThemeSettings } from '@/components/theme-builder/StorePreview';

// Mock Data pour la structure des sections comme sur Shopify
const initialSections = {
  header: [
    { id: 'h1', type: 'Marquee', title: 'Marquee', hidden: false },
    { id: 'h2', type: 'Barre d\'annonces', title: 'Barre d\'annonces', hidden: true },
    { id: 'h3', type: 'En-tête', title: 'En-tête', hidden: false },
    { id: 'h4', type: 'Marquee', title: 'Marquee', hidden: true },
  ],
  template: [
    {
      id: 't1', 
      type: 'Informations produits', 
      title: 'Informations produits',
      expanded: true,
      blocks: [
        { id: 'b1', type: 'Titre', title: 'Titre', hidden: false },
        { id: 'b2', type: 'Texte', title: 'Texte - 🧠 Moins d\'envies', hidden: true },
        { id: 'b3', type: 'Texte', title: 'Texte - 🛡️ Protéger sa sa...', hidden: true },
        { id: 'b4', type: 'Texte', title: 'Texte - ⚡ Résultat rapide', hidden: true },
        { id: 'b5', type: 'Texte', title: 'Texte - ⭐⭐⭐⭐⭐Qualité gara...', hidden: false },
        { id: 'b6', type: 'Note de produit', title: 'Note de produit', hidden: false },
        { id: 'b7', type: 'Prix', title: 'Prix', hidden: false },
        { id: 'b8', type: 'Sélecteur de variante', title: 'Sélecteur de variante', hidden: false },
        { id: 'b9', type: 'Boutons d\'achat', title: 'Boutons d\'achat', hidden: false },
        { id: 'b10', type: 'Description', title: 'Description', hidden: false },
      ]
    },
    { id: 't2', type: 'Produits associés', title: 'Produits associés', hidden: false, blocks: [] }
  ],
  footer: [
    { id: 'f1', type: 'Pied de page', title: 'Pied de page', hidden: false }
  ]
};

export default function ThemeBuilderPage() {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [sections, setSections] = useState(initialSections);
  const [pageSelectorOpen, setPageSelectorOpen] = useState(false);
  const [activePage, setActivePage] = useState('Produit par défaut');
  
  const [settings] = useState<ThemeSettings>({
    storeName: 'Zenvyra',
    announcementText: 'Livraison rapide 🚚 | Livraison gratuite 📦 | Qualité supérieure ⭐⭐⭐',
    showAnnouncement: true,
    primaryColor: '#c084fc',
    backgroundColor: '#ffffff',
    textColor: '#111827',
  });

  const toggleSection = (category: keyof typeof sections, id: string) => {
    const updated = { ...sections };
    const sectionIndex = updated[category].findIndex((s: any) => s.id === id);
    if (sectionIndex > -1) {
      updated[category][sectionIndex].hidden = !updated[category][sectionIndex].hidden;
      setSections(updated);
    }
  };

  const toggleBlock = (sectionId: string, blockId: string) => {
    const updated = { ...sections };
    const section = updated.template.find((s: any) => s.id === sectionId);
    if (section && section.blocks) {
      const blockIndex = section.blocks.findIndex((b: any) => b.id === blockId);
      if (blockIndex > -1) {
        section.blocks[blockIndex].hidden = !section.blocks[blockIndex].hidden;
        setSections(updated);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f1f2f4] font-sans -mx-4 md:-mx-8 -mt-6 -mb-10 fixed inset-0 z-[100] top-0 left-0">
      
      {/* ── TOP BAR (Header) ── */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        
        {/* Left: Page Selector */}
        <div className="flex items-center gap-2 relative">
          <div className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
            <LayoutTemplate className="w-5 h-5 text-gray-600" />
          </div>
          <button 
            onClick={() => setPageSelectorOpen(!pageSelectorOpen)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md text-sm font-semibold text-gray-800 transition-colors"
          >
            {activePage}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Shopify-like Page Dropdown */}
          {pageSelectorOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[70vh]">
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Rechercher dans la boutique en ligne" className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border-none rounded-md text-sm outline-none" />
                </div>
              </div>
              <div className="overflow-y-auto p-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Pages</div>
                {[
                  { name: 'Page d\'accueil', icon: Home },
                  { name: 'Produits', icon: Tags, hasArrow: true },
                  { name: 'Collections', icon: Box, hasArrow: true },
                  { name: 'Liste de collections', icon: LayoutList },
                  { name: 'Carte-cadeau', icon: Gift },
                  { name: 'Panier', icon: ShoppingBag },
                  { name: 'Paiement et comptes clients', icon: ShoppingBag },
                  { name: 'Pages', icon: FileText, hasArrow: true },
                  { name: 'Blogs', icon: MessageSquare, hasArrow: true },
                  { name: 'Recherche', icon: Search },
                  { name: 'Mot de passe', icon: Lock },
                ].map((item, idx) => (
                  <button key={idx} onClick={() => { setActivePage(item.name); setPageSelectorOpen(false); }} className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm ${activePage === item.name ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-gray-500" />
                      {item.name}
                    </div>
                    {item.hasArrow && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Status & Theme Info */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <span className="text-gray-600 font-medium truncate max-w-[200px]">theme-export-www-nuveria...</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[11px] font-bold rounded-full uppercase tracking-wider">Actif</span>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <span className="text-gray-500 text-xs flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> {activePage}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-gray-100 rounded-md p-0.5 mr-2">
            <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-md" title="Annuler">
            <CornerUpLeft className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-md mr-2" title="Rétablir">
            <CornerUpRight className="w-4 h-4" />
          </button>
          <button className="px-4 py-1.5 bg-[#008060] hover:bg-[#006e52] text-white text-sm font-semibold rounded-md shadow-sm transition-colors">
            Enregistrer
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── LEFT SIDEBAR (Editor) ── */}
        <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10">
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
            {/* Context Header */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 mb-1">{activePage}</h2>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center"><LayoutTemplate className="w-2.5 h-2.5 text-blue-600" /></div>
                  Prévisualiser
                </div>
                <Edit2 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* EN-TÊTE SECTION */}
            <div className="py-3">
              <div className="px-4 text-[11px] font-bold text-gray-500 mb-1">En-tête</div>
              <ul className="space-y-0.5">
                {sections.header.map((section) => (
                  <li key={section.id} className="group flex items-center justify-between px-2 py-1.5 mx-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />
                      <span className={section.hidden ? 'opacity-50 line-through' : ''}>{section.title}</span>
                    </div>
                    <button onClick={() => toggleSection('header', section.id)} className={`p-1 rounded hover:bg-gray-200 ${section.hidden ? 'text-gray-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <button className="flex items-center gap-2 px-6 py-2 text-sm text-blue-600 font-medium hover:underline mt-1">
                <Plus className="w-4 h-4" /> Ajouter une section
              </button>
            </div>

            <div className="w-full h-px bg-gray-200 my-2"></div>

            {/* MODÈLE SECTION */}
            <div className="py-2">
              <div className="px-4 text-[11px] font-bold text-gray-500 mb-1">Modèle</div>
              
              {sections.template.map((section) => (
                <div key={section.id}>
                  {/* Main Section Header */}
                  <div className="group flex items-center justify-between px-2 py-1.5 mx-2 rounded-md hover:bg-gray-100 cursor-pointer bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      <LayoutTemplate className="w-4 h-4 text-gray-400" />
                      <span className={section.hidden ? 'opacity-50 line-through' : ''}>{section.title}</span>
                    </div>
                    <div className="flex items-center">
                      <button onClick={() => toggleSection('template', section.id)} className={`p-1 rounded hover:bg-gray-200 ${section.hidden ? 'text-gray-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Blocks inside Section */}
                  {section.expanded && section.blocks && (
                    <div className="mt-1 relative before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-px before:bg-gray-200">
                      <ul className="space-y-0.5">
                        {section.blocks.map((block: any) => (
                          <li key={block.id} className="group flex items-center justify-between pl-8 pr-2 py-1 mx-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <div className="flex items-center gap-2 text-[13px] text-gray-700 overflow-hidden">
                              <GripVertical className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-grab" />
                              <span className={`truncate ${block.hidden ? 'opacity-50 line-through' : ''}`}>
                                {block.type === 'Titre' ? 'T Titre' : ''}
                                {block.type === 'Texte' ? '≡ Texte' : ''}
                                {block.type === 'Note de produit' ? '★ Note de produit' : ''}
                                {block.type === 'Prix' ? '💰 Prix' : ''}
                                {block.type === 'Sélecteur de variante' ? '⊞ Sélecteur de variante' : ''}
                                {block.type === 'Description' ? '☰ Description' : ''}
                                {block.type === 'Boutons d\'achat' ? '💳 Boutons d\'achat' : ''}
                                {block.type === 'Produits associés' ? '🛍️ Produits associés' : ''}
                                {!['Titre', 'Texte', 'Note de produit', 'Prix', 'Sélecteur de variante', 'Description', 'Boutons d\'achat', 'Produits associés'].includes(block.type) && block.title}
                              </span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleBlock(section.id, block.id); }} className={`p-1 rounded hover:bg-gray-200 flex-shrink-0 ${block.hidden ? 'text-gray-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button className="flex items-center gap-2 pl-9 py-1.5 text-[13px] text-blue-600 font-medium hover:underline w-full text-left">
                        <Plus className="w-3.5 h-3.5" /> Ajouter un bloc
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              <button className="flex items-center gap-2 px-6 py-2 text-sm text-blue-600 font-medium hover:underline mt-2">
                <Plus className="w-4 h-4" /> Ajouter une section
              </button>
            </div>

            <div className="w-full h-px bg-gray-200 my-2"></div>

            {/* PIED DE PAGE SECTION */}
            <div className="py-2">
              <div className="px-4 text-[11px] font-bold text-gray-500 mb-1">Pied de page</div>
              <button className="flex items-center gap-2 px-6 py-1.5 text-sm text-blue-600 font-medium hover:underline w-full text-left mb-1">
                <Plus className="w-4 h-4" /> Ajouter une section
              </button>
              <ul className="space-y-0.5">
                {sections.footer.map((section) => (
                  <li key={section.id} className="group flex items-center justify-between px-2 py-1.5 mx-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />
                      <span className={section.hidden ? 'opacity-50 line-through' : ''}>{section.title}</span>
                    </div>
                    <button onClick={() => toggleSection('footer', section.id)} className={`p-1 rounded hover:bg-gray-200 ${section.hidden ? 'text-gray-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
          
          {/* Bottom Settings Link */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-gray-600 text-xs">⚙️</span>
              Paramètres du thème
            </div>
          </div>
        </div>

        {/* ── RIGHT AREA (Live Preview) ── */}
        <div className="flex-1 flex flex-col relative bg-[#f1f2f4] overflow-hidden">
          <div className="w-full h-full p-4 flex justify-center overflow-auto custom-scrollbar">
            <div 
              className={`bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out ${
                previewMode === 'desktop' 
                  ? 'w-full h-[1000px]' // Hauteur arbitraire pour simuler le scroll
                  : 'w-[375px] h-[812px] flex-shrink-0'
              }`}
            >
              {/* Le composant de rendu final */}
              <StorePreview settings={settings} />
            </div>
          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}} />
    </div>
  );
}
