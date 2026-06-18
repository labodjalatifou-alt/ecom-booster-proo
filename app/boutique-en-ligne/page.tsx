"use client";

import React, { useState, useEffect } from 'react';
import StorePreview, { ThemeSettings } from '@/components/theme-builder/StorePreview';
import { Palette, LayoutTemplate, Type, Eye, Save, Monitor, Smartphone, ChevronDown, MonitorSmartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ThemeBuilderPage() {
  const [activeTab, setActiveTab] = useState('header');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const [settings, setSettings] = useState<ThemeSettings>({
    storeName: 'Zenvyra',
    announcementText: 'Livraison rapide 🚚 | Livraison gratuite 📦 | Qualité supérieure ⭐⭐⭐',
    showAnnouncement: true,
    primaryColor: '#c084fc', // Un violet/rose clair typique de certains sites dropshipping
    backgroundColor: '#ffffff',
    textColor: '#111827',
  });

  // Charger depuis le localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('theme_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('theme_settings', JSON.stringify(settings));
    toast.success('Thème sauvegardé avec succès !');
  };

  const updateSetting = (key: keyof ThemeSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.24))] -mx-4 md:-mx-8 -mb-10 overflow-hidden bg-gray-100">
      
      {/* ── Sidebar Gauche (Éditeur) ── */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-xl flex-shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="font-black text-sm uppercase tracking-widest text-gray-800 flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600" />
            Personnalisation
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('header')} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'header' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              En-tête
            </button>
            <button 
              onClick={() => setActiveTab('colors')} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'colors' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Couleurs
            </button>
            <button 
              onClick={() => setActiveTab('sections')} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'sections' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Sections
            </button>
          </div>

          <div className="p-5 space-y-6">
            
            {activeTab === 'header' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Store Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nom de la boutique</label>
                  <input 
                    type="text" 
                    value={settings.storeName}
                    onChange={(e) => updateSetting('storeName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Announcement Bar */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <MonitorSmartphone className="w-3.5 h-3.5" />
                      Barre d'annonce
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.showAnnouncement} onChange={(e) => updateSetting('showAnnouncement', e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  {settings.showAnnouncement && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400">Texte de l'annonce</label>
                      <textarea 
                        value={settings.announcementText}
                        onChange={(e) => updateSetting('announcementText', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Couleur Principale</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Utilisée pour les boutons, la barre d'annonce et le logo texte.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Arrière-plan</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={settings.backgroundColor}
                      onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm font-mono text-gray-600 uppercase">{settings.backgroundColor}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Texte principal</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={settings.textColor}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm font-mono text-gray-600 uppercase">{settings.textColor}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 border-dashed text-center">
                  <LayoutTemplate className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Bientôt : Ajoutez des blocs "Avant/Après", "Témoignages", etc.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>

      {/* ── Zone Principale (Prévisualisation) ── */}
      <div className="flex-1 flex flex-col relative bg-gray-200/50">
        
        {/* Topbar Preview Controls */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-center gap-2 shadow-sm z-10">
          <button 
            onClick={() => setPreviewMode('desktop')}
            className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            title="Vue Ordinateur"
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setPreviewMode('mobile')}
            className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            title="Vue Mobile"
          >
            <Smartphone className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" /> Prévisualisation en direct
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-hidden flex items-center justify-center p-4 lg:p-8">
          <div 
            className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 ease-in-out ${
              previewMode === 'desktop' 
                ? 'w-full max-w-[1440px] h-full rounded-2xl border border-gray-200' 
                : 'w-[375px] h-[812px] rounded-[3rem] border-[8px] border-gray-900 flex-shrink-0'
            }`}
          >
            <StorePreview settings={settings} />
          </div>
        </div>
        
      </div>
    </div>
  );
}
