"use client";

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import GifCreator from '@/components/video/GifCreator';

export default function CreationGifPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-primary-600" />
          Création de GIF
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-2xl">
          Convertissez vos vidéos en GIFs légers et optimisés pour vos pages produits Shopify. 100% local, aucune API.
        </p>
      </div>

      <GifCreator />
    </div>
  );
}
