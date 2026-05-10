"use client";

import React, { useEffect, useState } from 'react';
import { Megaphone, Layout, Send, Copy, Check, Loader2, Zap, Target, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

const AD_ANGLES = [
  { icon: Zap, label: "Angle Problème", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10", border: "border-red-100 dark:border-red-800" },
  { icon: Target, label: "Angle Bénéfice", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-100 dark:border-blue-800" },
  { icon: Heart, label: "Angle Émotion", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/10", border: "border-purple-100 dark:border-purple-800" },
];

export default function PubliciteFacebookPage() {
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      const activeId = localStorage.getItem('activeAnalysisId');
      
      let query = supabase.from('analyses').select('*');
      
      if (activeId) {
        query = query.eq('id', activeId);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data } = await query;
      if (data && data[0]) setLatestProduct(data[0]);
      setLoading(false);
    }
    fetchAnalysis();
  }, []);

  const getAds = (): any[] => {
    if (!latestProduct?.facebook_ad_content) return [];
    const content = latestProduct.facebook_ad_content;
    
    // Nouveau format : tableau de 3 ads
    if (Array.isArray(content)) return content;
    
    // Ancien format : objet unique — convertir en tableau de 1
    return [{ 
      angle: "Publicité Principale",
      hook: content.headline || content.hook || '',
      explanation: content.primary_text || content.explanation || '',
      benefits: content.benefits || [],
      cta: content.cta || 'Commandez maintenant'
    }];
  };

  const ads = getAds();

  const handleCopy = (idx: number) => {
    const ad = ads[idx];
    const benefitsText = (ad.benefits || []).map((b: string) => `✔ ${b}`).join('\n');
    const text = `🔥 ${ad.hook}\n\n${ad.explanation}\n\n${benefitsText}\n\n${ad.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Publicité copiée !');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!latestProduct) return (
    <div className="max-w-7xl mx-auto pb-10 px-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 opacity-40">
        <Megaphone className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-600 mb-1">Publicité Facebook</p>
      <p className="text-[10px] font-bold text-slate-400 mb-6">Analysez un produit pour générer vos publicités.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Analyser un produit
      </Link>
    </div>
  );

  if (ads.length === 0) return (
    <div className="max-w-7xl mx-auto pb-10 px-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 opacity-40">
        <Megaphone className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-600 mb-1">Données publicitaires incomplètes</p>
      <p className="text-[10px] font-bold text-slate-400 mb-6">Relancez une analyse pour générer les 3 publicités.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Nouvelle Analyse
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
          <Megaphone className="w-4 h-4" /> {ads.length} Versions · 3 Angles Marketing
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">{latestProduct.product_name}</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Publicités Facebook Prêtes à l&apos;Emploi</p>
      </div>

      <div className="space-y-8">
        {ads.map((ad: any, idx: number) => {
          const angle = AD_ANGLES[idx] || AD_ANGLES[0];
          const AngleIcon = angle.icon;
          return (
            <div key={idx} className={`${angle.bg} border-2 ${angle.border} rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all`}>
              {/* Header */}
              <div className="p-6 border-b-2 border-inherit flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center ${angle.color}`}>
                    <AngleIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{ad.angle || angle.label}</p>
                    <p className="text-[9px] font-bold text-slate-400">Version {idx + 1} / {ads.length}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(idx)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copiedIdx === idx ? 'Copié !' : 'Copier'}
                </button>
              </div>

              {/* Contenu de la pub */}
              <div className="p-8 md:p-10 space-y-6 bg-white/60 dark:bg-slate-900/60">
                {/* Hook */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-2">🔥 Hook d&apos;Accroche</label>
                  <p className="text-xl font-black tracking-tight">{ad.hook}</p>
                </div>

                {/* Explication */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-2">Phrase d&apos;explication</label>
                  <p className="text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-300">{ad.explanation}</p>
                </div>

                {/* Bénéfices */}
                {ad.benefits && ad.benefits.length > 0 && (
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-3">Bénéfices</label>
                    <ul className="space-y-2">
                      {ad.benefits.map((benefit: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                          <span className={`mt-0.5 text-xs ${angle.color}`}>✔</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5 text-indigo-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Call to Action</span>
                    </div>
                    <span className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase">{ad.cta}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
