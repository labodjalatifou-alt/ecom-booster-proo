"use client";

import React, { useState } from 'react';
import { Mic, Copy, Check, Clock, ExternalLink, Sparkles } from 'lucide-react';

export default function ScriptVoixOffPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const tools = [
    { name: "Minimax.io", url: "https://minimax.io", iconColor: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { name: "Google IA Studio", url: "https://aistudio.google.com", iconColor: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { name: "Eleven Labs", url: "https://elevenlabs.io", iconColor: "text-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
    { name: "TTS Maker", url: "https://ttsmaker.com", iconColor: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  const scripts = [
    {
      title: "Script 1 : Le Hook Douleur",
      text: "Est-ce que vous passez aussi des heures devant le miroir chaque matin à vous battre avec vos cheveux ? La chaleur des fers classiques abîme votre fibre capillaire et les passages au salon coûtent une fortune sur le long terme. C'est pour cela que nous avons créé la Brosse Soufflante 5-en-1. Elle sèche, lisse et boucle sans jamais brûler vos cheveux grâce à sa technologie ionique brevetée. Regardez ce résultat en un seul passage ! Profitez de notre promo spéciale 24H. Cliquez sur le lien en bas pour commander et payez seulement à la livraison !"
    },
    {
      title: "Script 2 : La Vitesse (Social Proof)",
      text: "Soyez prête pour votre rendez-vous en moins de 10 minutes, douche comprise ! Plus besoin de choisir entre être à l'heure et être bien coiffée. La Brosse 5-en-1 fait tout le travail pour vous, plus besoin d'un sèche-cheveux et d'un lisseur séparés. C'est le secret des femmes actives qui rayonnent sans effort au bureau comme en soirée. Ne laissez plus vos cheveux vous dicter votre planning. Livraison rapide partout au pays et paiement sécurisé à la réception de votre colis. Commandez la vôtre maintenant !"
    },
    {
      title: "Script 3 : L'Offre Irrésistible",
      text: "Écoutez bien, ceci n'est pas une simple brosse. C'est votre nouveau styliste personnel à domicile. Imaginez avoir un brushing parfait tous les jours sans dépenser un centime en salon. Nos stocks s'épuisent à vue d'œil car c'est le produit préféré des influenceuses cette saison. Pour les 50 prochaines commandes, nous offrons une réduction exceptionnelle et la livraison est gratuite. Ne prenez aucun risque : vous commandez, nous livrons, et vous ne payez qu'une fois le colis entre vos mains. Cliquez vite !"
    }
  ];

  const handleCopy = (idx: number) => {
    navigator.clipboard.writeText(scripts[idx].text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mic className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Neuromarketing Audio</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Scripts Voix Off</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
        {tools.map((tool, i) => (
          <a key={i} href={tool.url} target="_blank" className={`flex items-center justify-between p-4 md:p-5 ${tool.bgColor} rounded-2xl md:rounded-3xl border border-transparent hover:border-primary-500/30 hover:scale-105 transition-all group`}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`w-2 h-2 rounded-full ${tool.iconColor.replace('text', 'bg')}`}></div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-tight">{tool.name}</span>
            </div>
            <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
          </a>
        ))}
      </div>

      <div className="space-y-6 md:space-y-8">
        {scripts.map((script, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm hover:shadow-2xl transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3 md:gap-4">
                <h3 className="text-lg md:text-xl font-black tracking-tight">{script.title}</h3>
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" /> 20-45 SEC
                </span>
              </div>
              <button 
                onClick={() => handleCopy(idx)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-purple-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:bg-purple-700 transition-all active:scale-95"
              >
                {copiedIdx === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedIdx === idx ? "Copié !" : "Copier"}
              </button>
            </div>
            <p className="text-sm md:text-lg font-medium leading-relaxed italic text-slate-600 dark:text-slate-300 pl-4 border-l-4 border-purple-500/30">"{script.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
