import React, { useState } from 'react';
import { VoixOffScript } from '@/lib/claude-prompts';
import { Mic, Copy, Play, Loader2, Download, Volume2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const TIKTOK_VOICES = [
  { id: 'fr_001', label: '👨 Homme (Français 1)', lang: 'fr-FR' },
  { id: 'fr_002', label: '👨 Homme (Français 2)', lang: 'fr-FR' },
  { id: 'en_us_001', label: '👩 Femme (Accent US Viral)', lang: 'en-US' },
  { id: 'en_us_002', label: '👩 Femme (Jessie Viral)', lang: 'en-US' },
];

const TTS_TOOLS = [
  { name: 'ElevenLabs', url: 'https://elevenlabs.io', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200', desc: 'IA ultra-réaliste' },
  { name: 'TTS Maker', url: 'https://ttsmaker.com', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', desc: 'Gratuit, multi-langues' },
  { name: 'Google AI Studio', url: 'https://aistudio.google.com', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', desc: 'Gemini TTS avancé' },
  { name: 'Minimax', url: 'https://www.minimaxi.com', color: 'bg-orange-100 text-orange-700', border: 'border-orange-200', desc: 'Voix africaines' },
];

export function VoixOffDisplay({ scripts }: { scripts: VoixOffScript[] }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(TIKTOK_VOICES[0].id);
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const playPreview = async () => {
    try {
      setPreviewingVoice(selectedVoice);
      const voice = TIKTOK_VOICES.find(v => v.id === selectedVoice);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Bonjour ! Ceci est un aperçu de ma voix pour vos vidéos.",
          voice: voice?.id,
        }),
      });

      if (!response.ok) throw new Error('Erreur');
      
      const data = await response.json();
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.onended = () => setPreviewingVoice(null);
      await audio.play();
    } catch (e) {
      setPreviewingVoice(null);
      toast.error("Impossible de lire l'aperçu");
    }
  };

  const generateAudio = async (text: string, idx: number) => {
    try {
      setGeneratingIdx(idx);
      const voice = TIKTOK_VOICES.find(v => v.id === selectedVoice);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voice?.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur API');
      }

      const data = await response.json();
      
      // Convertir base64 en URL jouable
      const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
      setAudioUrls(prev => ({ ...prev, [idx]: audioUrl }));
      toast.success('Voix générée avec succès !');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erreur lors de la génération. Clé API valide ?');
    } finally {
      setGeneratingIdx(null);
    }
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
            
            {/* Contrôles vocaux intégrés */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              
              {!audioUrls[script.numero] ? (
                <>
                  <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-3">
                    <Volume2 className="w-5 h-5 text-blue-500 hidden md:block" />
                    <select 
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      disabled={generatingIdx !== null || previewingVoice !== null}
                      className="w-full md:w-auto flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                      {TIKTOK_VOICES.map(voice => (
                        <option key={voice.id} value={voice.id}>{voice.label}</option>
                      ))}
                    </select>
                    <button 
                      onClick={playPreview}
                      disabled={previewingVoice !== null || generatingIdx !== null}
                      title="Écouter un aperçu"
                      className="p-2.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                      {previewingVoice !== null ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => generateAudio(script.texte, script.numero)}
                    disabled={generatingIdx === script.numero}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {generatingIdx === script.numero ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Création...</>
                    ) : (
                      <><Mic className="w-4 h-4" /> Générer la voix</>
                    )}
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col md:flex-row items-center gap-4">
                  <audio 
                    controls 
                    src={audioUrls[script.numero]} 
                    className="w-full flex-1 h-10"
                    autoPlay
                  />
                  <a
                    href={audioUrls[script.numero]}
                    download={`VoixOff_Script_${script.numero}.mp3`}
                    className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 px-6 py-2.5 rounded-xl text-sm font-bold transition-transform w-full md:w-auto"
                  >
                    <Download className="w-4 h-4" /> MP3
                  </a>
                  <button
                    onClick={() => {
                      const newUrls = { ...audioUrls };
                      delete newUrls[script.numero];
                      setAudioUrls(newUrls);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium underline"
                  >
                    Régénérer
                  </button>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-3xl md:rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">
          🎙️ Studio Vocal TikTok (Viral)
        </h3>
        
        <div className="relative z-10 text-sm text-slate-300 max-w-2xl leading-relaxed">
          <p className="mb-4">
            Ce module utilise les voix officielles générées par l'IA de <strong>TikTok</strong> (les plus populaires sur les réseaux sociaux). 
          </p>
          <p>
            C'est <strong>100% gratuit, illimité, et sans aucune clé API requise</strong>. Vous pouvez générer autant de voix off que vous le souhaitez pour vos publicités E-commerce.
          </p>
        </div>
      </div>

      {/* Outils TTS Externes */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-[3rem] p-6 md:p-10 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6">
          🔗 Autres Outils Vocaux Externes
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TTS_TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-3 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${tool.color}`}>
                  {tool.name}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {tool.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
