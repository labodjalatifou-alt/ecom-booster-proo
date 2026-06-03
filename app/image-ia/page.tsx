import React from 'react';
import dynamic from 'next/dynamic';
import { ImageIcon } from 'lucide-react';

import ImageGeneratorWrapper from '@/components/image-ia/ImageGeneratorWrapper';

export default function ImageIAPage() {
  return (
    <div className="p-4 md:p-8 pb-32 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto mb-10 mt-16 md:mt-0">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold mb-6">
          <ImageIcon className="w-5 h-5" />
          <span>Studio Créatif IA</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          Générateur d'images produits
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
          Générez instantanément 7 images professionnelles (fonds blancs, décors stylisés et visuels d'avantages) à partir d'une simple photo de votre produit. Totalement gratuit et privé.
        </p>
      </div>

      <ImageGeneratorWrapper />
    </div>
  );
}
