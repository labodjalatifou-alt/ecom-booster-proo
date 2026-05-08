"use client";

import React, { useState } from 'react';
import { Megaphone, Copy, Check, Sparkles, Layout, Zap, Send, CheckCircle2 } from 'lucide-react';

export default function PubliciteFacebookPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const ads = [
    {
      title: "Variante 1 : Approche Choc",
      text: "🚨 STOP ! Vos cheveux méritent mieux que des brûlures quotidiennes. 🚨\n\nDécouvrez le secret d'une coiffure de salon en 5 minutes chrono ! Notre Brosse 5-en-1 remplace votre sèche-cheveux, votre lisseur et votre boucleur.\n\n✅ Gain de temps incroyable\n✅ Technologie ionique anti-frisottis\n✅ Cheveux brillants et soyeux\n\n🚚 Livraison Rapide & Paiement à la Livraison !\n\nCliquez sur le lien pour commander maintenant 👇"
    },
    {
      title: "Variante 2 : Approche Bénéfices",
      text: "Imaginez-vous prête pour votre journée en un clin d'œil... ✨\n\nPlus besoin de passer des heures à vous coiffer. La Brosse Soufflante 5-en-1 s'adapte à TOUS les types de cheveux pour un résultat professionnel à chaque fois.\n\nPourquoi nous choisir ?\n💎 Qualité Premium\n🔥 Protection thermique avancée\n🚀 Déjà +2000 femmes conquises ce mois-ci !\n\nStock limité ! Profitez de la promo aujourd'hui seulement. 👇"
    }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Marketing Engine</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Publicité Facebook</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {ads.map((ad, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-300 group">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black tracking-tight">{ad.title}</h3>
              <button 
                onClick={() => handleCopy(ad.text, idx)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                {copiedIdx === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedIdx === idx ? "Copié !" : "Copier"}
              </button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{ad.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
