"use client";

import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, Download, CheckCircle2, Sparkles, X } from 'lucide-react';

const IMAGE_LABELS: Record<string, string> = {
  'Fond Blanc Pur': '⬜',
  'Décor Studio': '🎬',
  'Lifestyle Élégant': '🌿',
  'Avantages Produit': '✨',
  'Avantages Liste': '✨',
  'En Action - Scène 1': '📸',
  'Flat Lay Premium': '💎',
};

const STEPS = [
  'Upload de l\'image source...',
  'Génération des avantages avec Claude...',
  'Image 1/7 : Fond Blanc Pur (Remove.bg)...',
  'Image 2/7 : Décor Studio (Fal.ai)...',
  'Image 3/7 : Lifestyle Élégant (Fal.ai)...',
  'Image 4/7 : Avantages Produit (Fal.ai + Canvas)...',
  'Image 5/7 : Avantages Liste (Fal.ai + Canvas)...',
  'Image 6/7 : En Action Scène 1 (Fal.ai)...',
  'Image 7/7 : Flat Lay Premium (Fal.ai)...',
  'Finalisation...',
];

export default function ImageGenerator() {
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<{ id: string; label: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).slice(0, 3 - sourceImages.length).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => setSourceImages(prev => [...prev, ev.target?.result as string]);
        reader.readAsDataURL(file);
      });
      setGeneratedImages([]);
    }
  };

  const removeImage = (index: number) => setSourceImages(prev => prev.filter((_, i) => i !== index));

  const startStepAnimation = () => {
    let idx = 0;
    setStepIndex(0);
    setStatusText(STEPS[0]);
    stepIntervalRef.current = setInterval(() => {
      idx = Math.min(idx + 1, STEPS.length - 1);
      setStepIndex(idx);
      setStatusText(STEPS[idx]);
    }, 12000); // ~12s per image
  };

  const stopStepAnimation = () => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
  };

  const generateImages = async () => {
    if (sourceImages.length === 0 || !productName || !productDescription) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    startStepAnimation();

    try {
      const response = await fetch('/api/images-ia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productDescription,
          productImageBase64: sourceImages[0],
        }),
      });

      const data = await response.json();
      stopStepAnimation();

      if (data.error) throw new Error(data.error);

      setGeneratedImages(data.images || []);
      setStatusText(`✅ ${data.images?.length || 0} images générées avec succès !`);
    } catch (err: any) {
      stopStepAnimation();
      console.error(err);
      setStatusText('❌ Erreur : ' + (err.message || 'Inconnue'));
    } finally {
      setIsGenerating(false);
    }
  };

  const progress = isGenerating ? Math.min(Math.round((stepIndex / (STEPS.length - 1)) * 100), 95) : (generatedImages.length > 0 ? 100 : 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* SETTINGS */}
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
                  placeholder="Ex: Montre sport avec suivi cardiaque, étanche et longue durée..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex justify-between">
              <span>2. Photos produit</span>
              <span className="text-xs font-normal text-slate-400">{sourceImages.length}/3</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {sourceImages.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img src={src} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {sourceImages.length < 3 && (
                <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-slate-400 hover:text-indigo-500">
                  <Upload className="w-5 h-5" />
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            <p className="text-xs text-slate-400 text-center">PNG ou JPG, fond clair de préférence</p>
          </div>

          <button
            onClick={generateImages}
            disabled={sourceImages.length === 0 || !productName || !productDescription || isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-4 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Génération (~2 min)...</> : <><Sparkles className="w-5 h-5" />Générer 7 images IA</>}
          </button>

          {(isGenerating || statusText) && (
            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className={`text-xs text-center font-semibold ${isGenerating ? 'text-indigo-500 animate-pulse' : statusText.startsWith('❌') ? 'text-red-500' : 'text-emerald-500'}`}>
                {statusText}
              </p>
            </div>
          )}
        </div>

        {/* RESULTS */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[600px]">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              <span>Résultats ({generatedImages.length}/7)</span>
              <div className="flex items-center gap-2">
                {generatedImages.length === 7 && (
                  <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />Terminé
                  </span>
                )}
                {generatedImages.length > 0 && (
                  <button
                    onClick={() => generatedImages.forEach((img, i) => setTimeout(() => window.open(img.url, '_blank'), i * 200))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" /> Tout télécharger
                  </button>
                )}
              </div>
            </h3>

            {generatedImages.length === 0 && !isGenerating ? (
              statusText.startsWith('❌') ? (
                <div className="h-[480px] flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-8 text-center">
                  <X className="w-16 h-16 mb-4 opacity-80" />
                  <p className="text-sm font-bold mb-2">Une erreur est survenue</p>
                  <p className="text-xs opacity-90 max-w-md break-words">{statusText}</p>
                </div>
              ) : (
                <div className="h-[480px] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                  <ImageIcon className="w-20 h-20 mb-4 opacity-50" />
                  <p className="text-sm font-medium">Vos images ultra-réalistes apparaîtront ici</p>
                  <p className="text-xs opacity-70 mt-2 max-w-xs text-center">Remplissez les détails et téléchargez une image pour commencer.</p>
                </div>
              )
            ) : isGenerating ? (
              <div className="h-[480px] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-slate-700" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-500" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Génération en cours...</p>
                  <p className="text-xs text-indigo-500 font-medium animate-pulse max-w-xs">{statusText}</p>
                  <p className="text-xs text-slate-400">La génération prend environ 2 minutes. Patientez svp.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedImages.map((img) => (
                  <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                      <p className="text-white text-xs font-bold">{IMAGE_LABELS[img.label] || '🖼️'} {img.label}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-1.5 shadow-xl"
                      >
                        <Download className="w-3.5 h-3.5" /> Télécharger
                      </a>
                    </div>
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
