import React, { useState } from 'react';
import { List, Palette } from 'lucide-react';
import SectionsList from './SectionsList';

interface SidebarLeftProps {
  sections: any[];
  headerSections: any[];
  footerSections: any[];
  onDragEnd: (result: any) => void;
  onSelectSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onOpenCatalog: () => void;
  selectedSectionId: string | null;
}

export default function SidebarLeft({
  sections,
  headerSections,
  footerSections,
  onDragEnd,
  onSelectSection,
  onToggleVisibility,
  onOpenCatalog,
  selectedSectionId
}: SidebarLeftProps) {
  const [activeTab, setActiveTab] = useState<'sections' | 'design'>('sections');

  return (
    <div className="w-[300px] h-full bg-white border-r border-gray-200 flex flex-col shrink-0 z-40 relative">
      
      {/* ── Tabs (Sections / Design) ── */}
      <div className="flex w-full border-b border-gray-200 shrink-0">
        <button 
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'sections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
        >
          <List className="w-4 h-4" /> Sections
        </button>
        <button 
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'design' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
        >
          <Palette className="w-4 h-4" /> Design
        </button>
      </div>

      {/* ── Content ── */}
      {activeTab === 'sections' ? (
        <SectionsList 
          sections={sections}
          headerSections={headerSections}
          footerSections={footerSections}
          onDragEnd={onDragEnd}
          onSelectSection={onSelectSection}
          onToggleVisibility={onToggleVisibility}
          onOpenCatalog={onOpenCatalog}
          selectedSectionId={selectedSectionId}
        />
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="text-center py-10">
            <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-bold mb-2">Paramètres du thème</h3>
            <p className="text-sm text-gray-500">
              Gérez ici les couleurs globales, la typographie et le design de votre boutique.
              (En cours d'intégration).
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
