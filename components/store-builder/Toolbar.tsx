import React from 'react';
import { ArrowLeft, Undo2, Redo2, Monitor, Smartphone, ChevronDown, Check, Globe } from 'lucide-react';
import Link from 'next/link';

interface ToolbarProps {
  viewMode: 'desktop' | 'mobile';
  onChangeViewMode: (mode: 'desktop' | 'mobile') => void;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  lastSavedAt: Date | null;
}

export default function Toolbar({ 
  viewMode, 
  onChangeViewMode, 
  hasUnsavedChanges, 
  onSave, 
  onPublish,
  isSaving,
  isPublishing,
  lastSavedAt
}: ToolbarProps) {
  
  return (
    <div className="h-14 w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50">
      
      {/* ── GAUCHE : Navigation & Statut ── */}
      <div className="flex items-center gap-4 flex-1">
        <Link href="/boutique-en-ligne" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">Ma Boutique Pro</span>
          <span className="text-[10px] text-gray-500 font-medium tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            BROUILLON
          </span>
        </div>
      </div>

      {/* ── CENTRE : Sélecteur de page & Switcher View ── */}
      <div className="flex items-center justify-center gap-6 flex-1">
        
        {/* Page Selector (Mocked for now) */}
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-sm font-semibold text-gray-800">
          Page d'accueil
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        <div className="h-5 w-px bg-gray-200" />

        {/* View Switcher */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200/50">
          <button 
            onClick={() => onChangeViewMode('desktop')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vue Ordinateur"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onChangeViewMode('mobile')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vue Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── DROITE : Actions ── */}
      <div className="flex items-center justify-end gap-3 flex-1">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 mr-2">
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-md transition-colors opacity-50 cursor-not-allowed">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-md transition-colors opacity-50 cursor-not-allowed">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Save Status / Save Button */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <button 
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
              hasUnsavedChanges 
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' 
                : 'text-gray-400'
            }`}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          {hasUnsavedChanges && (
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Modifications non sauvegardées
            </div>
          )}
          {!hasUnsavedChanges && lastSavedAt && (
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Check className="w-3 h-3" />
              Enregistré
            </div>
          )}

          {/* Publish Button */}
          <button 
            onClick={onPublish}
            disabled={isPublishing}
            className="flex items-center gap-2 bg-[#008060] hover:bg-[#006e52] text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-colors ml-2"
          >
            <Globe className="w-4 h-4" />
            {isPublishing ? 'Publication...' : 'Publier'}
          </button>
        </div>

      </div>

    </div>
  );
}
