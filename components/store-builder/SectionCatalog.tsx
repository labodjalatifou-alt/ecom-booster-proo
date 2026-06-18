import React, { useState } from 'react';
import { X, Search, Plus, LayoutTemplate, MessageSquare, Image as ImageIcon, Video, Star, Megaphone, CheckCircle } from 'lucide-react';

interface SectionCatalogProps {
  onClose: () => void;
  onAddSection: (type: string, title: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Toutes' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'content', label: 'Contenu' },
  { id: 'trust', label: 'Avis & Confiance' },
];

const AVAILABLE_SECTIONS = [
  { type: 'Hero', title: 'Hero / Bannière', category: 'marketing', icon: LayoutTemplate, desc: 'Grande image avec titre et boutons' },
  { type: 'Countdown', title: 'Compte à rebours', category: 'marketing', icon: Megaphone, desc: 'Crée de l\'urgence pour vos offres' },
  { type: 'OrderForm', title: 'Formulaire de commande', category: 'content', icon: CheckCircle, desc: 'Paiement à la livraison optimisé' },
  { type: 'Testimonials', title: 'Témoignages clients', category: 'trust', icon: Star, desc: 'Avis avec photos et notes' },
  { type: 'Benefits', title: 'Avantages', category: 'content', icon: CheckCircle, desc: 'Grille d\'icônes (Livraison, Qualité...)' },
  { type: 'Video', title: 'Vidéo', category: 'content', icon: Video, desc: 'Lecteur vidéo YouTube/MP4' },
  { type: 'Faq', title: 'Foire Aux Questions', category: 'content', icon: MessageSquare, desc: 'Accordéon de questions/réponses' },
  { type: 'ImageWithText', title: 'Image avec texte', category: 'content', icon: ImageIcon, desc: 'Bloc 50/50 classique' },
  { type: 'PricingTable', title: 'Tableau de prix', category: 'marketing', icon: LayoutTemplate, desc: 'Comparaison d\'offres' },
];

export default function SectionCatalog({ onClose, onAddSection }: SectionCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filteredSections = AVAILABLE_SECTIONS.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="absolute inset-0 bg-white z-30 flex flex-col animate-in slide-in-from-left duration-200 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="text-base font-bold text-gray-900">Ajouter une section</h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une section..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 pt-2 border-b border-gray-100 overflow-x-auto custom-scrollbar flex-shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {filteredSections.map((section) => (
          <div 
            key={section.type}
            className="group p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex items-start justify-between"
            onClick={() => onAddSection(section.type, section.title)}
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <section.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">{section.title}</h3>
                <p className="text-xs text-gray-500 leading-snug">{section.desc}</p>
              </div>
            </div>
            <button className="p-1.5 text-blue-600 bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredSections.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Aucune section trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
