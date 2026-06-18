"use client";

import React, { useState, useEffect } from 'react';
import { 
  Monitor, Smartphone, CornerUpLeft, CornerUpRight, EyeOff, Eye, GripVertical, 
  Plus, ChevronRight, ChevronDown, Edit2, LayoutTemplate, ArrowLeft, Paintbrush
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import StorePreview from '@/components/theme-builder/StorePreview';

const initialBlocks = [
  { id: 'b1', type: 'Titre', title: 'Titre', hidden: false, settings: { color: '#000000', size: 'large' } },
  { id: 'b2', type: 'Note de produit', title: 'Note de produit', hidden: false, settings: {} },
  { id: 'b3', type: 'Prix', title: 'Prix', hidden: false, settings: {} },
  { id: 'b4', type: 'Description', title: 'Description', hidden: false, settings: {} },
  { id: 'b5', type: 'Boutons d\'achat', title: 'Boutons d\'achat', hidden: false, settings: {} },
];

export default function ThemeBuilderPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [globalSettings, setGlobalSettings] = useState({ primaryColor: '#2b59ff' });

  // Fetch true products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setProducts(data);
          setSelectedProduct(data[0]);
        }
      } catch (err) {
        console.error('Erreur fetch products:', err);
      }
    }
    fetchProducts();
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setBlocks(items);
  };

  const toggleBlockVisibility = (id: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, hidden: !b.hidden } : b));
  };

  const editingBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] -mx-4 md:-mx-8 -mb-10 bg-[#f1f2f4] overflow-hidden font-sans border border-gray-200 rounded-t-xl shadow-inner">
      
      {/* ── TOP BAR (Header) ── */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        
        {/* Left: Product Selector */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-500">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div className="relative group">
            <select 
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-md pl-3 pr-8 py-1.5 outline-none hover:bg-gray-100 cursor-pointer"
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const p = products.find(prod => prod.id === e.target.value);
                setSelectedProduct(p);
              }}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
              {products.length === 0 && <option value="">Produit par défaut</option>}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Center: Info */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <span className="text-gray-600 font-medium truncate max-w-[200px]">Modèle Produit</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[11px] font-bold rounded-full uppercase tracking-wider">Actif</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-md p-0.5 mr-2">
            <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <button className="px-4 py-1.5 bg-[#008060] hover:bg-[#006e52] text-white text-sm font-semibold rounded-md shadow-sm transition-colors">
            Enregistrer
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ── LEFT SIDEBAR (Editor) ── */}
        <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
          
          {selectedBlockId === 'global-settings' ? (
            // VUE : Paramètres globaux (Couleurs)
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
              <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => setSelectedBlockId(null)}>
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900">Paramètres du thème</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Couleur Principale</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={globalSettings.primaryColor}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm font-mono text-gray-600">{globalSettings.primaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedBlockId ? (
            // VUE 2: Drill-down Edit Block
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
              <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => setSelectedBlockId(null)}>
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900">{editingBlock?.title}</h2>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-4">Modifiez les paramètres du bloc <strong className="text-gray-800">{editingBlock?.type}</strong> ici.</p>
                
                {/* Exemple de réglages bidons en attendant */}
                {editingBlock?.type === 'Titre' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Taille de la police</label>
                      <select className="w-full p-2 border border-gray-200 rounded text-sm outline-none">
                        <option>Petite</option>
                        <option>Moyenne</option>
                        <option selected>Grande</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {editingBlock?.type === 'Description' && (
                  <div className="space-y-4">
                     <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
                       La description est gérée depuis la page produit principale. Ce bloc détermine juste son emplacement sur la page.
                     </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // VUE 1: Main Section List
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="py-2 flex-1">
                <div className="px-4 text-[11px] font-bold text-gray-500 mb-1 mt-2">Informations produit</div>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="blocks-list">
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-0.5">
                        {blocks.map((block, index) => (
                          <Draggable key={block.id} draggableId={block.id} index={index}>
                            {(provided, snapshot) => (
                              <li 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                onClick={() => setSelectedBlockId(block.id)}
                                className={`group flex items-center justify-between pl-2 pr-2 py-1 mx-2 rounded-md cursor-pointer border ${snapshot.isDragging ? 'bg-white shadow-lg border-gray-200 z-50' : 'hover:bg-gray-100 border-transparent'}`}
                              >
                                <div className="flex items-center gap-2 text-[13px] text-gray-700 overflow-hidden py-1">
                                  <div {...provided.dragHandleProps} className="px-1 cursor-grab" onClick={e => e.stopPropagation()}>
                                    <GripVertical className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />
                                  </div>
                                  <span className={`truncate ${block.hidden ? 'opacity-50 line-through' : ''}`}>
                                    {block.title}
                                  </span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); toggleBlockVisibility(block.id); }} className={`p-1.5 rounded hover:bg-gray-200 flex-shrink-0 ${block.hidden ? 'text-gray-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                                  {block.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>

                <button className="flex items-center gap-2 pl-9 py-2 mt-1 text-[13px] text-blue-600 font-medium hover:underline w-full text-left">
                  <Plus className="w-3.5 h-3.5" /> Ajouter un bloc
                </button>
              </div>

              {/* Paramètres globaux link */}
              <div 
                className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors mt-auto"
                onClick={() => setSelectedBlockId('global-settings')}
              >
                 <Paintbrush className="w-4 h-4 text-gray-500" />
                 <span className="text-sm font-medium text-gray-700">Paramètres du thème</span>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT AREA (Live Preview) ── */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#e3e5e7]">
          <div className="w-full h-full p-4 md:p-8 flex justify-center overflow-auto custom-scrollbar">
            <div 
              className={`bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out ${
                previewMode === 'desktop' 
                  ? 'w-full max-w-[1200px] h-max min-h-full rounded-md' 
                  : 'w-[375px] h-[812px] flex-shrink-0 rounded-[2rem] border-8 border-gray-800'
              }`}
            >
              <StorePreview product={selectedProduct} blocks={blocks} globalSettings={globalSettings} />
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
