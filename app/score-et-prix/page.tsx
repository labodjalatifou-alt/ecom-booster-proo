"use client";

import React from 'react';
import { Tags, TrendingUp, Zap, Truck, Video, Heart, ShieldCheck, DollarSign } from 'lucide-react';

export default function ScoreEtPrixPage() {
  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Diagnostic Stratégique</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Score de Potentiel</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Score & Prix */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-xl font-black mb-10 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-emerald-400" /> Score Global
            </h3>
            <div className="text-center py-6">
              <div className="text-8xl font-black tracking-tighter mb-4 animate-in zoom-in duration-700">85<span className="text-3xl text-emerald-400">/100</span></div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Potentiel de Succès Élevé</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm">
            <h3 className="text-sm font-black mb-8 flex items-center gap-3 uppercase tracking-widest text-slate-400">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Stratégie de Prix
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-amber-400">
                <span className="text-[10px] font-black uppercase text-slate-400">Prix Minimum</span>
                <span className="text-lg font-black">15 000 F</span>
              </div>
              <div className="flex justify-between items-center p-6 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border-l-4 border-primary-500 shadow-lg shadow-primary-500/5 scale-105">
                <span className="text-[10px] font-black uppercase text-primary-600">Recommandé</span>
                <span className="text-2xl font-black text-primary-600">25 000 F</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-red-400">
                <span className="text-[10px] font-black uppercase text-slate-400">Prix Maximum</span>
                <span className="text-lg font-black">45 000 F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Analyse des Facteurs - LA LOGIQUE STRATÉGIQUE */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary-600" /> Pourquoi ce Score ?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Viralité */}
              <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] hover:bg-white transition-all border border-transparent hover:border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Heart className="w-6 h-6" /></div>
                  <h4 className="text-lg font-black tracking-tight">Viralité & Cible</h4>
                </div>
                <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                  "Ce produit touche principalement les femmes en Afrique, une audience extrêmement réactive sur Facebook. L'aspect visuel avant/après garantit un partage massif."
                </p>
              </div>

              {/* Logistique */}
              <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] hover:bg-white transition-all border border-transparent hover:border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
                  <h4 className="text-lg font-black tracking-tight">Livraison Locale</h4>
                </div>
                <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                  "Produit léger et peu encombrant. Le poids réduit facilite une logistique rapide et des frais de livraison minimes, augmentant votre profit net."
                </p>
              </div>

              {/* Contenu */}
              <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] hover:bg-white transition-all border border-transparent hover:border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Video className="w-6 h-6" /></div>
                  <h4 className="text-lg font-black tracking-tight">Contenus Abondants</h4>
                </div>
                <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                  "De nombreuses vidéos de démonstration de haute qualité sont disponibles sur TikTok et AliExpress, facilitant la création de vos publicités Facebook."
                </p>
              </div>

              {/* Tendance */}
              <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] hover:bg-white transition-all border border-transparent hover:border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Zap className="w-6 h-6" /></div>
                  <h4 className="text-lg font-black tracking-tight">Besoin Immédiat</h4>
                </div>
                <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                  "Résout un problème quotidien majeur. Le facteur 'Wow' à l'utilisation déclenche l'achat impulsif nécessaire pour le dropshipping en Afrique."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
