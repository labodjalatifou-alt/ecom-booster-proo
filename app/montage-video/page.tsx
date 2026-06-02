"use client";

import React, { useState } from 'react';
import { Film, Image as ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import GifCreator from '@/components/video/GifCreator';

// Chargement dynamique de l'éditeur vidéo car il a besoin de 'window' (SSR impossible)
const VideoEditor = dynamic(() => import('@/components/video/VideoEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-220px)] bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
      <div className="flex flex-col items-center gap-4">
        <Film className="w-10 h-10 text-primary-500 animate-pulse" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
          Chargement de l'éditeur vidéo...
        </p>
      </div>
    </div>
  )
});

export default function MontageVideoPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'gif'>('video');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Onglets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Film className="w-8 h-8 text-primary-600" />
            Création de Contenu
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-2xl">
            Éditez vos vidéos de manière professionnelle et générez des GIFs légers et optimisés pour vos pages produits Shopify.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border-2 border-slate-100 dark:border-slate-800 flex self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'video' 
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 translate-x-1' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Film className={`w-4 h-4 ${activeTab === 'video' ? 'text-white' : 'text-slate-400'}`} />
            Montage Vidéo
          </button>
          <button
            onClick={() => setActiveTab('gif')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'gif' 
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 -translate-x-1' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className={`w-4 h-4 ${activeTab === 'gif' ? 'text-white' : 'text-slate-400'}`} />
            Création de GIF
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="w-full">
        <div className={activeTab === 'video' ? 'block' : 'hidden'}>
          <VideoEditor />
        </div>
        <div className={activeTab === 'gif' ? 'block' : 'hidden'}>
          <GifCreator />
        </div>
      </div>
      
    </div>
  );
}
