import React from 'react';
import { VoixOffScript } from '@/lib/claude-prompts';
import { Mic, Copy, ExternalLink, Play } from 'lucide-react';

const TTS_TOOLS = [
  { name: 'ElevenLabs', url: 'https://elevenlabs.io', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200', desc: 'IA ultra-réaliste' },
  { name: 'TTS Maker', url: 'https://ttsmaker.com', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', desc: 'Gratuit, multi-langues' },
  { name: 'Google AI Studio', url: 'https://aistudio.google.com', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', desc: 'Gemini TTS avancé' },
  { name: 'Minimax', url: 'https://www.minimaxi.com', color: 'bg-orange-100 text-orange-700', border: 'border-orange-200', desc: 'Voix africaines' },
];

export function VoixOffDisplay({ scripts }: { scripts: VoixOffScript[] }) {
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* 3 scripts */}
      <div className="grid grid-cols-1 gap-6">
        {scripts.map((script) => (
          <div key={script.numero} className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm hover:shadow-md transition-all group">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                      Script {script.numero}
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {script.technique}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {script.duree || `~${script.mots} mots`}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleCopy(script.texte, script.numero)}
                className={`p-3 rounded-xl transition-all ${
                  copiedIdx === script.numero 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-500 hover:text-white'
                }`}
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            
            {/* Texte du script — grand et lisible pour lecture au micro */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl p-5 md:p-7 text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-relaxed font-medium mb-6 relative">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Play className="w-12 h-12" />
              </div>
              <p className="relative z-10 italic">&ldquo;{script.texte}&rdquo;</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Prêt pour l'enregistrement
              </div>
              <button
                onClick={() => handleCopy(script.texte, script.numero)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {copiedIdx === script.numero ? 'Copié !' : 'Copier le script'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Outils TTS */}
      <div className="bg-slate-900 rounded-3xl md:rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 relative z-10">
          🎙️ Studio Vocal : Générez la voix
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {TTS_TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-3 p-5 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${tool.color}`}>
                  {tool.name}
                </span>
                <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white" />
              </div>
              <p className="text-xs text-white/60 font-medium">
                {tool.desc}
              </p>
            </a>
          ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3 text-white/40">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider">
            Conseil : Copiez le script → Collez dans l'outil → Téléchargez l'audio
          </p>
        </div>
      </div>
    </div>
  );
}
