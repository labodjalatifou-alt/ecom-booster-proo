"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Chargement dynamique de l'éditeur sans SSR pour éviter les problèmes d'hydratation (DragDrop, etc)
const Editor = dynamic(() => import('@/components/store-builder/Editor'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f1f2f4]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-500 font-medium">Chargement de l'éditeur...</p>
    </div>
  )
});

export default function StoreBuilderPage({ params }: { params: { id: string } }) {
  // Ici on pourrait charger les données initiales basées sur params.id
  // Pour l'instant Editor utilise des données mockées.
  
  return <Editor />;
}
