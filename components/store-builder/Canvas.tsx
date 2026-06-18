import React from 'react';
import SectionRenderer from './SectionRenderer';

interface CanvasProps {
  viewMode: 'desktop' | 'mobile';
  headerSections: any[];
  sections: any[];
  footerSections: any[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
}

export default function Canvas({ viewMode, headerSections, sections, footerSections, selectedSectionId, onSelectSection }: CanvasProps) {
  
  const renderSectionArea = (sectionList: any[]) => {
    return sectionList.map((section) => {
      if (section.hidden) return null;
      
      return (
        <div key={section.id} onClick={(e) => { e.stopPropagation(); onSelectSection(section.id); }}>
          <SectionRenderer 
            type={section.type} 
            settings={section.settings} 
            isSelected={selectedSectionId === section.id}
          />
        </div>
      );
    });
  };

  return (
    <div className={`w-full h-full flex items-center justify-center bg-[#f1f2f4] overflow-hidden transition-all duration-300 p-4`}>
      
      {/* Simulation d'Iframe (Container du Canvas) */}
      <div 
        className={`bg-white shadow-2xl flex flex-col overflow-y-auto custom-scrollbar transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          viewMode === 'mobile' 
            ? 'w-[390px] h-[844px] rounded-[40px] border-[8px] border-gray-900 shadow-[0_0_0_1px_#e5e7eb,0_20px_40px_-10px_rgba(0,0,0,0.1)]' 
            : 'w-full h-full max-w-[1920px] rounded-t-xl'
        }`}
        onClick={() => onSelectSection('')} // Clic dans le vide déselectionne
      >
        {/* Dynamic header / Safe Area simulation for Mobile */}
        {viewMode === 'mobile' && (
          <div className="w-full h-7 bg-white flex justify-center items-end pb-1 shrink-0 sticky top-0 z-50">
            <div className="w-1/3 h-5 bg-black rounded-b-xl" /> {/* Notch */}
          </div>
        )}

        {/* --- HEADER --- */}
        <div className="w-full shrink-0 relative z-30">
          {renderSectionArea(headerSections)}
        </div>

        {/* --- MAIN TEMPLATE --- */}
        <div className="w-full flex-1 flex flex-col relative z-10 min-h-[300px]">
          {sections.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                <span className="text-2xl opacity-50">🛍️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">La page est vide</h3>
              <p className="text-gray-500 max-w-sm">
                Ajoutez des sections depuis le panneau de gauche pour commencer à construire votre boutique.
              </p>
            </div>
          ) : (
            renderSectionArea(sections)
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="w-full shrink-0 mt-auto relative z-20">
          {renderSectionArea(footerSections)}
        </div>
        
        {/* Bottom Home Indicator for Mobile */}
        {viewMode === 'mobile' && (
          <div className="w-full h-6 bg-white flex justify-center items-center shrink-0 sticky bottom-0 z-50">
            <div className="w-1/3 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
      </div>

    </div>
  );
}
