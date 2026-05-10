"use client";

import React, { useEffect, useState } from 'react';
import { Mic, Copy, Check, Clock, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';

const tools = [
  { name: "Minimax.io", url: "https://minimax.io", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { name: "Google AI Studio", url: "https://aistudio.google.com", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { name: "Eleven Labs", url: "https://elevenlabs.io", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { name: "TTS Maker", url: "https://ttsmaker.com", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
];

const STRUCTURE_LABELS = [
  { key: 'presentation_probleme', label: '1. Présentation du Problème', icon: '😰', color: 'border-red-500' },
  { key: 'agitation_emotionnelle', label: '2. Agitation Émotionnelle', icon: '💔', color: 'border-amber-500' },
  { key: 'presentation_solution', label: '3. Présentation de la Solution', icon: '✨', color: 'border-emerald-500' },
  { key: 'preuve_temoignage', label: '4. Preuve / Témoignage', icon: '⭐', color: 'border-blue-500' },
  { key: 'call_to_action', label: '5. Call to Action', icon: '🔥', color: 'border-purple-500' },
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

  const getScriptData = () => {
    if (!latestProduct) return null;

    const raw = latestProduct.voiceover_script;
    const fbAd = latestProduct.facebook_ad_content;

    // Nouveau format : objet structuré video_script
    if (raw && typeof raw === 'object' && raw.text) {
      return raw;
    }

    // Ancien format : string simple
    if (typeof raw === 'string' && raw.length > 0) {
      return { text: raw, word_count: raw.split(/\s+/).length };
    }

    return null;
  };

  const scriptData = getScriptData();

  const getFullText = () => {
    if (!scriptData) return '';
    if (scriptData.text) return scriptData.text;
    if (scriptData.structure) {
      return Object.values(scriptData.structure).join(' ');
    }
    return '';
  };

  const fullText = getFullText();
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!latestProduct || !scriptData) return (
    <div className="pt-20">
      <EmptyAnalysisState 
        icon={<Mic />} 
        title="Scripts Voix Off" 
        description="Les scripts de vente pour vos vidéos publicitaires seront générés ici une fois l'analyse terminée." 
      />
    </div>
  );

  const hasStructure = scriptData.structure && typeof scriptData.structure === 'object';

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mic className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">{latestProduct.product_name}</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Script Voix Off</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${wordCount >= 80 && wordCount <= 180 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            <Clock className="w-3 h-3 inline mr-1" /> {wordCount} mots · {Math.round(wordCount / 3)}s
          </span>
          {(wordCount < 80 || wordCount > 180) && (
            <span className="px-3 py-2 bg-red-100 text-red-600 rounded-full text-[9px] font-black flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Hors limites (80-180)
            </span>
          )}
        </div>
      </div>

      {/* Outils TTS */}
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

      {/* Script complet */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black tracking-tight">Script Complet</h3>
          <button
            onClick={() => handleCopy(fullText, 99)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95"
          >
            {copiedIdx === 99 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedIdx === 99 ? 'Copié !' : 'Copier Tout'}
          </button>
        </div>
        <p className="text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-300 pl-4 border-l-4 border-purple-500/30">
          &ldquo;{fullText}&rdquo;
        </p>
      </div>

      {/* Structure détaillée (si disponible) */}
      {hasStructure && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2 mb-2">Décomposition par Phase</h3>
          {STRUCTURE_LABELS.map((phase, idx) => {
            const text = scriptData.structure[phase.key];
            if (!text) return null;
            return (
              <div key={idx} className={`bg-white dark:bg-slate-900 border-l-4 ${phase.color} border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {phase.icon} {phase.label}
                  </span>
                  <button
                    onClick={() => handleCopy(text, idx)}
                    className="text-[9px] font-black text-purple-600 uppercase hover:underline flex items-center gap-1"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedIdx === idx ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">{text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
