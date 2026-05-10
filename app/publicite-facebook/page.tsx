"use client";

import React, { useEffect, useState } from 'react';
import { Megaphone, Layout, Send, Copy, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PubliciteFacebookPage() {
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    if (!latestProduct?.facebook_ad_content) return;
    const ad = latestProduct.facebook_ad_content;
    const text = `${ad.headline}\n\n${ad.primary_text}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Publicité copiée !');
    setTimeout(() => setCopied(false), 2000);
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
      <p className="text-[10px] font-bold text-slate-400 mb-6">Analysez un produit pour générer votre publicité.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Analyser un produit
      </Link>
    </div>
  );

  const ad = latestProduct.facebook_ad_content;

  if (!ad || !ad.headline) return (
    <div className="max-w-7xl mx-auto pb-10 px-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 opacity-40">
        <Megaphone className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-600 mb-1">Données publicitaires incomplètes</p>
      <p className="text-[10px] font-bold text-slate-400 mb-6">Relancez une analyse pour générer la publicité.</p>
      <Link href="/analyses" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">
        Nouvelle Analyse
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
          <Megaphone className="w-4 h-4" /> Ads Generator
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">{latestProduct.product_name}</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Publicité Prête à l'Emploi</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden">
        {/* Header de la carte pub */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Facebook Feed</p>
              <p className="text-[9px] font-bold text-slate-400">Aperçu de votre publicité</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>

        {/* Contenu de la pub */}
        <div className="p-10 space-y-8">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-3">Titre (Headline)</label>
            <p className="text-2xl font-black tracking-tight text-indigo-600">{ad.headline}</p>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-3">Texte Principal</label>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200 italic">"{ad.primary_text}"</p>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Appel à l'action conseillé</span>
              </div>
              <span className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase">Acheter Maintenant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
