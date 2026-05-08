"use client";

import React, { useState } from 'react';
import { Bot, Sparkles, ImagePlus, Link as LinkIcon, AlignLeft, Tag, UploadCloud, Loader2, X, AlertCircle } from 'lucide-react';

export default function AnalysesPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleSimulateAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 4000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && images.length < 3) {
      const newImages = Array.from(e.target.files).slice(0, 3 - images.length).map(() => URL.createObjectURL(new Blob()));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4">
      <div className="mb-8 text-center pt-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20 animate-pulse">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Analyseur de Produit IA
        </h2>
        <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">
          Analysez instantanément votre produit pour générer des scripts, avatars et prix optimisés.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <Bot className="w-8 h-8 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Analyse en cours...
              </h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Nous extrayons les meilleures opportunités pour votre business.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSimulateAnalysis} className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary-500" /> Nom du produit <span className="text-red-500">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Brosse soufflante 5-en-1" 
                  className="w-full px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary-500" /> Prix (Achat ou Vente)
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: 15 000 FCFA" 
                  className="w-full px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5 text-primary-500" /> Description (Optionnelle)
              </label>
              <textarea 
                rows={2}
                placeholder="Décrivez votre produit brièvement..." 
                className="w-full px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100 resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-primary-500" /> Lien concurrent (Optionnel)
              </label>
              <input 
                type="url" 
                placeholder="https://www.aliexpress.com/..." 
                className="w-full px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ImagePlus className="w-3.5 h-3.5 text-primary-500" /> Images (Max 3)
              </label>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <ImagePlus className="w-6 h-6" />
                    </div>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <label className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-400 group">
                    <UploadCloud className="w-5 h-5 md:w-6 md:h-6 group-hover:text-primary-500 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Ajouter</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full py-3.5 md:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                Générer l'analyse
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-primary-900/10 border border-blue-100 dark:border-primary-800/30 rounded-2xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
        <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">
          <strong>Note :</strong> Plus vous donnez de détails (images, description), plus l'analyse sera précise pour vos avatars clients et scripts de vente.
        </p>
      </div>
    </div>
  );
}
