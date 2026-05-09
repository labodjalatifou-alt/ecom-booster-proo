"use client";

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIAdvisor() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!prompt) return;
    setLoading(true);
    setResponse('');
    
    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contextType: 'sales_analysis' }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResponse(data.text);
    } catch (err: any) {
      toast.error("Erreur IA : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group mb-10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-white/20"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter">Claude Strategist</h3>
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">Ton conseiller IA personnel</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Zone de discussion */}
          {(response || loading) && (
            <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 min-h-[150px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-500 rounded-lg"><Bot className="w-5 h-5 text-white" /></div>
                <div className="flex-1">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Analyse Strategique</div>
                   {loading ? (
                     <div className="flex items-center gap-2 text-white/70 italic text-sm">
                       <Loader2 className="w-4 h-4 animate-spin" /> Claude analyse tes données...
                     </div>
                   ) : (
                     <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{response}</p>
                   )}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="relative">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askAI()}
              placeholder="Ex: Analyse mes ventes de la semaine et donne moi 3 conseils..."
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-5 px-8 outline-none focus:border-white/40 transition-all placeholder:text-white/30 text-sm font-bold pr-20"
            />
            <button 
              onClick={askAI}
              disabled={loading}
              className="absolute right-3 top-2 bottom-2 px-6 bg-white text-primary-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-50 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => setPrompt("Comment augmenter mon taux de livraison à Dakar ?")} className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all">📈 Booster Dakar</button>
             <button onClick={() => setPrompt("Quels sont les meilleurs scripts pour mes Closers ?")} className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all">💬 Scripts Closer</button>
             <button onClick={() => setPrompt("Analyse la rentabilité de mes produits")} className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all">💰 Rentabilité</button>
          </div>
        </div>
      </div>
    </div>
  );
}
