"use client";

import React, { useState, useEffect } from 'react';
import Toolbar from './Toolbar';
import SidebarLeft from './SidebarLeft';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import SectionCatalog from './SectionCatalog';
import { createClient } from '@/lib/supabase/client';

export default function Editor({ storeId, initialData }: { storeId: string, initialData: any }) {
  const supabase = createClient();

  // State
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [headerSections, setHeaderSections] = useState<any[]>(initialData?.header || []);
  const [footerSections, setFooterSections] = useState<any[]>(initialData?.footer || []);
  const [sections, setSections] = useState<any[]>(initialData?.template || []);
  
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Auto-save logic (Simulation)
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 15000); // Save every 15s if changes
    
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, sections, headerSections, footerSections]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const builderJson = {
      header: headerSections,
      template: sections,
      footer: footerSections
    };

    const { error } = await supabase
      .from('store_pages')
      .update({ builder_json: builderJson })
      .eq('store_id', storeId)
      .eq('slug', 'home');

    setIsSaving(false);
    
    if (!error) {
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
    } else {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handlePublish = () => {
    // Publish logic
    handleSave();
    alert("Boutique publiée avec succès !");
  };

  // Drag & Drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSections(items);
    setHasUnsavedChanges(true);
  };

  // Actions
  const handleToggleVisibility = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s));
    setHeaderSections(headerSections.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s));
    setFooterSections(footerSections.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s));
    setHasUnsavedChanges(true);
  };

  const handleAddSection = (type: string, title: string) => {
    const newSection = {
      id: `sec-${Date.now()}`,
      type,
      title,
      hidden: false,
      settings: {}
    };
    setSections([...sections, newSection]);
    setIsCatalogOpen(false);
    setSelectedSectionId(newSection.id);
    setHasUnsavedChanges(true);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    setSelectedSectionId(null);
    setHasUnsavedChanges(true);
  };

  const handleUpdateSection = (id: string, newSettings: any) => {
    const updateFn = (s: any) => s.id === id ? { ...s, settings: newSettings } : s;
    setSections(sections.map(updateFn));
    setHeaderSections(headerSections.map(updateFn));
    setFooterSections(footerSections.map(updateFn));
    setHasUnsavedChanges(true);
  };

  // Find selected section
  const selectedSection = [...headerSections, ...sections, ...footerSections].find(s => s.id === selectedSectionId);

  return (
    <div className="w-full h-screen flex flex-col bg-[#f1f2f4] overflow-hidden text-gray-900 font-sans">
      
      {/* Top Toolbar */}
      <Toolbar 
        viewMode={viewMode} 
        onChangeViewMode={setViewMode}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        isPublishing={false}
        lastSavedAt={lastSavedAt}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Left */}
        <div className="relative z-30 flex-shrink-0 flex">
          <SidebarLeft 
            sections={sections}
            headerSections={headerSections}
            footerSections={footerSections}
            onDragEnd={handleDragEnd}
            onSelectSection={setSelectedSectionId}
            onToggleVisibility={handleToggleVisibility}
            onOpenCatalog={() => setIsCatalogOpen(true)}
            selectedSectionId={selectedSectionId}
          />

          {/* Overlays (Catalog & Properties) */}
          {isCatalogOpen && (
            <SectionCatalog 
              onClose={() => setIsCatalogOpen(false)} 
              onAddSection={handleAddSection} 
            />
          )}

          {selectedSection && !isCatalogOpen && (
            <PropertiesPanel 
              section={selectedSection}
              onUpdate={handleUpdateSection}
              onDelete={handleDeleteSection}
              onClose={() => setSelectedSectionId(null)}
              isFixed={headerSections.some(s => s.id === selectedSectionId) || footerSections.some(s => s.id === selectedSectionId)}
            />
          )}
        </div>

        {/* Canvas (Preview) */}
        <div className="flex-1 overflow-hidden relative z-10">
          <Canvas 
            viewMode={viewMode}
            headerSections={headerSections}
            sections={sections}
            footerSections={footerSections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
          />
        </div>

      </div>
    </div>
  );
}
