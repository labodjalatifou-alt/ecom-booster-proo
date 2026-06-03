"use client";

import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, Download, CheckCircle2, Sparkles, X } from 'lucide-react';

const IMAGE_LABELS = [
  { label: 'Fond Blanc Pur', emoji: '⬜' },
  { label: 'Décor Studio', emoji: '🎬' },
  { label: 'Lifestyle Élégant', emoji: '🌿' },
  { label: 'Avantages Produit', emoji: '✨' },
  { label: 'Avantages Liste', emoji: '✨' },
  { label: 'En Action - Scène 1', emoji: '📸' },
  { label: 'Flat Lay Premium', emoji: '💎' },
];

export default function ImageGenerator() {
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<{id: string, label: string, url: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).slice(0, 3 - sourceImages.length);
      
      newImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setSourceImages(prev => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
      setGeneratedImages([]);
    }
  };

  const removeImage = (index: number) => {
    setSourceImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateImages = async () => {
    if (sourceImages.length === 0 || !productName || !productDescription) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress(0);
    setStatusText('Initialisation de la génération...');

    try {
      const response = await fetch('/api/images-ia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productDescription,
          productImageBase64: sourceImages[0] // On utilise la première image comme référence principale
        })
      });

      if (!response.body) throw new Error('Pas de réponse du serveur');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the incomplete part

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.status) {
                setStatusText(data.status);
              }
              if (data.progress) {
                setProgress(data.progress);
              }
              if (data.image) {
                setGeneratedImages(prev => [...prev, data.image]);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('SSE parse error:', e, line);
            }
          }
        }
      }
      
      setProgress(100);
      setStatusText(`✅ Images générées avec succès !`);
    } catch (err: any) {
      console.error(err);
      setStatusText('❌ Erreur : ' + (err.message || 'Inconnue'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- SETTINGS COLUMN --- */}
        <div className="col-span-1 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">1. Détails du produit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nom du produit</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Montre Connectée X-Pro"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description courte</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Ex: Montre de sport avec suivi cardiaque, étanche et batterie longue durée."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex justify-between items-center">
              <span>2. Photos (1 à 3 max)</span>
              <span className="text-xs font-normal text-slate-400">{sourceImages.length}/3</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {sourceImages.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img src={src} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {sourceImages.length < 3 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-slate-400 hover:text-indigo-500"
                >
                  <Upload className="w-6 h-6" />
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </div>

          <button
            onClick={generateImages}
            disabled={sourceImages.length === 0 || !productName || !productDescription || isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-4 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Génération en cours...</> : <><Sparkles className="w-5 h-5" />Générer 7 images IA</>}
          </button>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-indigo-500 font-semibold animate-pulse">{statusText}</p>
            </div>
          )}
          {!isGenerating && statusText && (
            <p className="text-xs text-center text-slate-500">{statusText}</p>
          )}
        </div>

        {/* --- RESULTS COLUMN --- */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[600px]">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              <span>Résultats ({generatedImages.length}/7)</span>
              {generatedImages.length === 7 && (
                <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />Terminé
                </span>
              )}
            </h3>

            {generatedImages.length === 0 && !isGenerating ? (
              <div className="h-[480px] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                <ImageIcon className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-sm font-medium">Vos images ultra-réalistes apparaîtront ici</p>
                <p className="text-xs opacity-70 mt-2 max-w-xs text-center">Remplissez les détails et téléchargez une image pour commencer.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedImages.map((img, idx) => {
                  const labelInfo = IMAGE_LABELS.find(l => l.label === img.label) || { emoji: '🖼️' };
                  return (
                    <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                        <p className="text-white text-xs font-bold">{labelInfo.emoji} {img.label}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          download={`${img.label.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                          className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-1.5 shadow-xl"
                        >
                          <Download className="w-3.5 h-3.5" /> Télécharger
                        </a>
                      </div>
                    </div>
                  );
                })}
                {/* Placeholders for loading images */}
                {isGenerating && Array.from({ length: 7 - generatedImages.length }).map((_, idx) => (
                  <div key={`loading-${idx}`} className="relative aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center animate-pulse">
                     <Loader2 className="w-6 h-6 text-indigo-300 dark:text-indigo-700 animate-spin" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
