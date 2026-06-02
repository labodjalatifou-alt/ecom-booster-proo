"use client";

import React, { useEffect, useRef } from 'react';

export default function VideoEditor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cesdk: any;
    
    // Le chargement dynamique côté client est important pour éviter 
    // les erreurs "window is not defined" pendant le SSR de Next.js
    const initEditor = async () => {
      try {
        const CreativeEditorSDK = (await import('@cesdk/cesdk-js')).default;
        
        if (containerRef.current) {
          const config = {
            role: 'Creator',
            theme: 'dark',
            // Licence optionnelle. Vide = Community/Developer Edition
            license: '', 
            ui: {
              elements: {
                view: 'default',
                navigation: {
                  action: {
                    export: {
                      show: true,
                      format: ['video/mp4']
                    }
                  }
                }
              }
            }
          };
          
          cesdk = await CreativeEditorSDK.create(containerRef.current, config);
          
          // Optionnel: charger un modèle vidéo de base pour ne pas démarrer à blanc
          await cesdk.engine.scene.loadFromURL(
            'https://cdn.img.ly/packages/imgly/cesdk-js/latest/assets/templates/cesdk_blank_video.scene'
          );
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de CE.SDK:", error);
      }
    };

    initEditor();

    return () => {
      if (cesdk) {
        cesdk.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh-220px)] rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-900">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
