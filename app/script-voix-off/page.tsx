"use client";

import React, { useEffect, useState } from 'react';
import { Mic, Copy, Check, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';

const tools = [
  { name: "Minimax.io", url: "https://minimax.io", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { name: "Google AI Studio", url: "https://aistudio.google.com", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { name: "Eleven Labs", url: "https://elevenlabs.io", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { name: "TTS Maker", url: "https://ttsmaker.com", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
];

export default function ScriptVoixOffPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const getScripts = () => {
    if (!latestProduct?.voiceover_script) return [];
    return [
      { title: "Script 1 — Hook Principal", text: latestProduct.voiceover_script },
      {
        title: "Script 2 — Urgence",
        text: `Attention ! Ne ratez pas cette opportunité. ${latestProduct.product_name} est disponible en quantité limitée. Commandez maintenant, paiement à la livraison. Livraison rapide. Cliquez sur le lien !`
      },
      {
        title: "Script 3 — Offre Irrésistible",
        text: `Promotion exceptionnelle ! Le ${latestProduct.product_name} est en solde aujourd'hui uniquement. Zéro risque — vous payez à la livraison. Commandez maintenant avant rupture de stock !`
      }
    ];
  };

  const scripts = getScripts();

  const handleCopy = (idx: number) => {
    navigator.clipboard.writeText(scripts[idx].text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  // Empty state — nothing if no product analyzed
  if (!latestProduct) return (
    <div className="pt-20">
      <EmptyAnalysisState 
        icon={<Mic />} 
        title="Scripts Voix Off" 
        description="Les scripts de vente pour vos vidéos publicitaires seront générés ici une fois l'analyse terminée." 
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mic className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">{latestProduct.product_name}</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Scripts Voix Off</h2>
        </div>
      </div>

      {/* Tools */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {tools.map((tool, i) => (
          <a
            key={i}
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center justify-between p-4 ${tool.bg} rounded-2xl border border-transparent hover:border-primary-500/20 hover:scale-105 transition-all group`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${tool.color.replace('text', 'bg')}`} />
              <span className={`text-[10px] font-black uppercase ${tool.color}`}>{tool.name}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary-500" />
          </a>
        ))}
      </div>

      {/* Scripts */}
      <div className="space-y-6">
        {scripts.map((script, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black tracking-tight">{script.title}</h3>
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 20-45 SEC
                </span>
              </div>
              <button
                onClick={() => handleCopy(idx)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 shrink-0"
              >
                {copiedIdx === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIdx === idx ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <p className="text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-300 pl-4 border-l-4 border-purple-500/30">
              "{script.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
