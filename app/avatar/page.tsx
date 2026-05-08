"use client";

import React from 'react';
import { UserSquare2, Target, Heart, ShoppingBag, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function AvatarClientPage() {
  const avatar = {
    name: "Amina - La Femme Active",
    phraseChoc: "« Dites adieu aux matins gâchés : le secret pour des cheveux de déesse en 5 minutes chrono, SANS abîmer une seule mèche. »",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&h=300&auto=format&fit=crop",
    demographics: {
      sexe: "Femme",
      age: "25 - 45 ans",
      lieu: "Zone Urbaine (Abidjan, Dakar, Bamako...)",
      metier: "Salariée ou Entrepreneure"
    },
    interests: ["Soins capillaires", "Beauté & Cosmétiques", "Gain de temps", "Mode Africaine", "Famille"],
    behavior: "Achète par impulsion sur Facebook/TikTok si le résultat visuel est 'Wow'. Sensible à la livraison à domicile.",
    painPoints: "Perte de temps le matin, coût des salons de coiffure, abîme ses cheveux avec la chaleur classique."
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <UserSquare2 className="w-5 h-5 text-pink-600" />
            </div>
            <span className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Cible Prioritaire</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Avatar Client Unique</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden flex flex-col lg:flex-row">
        {/* Profil Photo & Identité */}
        <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-10 flex flex-col items-center text-center border-r border-slate-100 dark:border-slate-800">
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-primary-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img 
              src={avatar.image} 
              alt="Avatar Client" 
              className="w-48 h-48 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-2xl relative z-10 group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-6 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 z-20">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Cœur de Cible</span>
            </div>
          </div>
          
          <h3 className="text-2xl font-black tracking-tight mb-2">{avatar.name}</h3>
          <p className="text-sm font-bold text-slate-400 mb-8 italic">{avatar.demographics.metier}</p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Âge</span>
              <span className="text-sm font-black">{avatar.demographics.age}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sexe</span>
              <span className="text-sm font-black">{avatar.demographics.sexe}</span>
            </div>
          </div>
        </div>

        {/* Analyse Stratégique */}
        <div className="lg:w-2/3 p-10 md:p-16 space-y-12">
          {/* Phrase Choc Neuromarketing */}
          <div className="relative">
            <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-pink-500 rounded-full"></div>
            <h4 className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em] mb-4">Phrase Choc Neuromarketing</h4>
            <p className="text-2xl md:text-3xl font-black tracking-tight leading-tight italic text-slate-800 dark:text-slate-100">
              {avatar.phraseChoc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Intérêts */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" /> Centres d'intérêt
              </h4>
              <div className="flex flex-wrap gap-2">
                {avatar.interests.map((interest, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Comportement */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-500" /> Comportement d'achat
              </h4>
              <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                {avatar.behavior}
              </p>
            </div>
          </div>

          {/* Solution & Points de douleur */}
          <div className="p-8 bg-pink-50 dark:bg-pink-900/10 rounded-[2.5rem] border border-pink-100 dark:border-pink-800/30 shadow-inner">
            <h4 className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Douleur & Solution
            </h4>
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                <span className="text-red-500 uppercase mr-2 font-black">Problème :</span> {avatar.painPoints}
              </p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                <span className="text-emerald-600 uppercase mr-2 font-black">Solution :</span> Un appareil 5-en-1 qui offre un résultat professionnel en un temps record sans abîmer les cheveux.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
