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

const ANGLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Problème': { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-600', border: 'border-red-200 dark:border-red-800' },
  'Transformation': { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800' },
  'Urgence': { bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-600', border: 'border-amber-200 dark:border-amber-800' },
};

export default function ScriptVoixOffPage() {
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

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

  // Parse scripts — support both old (single) and new (array) format
  const getScripts = (): any[] => {
    if (!latestProduct) return [];
    const raw = latestProduct.voiceover_script;

    // New format: array of scripts
    if (Array.isArray(raw)) {
      return raw;
    }

    // Object with text property (old single script)
    if (raw && typeof raw === 'object' && raw.text) {
      return [{ angle: 'Script Principal', text: raw.text, word_count: raw.word_count, structure: raw.structure }];
    }

    // Plain string (very old format)
    if (typeof raw === 'string' && raw.length > 0) {
      return [{ angle: 'Script Principal', text: raw, word_count: raw.split(/\s+/).length }];
    }

    return [];
  };

  const scripts = getScripts();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!latestProduct || scripts.length === 0) return (
    <div className="pt-20">
      <EmptyAnalysisState 
        icon={<Mic />} 
        title="Scripts Voix Off" 
        description="Les scripts de vente pour vos vidéos publicitaires seront générés ici une fois l'analyse terminée." 
      />
    </div>
  );

  const activeScript = scripts[activeTab] || scripts[0];
  const fullText = activeScript?.text || (activeScript?.structure ? Object.values(activeScript.structure).join(' ') : '');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const hasStructure = activeScript?.structure && typeof activeScript.structure === 'object';

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
          <h2 className="text-4xl font-black tracking-tighter">Scripts Voix Off</h2>
          <p className="text-slate-400 text-xs font-bold mt-1">
            {scripts.length} script{scripts.length > 1 ? 's' : ''} · {scripts.length > 1 ? '3 angles marketing' : '1 angle'}
          </p>
        </div>
      </div>

      {/* TTS Tools */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {tools.map((tool, i) => (
          <a key={i} href={tool.url} target="_blank" rel="noreferrer" className={`flex items-center justify-between p-4 ${tool.bg} rounded-2xl border border-transparent hover:border-primary-500/20 hover:scale-105 transition-all group`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${tool.color.replace('text', 'bg')}`} />
              <span className={`text-[10px] font-black uppercase ${tool.color}`}>{tool.name}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary-500" />
          </a>
        ))}
      </div>

      {/* Script Tabs — only show if multiple scripts */}
      {scripts.length > 1 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          {scripts.map((script: any, idx: number) => {
            const angleKey = script.angle || `Script ${idx + 1}`;
            const colors = ANGLE_COLORS[angleKey] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
            const wc = (script.text || '').split(/\s+/).filter(Boolean).length;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  activeTab === idx
                    ? `${colors.bg} ${colors.text} ${colors.border} shadow-lg`
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                }`}
              >
                {script.angle || `Script ${idx + 1}`}
                <span className="ml-2 text-[8px] opacity-60">{wc} mots</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Script Word Count Badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${wordCount >= 80 && wordCount <= 180 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          <Clock className="w-3 h-3 inline mr-1" /> {wordCount} mots · ~{Math.round(wordCount / 3)}s
        </span>
        {(wordCount < 80 || wordCount > 180) && (
          <span className="px-3 py-2 bg-red-100 text-red-600 rounded-full text-[9px] font-black flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Hors limites (80-180)
          </span>
        )}
        {activeScript?.angle && (
          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${(ANGLE_COLORS[activeScript.angle] || { bg: 'bg-slate-100', text: 'text-slate-600' }).bg} ${(ANGLE_COLORS[activeScript.angle] || { text: 'text-slate-600' }).text}`}>
            Angle : {activeScript.angle}
          </span>
        )}
      </div>

      {/* Full Script */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black tracking-tight">Script Complet</h3>
          <button
            onClick={() => handleCopy(fullText, `full-${activeTab}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95"
          >
            {copiedIdx === `full-${activeTab}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedIdx === `full-${activeTab}` ? 'Copié !' : 'Copier Tout'}
          </button>
        </div>
        <p className="text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-300 pl-4 border-l-4 border-purple-500/30">
          &ldquo;{fullText}&rdquo;
        </p>
      </div>

      {/* Structure breakdown */}
      {hasStructure && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2 mb-2">Décomposition par Phase</h3>
          {STRUCTURE_LABELS.map((phase, idx) => {
            const text = activeScript.structure[phase.key];
            if (!text) return null;
            return (
              <div key={idx} className={`bg-white dark:bg-slate-900 border-l-4 ${phase.color} border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {phase.icon} {phase.label}
                  </span>
                  <button
                    onClick={() => handleCopy(text, `${activeTab}-${idx}`)}
                    className="text-[9px] font-black text-purple-600 uppercase hover:underline flex items-center gap-1"
                  >
                    {copiedIdx === `${activeTab}-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedIdx === `${activeTab}-${idx}` ? 'Copié' : 'Copier'}
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
