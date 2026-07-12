import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, EyeOff, Eye, Settings, Plus, LayoutTemplate, MoreVertical, Copy, Trash2, Edit2 } from 'lucide-react';

interface SectionsListProps {
  sections: any[];
  headerSections: any[];
  footerSections: any[];
  onDragEnd: (result: any) => void;
  onSelectSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onOpenCatalog: () => void;
  onDuplicateSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onEditSection: (id: string) => void;
  selectedSectionId: string | null;
}

export default function SectionsList({ 
  sections, 
  headerSections, 
  footerSections, 
  onDragEnd, 
  onSelectSection, 
  onToggleVisibility,
  onOpenCatalog,
  onDuplicateSection,
  onDeleteSection,
  onEditSection,
  selectedSectionId 
}: SectionsListProps) {
  
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderFixedSection = (section: any) => (
    <div 
      key={section.id}
      onClick={() => onSelectSection(section.id)}
      className={`group flex items-center justify-between px-3 py-2 mx-3 rounded-lg cursor-pointer border transition-colors ${selectedSectionId === section.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100 border-transparent'}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <LayoutTemplate className="w-4 h-4 text-gray-400" />
        <span className={`text-[13px] text-gray-700 truncate font-medium ${section.hidden ? 'opacity-50 line-through' : ''}`}>
          {section.title}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(section.id); }}
          className={`p-1.5 rounded hover:bg-gray-200 ${section.hidden ? 'text-gray-400 opacity-100' : 'text-gray-500'}`}
        >
          {section.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  const renderDropdown = (sectionId: string) => (
    <div 
      ref={dropdownRef}
      className="absolute right-2 top-full z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onEditSection(sectionId); setDropdownOpen(null); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <Edit2 className="w-4 h-4" /> Modifier
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicateSection(sectionId); setDropdownOpen(null); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <Copy className="w-4 h-4" /> Dupliquer
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleVisibility(sectionId); setDropdownOpen(null); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <EyeOff className="w-4 h-4" /> Masquer / Afficher
      </button>
      <div className="border-t border-gray-100 my-1" />
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteSection(sectionId); setDropdownOpen(null); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" /> Supprimer
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-20">
      
      {/* ── EN-TÊTE (Fixe) ── */}
      <div className="py-4">
        <div className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">En-tête</div>
        <div className="space-y-1">
          {headerSections.map(renderFixedSection)}
        </div>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* ── MODÈLE (Draggable) ── */}
      <div className="py-4 flex-1">
        <div className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between items-center">
          <span>Modèle</span>
          <span className="text-gray-400 lowercase">{sections.length} sections</span>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="template-sections">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <li 
                        ref={provided.innerRef} 
                        {...provided.draggableProps} 
                        onClick={() => onSelectSection(section.id)}
                        className={`group flex items-center justify-between pl-1 pr-2 py-1.5 mx-3 rounded-lg cursor-pointer border transition-colors relative ${
                          snapshot.isDragging ? 'bg-white shadow-xl border-gray-200 z-50' : 
                          selectedSectionId === section.id ? 'bg-blue-50 border-blue-200' : 
                          'hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-1 overflow-hidden">
                          <div {...provided.dragHandleProps} className="p-1.5 cursor-grab hover:bg-gray-200 rounded text-gray-400" onClick={e => e.stopPropagation()}>
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className={`text-[13px] text-gray-700 truncate font-medium ${section.hidden ? 'opacity-50 line-through' : ''}`}>
                            {section.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleVisibility(section.id); }}
                            className={`p-1.5 rounded hover:bg-gray-200 ${section.hidden ? 'text-gray-400 opacity-100' : 'text-gray-500'}`}
                          >
                            {section.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <div className="relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDropdownOpen(dropdownOpen === section.id ? null : section.id); }}
                              className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {dropdownOpen === section.id && renderDropdown(section.id)}
                          </div>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div className="px-3 mt-3">
          <button 
            onClick={onOpenCatalog}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Ajouter une section
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* ── PIED DE PAGE (Fixe) ── */}
      <div className="py-4">
        <div className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pied de page</div>
        <div className="space-y-1">
          {footerSections.map(renderFixedSection)}
        </div>
      </div>

    </div>
  );
}
