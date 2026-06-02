"use client";

import React, { useState } from 'react';
import { Film, Image as ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import GifCreator from '@/components/video/GifCreator';

// Chargement dynamique — SSR impossible (window, canvas, etc.)
const VideoEditor = dynamic(() => import('@/components/video/VideoEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-slate-900" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex flex-col items-center gap-4">
        <Film className="w-10 h-10 text-primary-500 animate-pulse" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
          Chargement de l'éditeur…
        </p>
      </div>
    </div>
  )
});

export default function MontageVideoPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'gif'>('video');

  return (
    <>
      {/* ── Onglets (visibles seulement quand l'éditeur vidéo est caché) ── */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 -mx-6 -mt-6">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'video'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          Montage Vidéo
        </button>
        <button
          onClick={() => setActiveTab('gif')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'gif'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Création de GIF
        </button>
      </div>

      {/* ── Contenu ────────────────────────────────────────────────────── */}
      {activeTab === 'video' ? (
        /* L'éditeur vidéo prend toute la place, sans padding */
        <div className="-mx-6 -mb-6">
          <VideoEditor />
        </div>
      ) : (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <GifCreator />
        </div>
      )}
    </>
  );
}
