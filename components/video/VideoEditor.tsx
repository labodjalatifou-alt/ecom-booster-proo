"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function VideoEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cesdk: any;
    
    const initEditor = async () => {
      try {
        const CreativeEditorSDK = (await import('@cesdk/cesdk-js')).default;
        
        if (containerRef.current) {
          const config: any = {
            role: 'Creator',
            theme: 'dark',
            license: '',
            baseURL: 'https://cdn.img.ly/packages/imgly/cesdk-js/1.75.1/assets'
          };
          
          cesdk = await CreativeEditorSDK.create(containerRef.current, config);
          
          // Créer une scène vidéo via l'API de l'éditeur (pour initialiser l'UI correctement)
          if (cesdk.actions && cesdk.actions.run) {
            await cesdk.actions.run('scene.create', { mode: 'Video' });
          } else if (typeof cesdk.createVideoScene === 'function') {
            await cesdk.createVideoScene();
          } else {
            cesdk.engine.scene.createVideo();
          }
        }
      } catch (err: any) {
        console.error("Erreur lors de l'initialisation de CE.SDK:", err);
        setError(err.message || "Impossible de charger l'éditeur vidéo. Vérifiez votre connexion ou désactivez votre bloqueur de publicités.");
      }
    };

    initEditor();

    return () => {
      if (cesdk) {
        cesdk.dispose();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-220px)] rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/50 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Le chargement a échoué</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-220px)] rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-900 relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
