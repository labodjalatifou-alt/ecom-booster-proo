"use client";

import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, Zap, Globe, DollarSign, User, Megaphone, Mic, CheckCircle2, ArrowRight, Plus, Minus, X, ImageIcon, Link as LinkIcon, FileText, ChevronRight, Brain, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';
import { sanitizeError } from '@/lib/utils';

export default function AnalysesPage() {
  const { currency } = useStore();
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (images.length + newFiles.length > 3) {
      toast.error('3 images maximum');
      return;
    }
    setImages(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim()) { toast.error('Le nom du produit est requis'); return; }
    if (!costPrice) { toast.error('Le prix d\'achat est requis pour le calcul de rentabilité'); return; }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const pays = "Afrique francophone (Côte d'Ivoire, Sénégal, etc.)";
      const categorie = "Produit e-commerce";
      
      const callClaude = async (promptObj: {system: string, user: string}, options: {parseJSON?: boolean} = {}) => {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system: promptObj.system, prompt: promptObj.user })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        let text: string = data.text;
        if (options.parseJSON) {
          // Stratégie 1 : parse direct (la route nettoie déjà)
          try { return JSON.parse(text); } catch {}
          // Stratégie 2 : retirer les blocs markdown ```json ... ```
          const stripped = text.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();
          try { return JSON.parse(stripped); } catch {}
          // Stratégie 3 : extraire le premier bloc JSON valide (objet {} ou tableau [])
          const extractJSON = (s: string): any => {
            for (let i = 0; i < s.length; i++) {
              if (s[i] !== '{' && s[i] !== '[') continue;
              const open = s[i] === '{' ? '{' : '[';
              const close = open === '{' ? '}' : ']';
              let depth = 0;
              let j = i;
              while (j < s.length) {
                if (s[j] === open) depth++;
                else if (s[j] === close) { depth--; if (depth === 0) break; }
                j++;
              }
              try { return JSON.parse(s.slice(i, j + 1)); } catch {}
            }
            throw new Error('Aucun JSON valide trouvé dans la réponse Claude');
          };
          return extractJSON(stripped || text);
        }
        return text;
      };


      const PROMPT_SCORE = {
        system: `Analyste e-commerce expert Afrique COD. SOIS CONCIS ET RAPIDE. Réponds UNIQUEMENT en JSON valide.`,
        user: `Analyse court: "${productName}", Achat: ${costPrice} ${currency}, Catégorie: ${categorie}, Pays: ${pays}.

JSON attendu :
{
  "score": 78,
  "score_label": "Bon",
  "score_color": "green",
  "prix_min": 120000,
  "prix_max": 180000,
  "prix_recommande": 149000,
  "marge_estimee": "65%",
  "raisonnement_prix": "1 phrase courte explicative.",
  "criteres": [
    {"nom": "Popularité", "score": 82, "commentaire": "Court"},
    {"nom": "Marketing", "score": 88, "commentaire": "Court"},
    {"nom": "Prix", "score": 72, "commentaire": "Court"},
    {"nom": "Concurrence", "score": 65, "commentaire": "Court"},
    {"nom": "Bénéfice", "score": 90, "commentaire": "Court"},
    {"nom": "Confiance COD", "score": 70, "commentaire": "Court"}
  ],
  "analyse_marketing": "2 phrases max.",
  "recommandations": ["Reco 1", "Reco 2", "Reco 3"]
}`
      };

      const PROMPT_AVATAR = {
        system: `Expert neuromarketing Afrique COD. Sois RAPIDE et CONCIS. JSON valide uniquement.`,
        user: `Avatar pour "${productName}" en ${pays}. Remplis ce JSON :
{
  "prenom": "Aminata",
  "sexe": "Femme",
  "age": "28-38 ans",
  "ville": "Conakry",
  "profession": "Commerçante",
  "revenu_mensuel": "500k-1M",
  "situation_familiale": "Mariée",
  "interets": ["Intérêt 1", "Intérêt 2"],
  "plateformes": ["Facebook", "TikTok"],
  "heure_active": "20h",
  "probleme_principal": "Court (1 phrase)",
  "desir_profond": "Court (1 phrase)",
  "peur_principale": "Peur arnaque/etc",
  "declencheurs_psychologiques": [
    {"type": "FOMO", "description": "Très court"},
    {"type": "Statut", "description": "Très court"}
  ],
  "comportement_achat": {
    "moment_decouverte": "1 phrase",
    "action_avant_achat": "1 phrase",
    "temps_decision": "1 phrase",
    "canal_achat": "1 phrase"
  },
  "objections": [
    {"objection": "Dit X", "vrai_blocage": "Pense Y", "reponse_ideale": "Réponse"},
    {"objection": "Dit A", "vrai_blocage": "Pense B", "reponse_ideale": "Réponse"}
  ],
  "declencheur_achat": "1 phrase",
  "mots_cles_resonance": ["mot1", "mot2", "mot3"],
  "citation_type": "Citation courte",
  "phrase_declenchante": "Accroche courte"
}`
      };

      // ÉTAPE 1: Score + Avatar en parallèle
      toast.loading("🔍 Analyse du marché africain en cours...", { id: 'analyze' });
      const [scoreData, avatarData] = await Promise.all([
        callClaude(PROMPT_SCORE, { parseJSON: true }),
        callClaude(PROMPT_AVATAR, { parseJSON: true })
      ]);

      const prixRecommande = scoreData.prix_recommande;
      const prenomAvatar = avatarData.prenom;
      const ageAvatar = avatarData.age;
      const professionAvatar = avatarData.profession;
      const problemeAvatar = avatarData.probleme_principal;
      const objectionPrixAvatar = avatarData.objection_prix;
      const paysAvatar = avatarData.ville;

      const PROMPT_PUBS = {
        system: `Copywriter Facebook Ads Afrique. SOIS BREF. JSON valide unique.`,
        user: `3 pubs pour "${productName}" à ${prixRecommande} ${currency}.
Problème: ${problemeAvatar}

JSON attendu :
[
  {
    "angle": "Douleur",
    "hook": "Titre accrocheur 1 ligne emojis",
    "explanation": "1 ligne intro",
    "benefits": ["✅ Atout 1 court", "🔥 Atout 2 court", "🚚 Atout 3 court"],
    "cta": "Action + Prix + Livraison"
  },
  {
    "angle": "Preuve Sociale",
    "hook": "Titre accrocheur 1 ligne emojis",
    "explanation": "1 ligne intro",
    "benefits": ["✅ Atout 1 court", "🔥 Atout 2 court", "🚚 Atout 3 court"],
    "cta": "Action + Prix + Livraison"
  },
  {
    "angle": "Urgence",
    "hook": "Titre accrocheur 1 ligne emojis",
    "explanation": "1 ligne intro",
    "benefits": ["✅ Atout 1 court", "🔥 Atout 2 court", "🚚 Atout 3 court"],
    "cta": "Action + Prix + Livraison"
  }
]`
      };

      const PROMPT_SHOPIFY = {
        system: `Copywriter e-commerce Afrique. Très concis.`,
        user: `Fiche Shopify pour "${productName}" à ${prixRecommande} ${currency}.

FORMAT ATTENDU EXACTEMENT COMME SUIT :
TITRE_1: [Titre court 1]
TITRE_2: [Titre court 2]
TITRE_3: [Titre court 3]
ACCROCHE_1: [Phrase courte]
ACCROCHE_2: [Phrase courte]
ACCROCHE_3: [Phrase courte]
§1_TITRE: Douleur
§1_TEXTE: [2 phrases]
§2_TITRE: Autorité
§2_TEXTE: [2 phrases]
§3_TITRE: Preuve Sociale
§3_TEXTE: [2 phrases]
§4_TITRE: Bénéfices
§4_TEXTE: [2 phrases]
§5_TITRE: Urgence
§5_TEXTE: [2 phrases]
§6_TITRE: Réassurance
§6_TEXTE: [2 phrases]
BULLET_1: [Puce 1]
BULLET_2: [Puce 2]
BULLET_3: [Puce 3]
BULLET_4: [Puce 4]
BULLET_5: [Puce 5]`
      };

      const PROMPT_VOIXOFF = {
        system: `Scripteur TikTok Ads Afrique. Très direct, sans fioritures.`,
        user: `3 scripts voix off pour "${productName}" à ${prixRecommande} ${currency}.
Chaque script DOIT faire ~40-60 mots (max 30 secondes).

FORMAT STRICT :
═══ SCRIPT 1 — Angle : Douleur ═══
[Texte: Problème → Solution → Fonctionnement → CTA]
⏱ 50 mots

═══ SCRIPT 2 — Angle : Quotidien ═══
[Texte: Problème → Solution → Fonctionnement → CTA]
⏱ 50 mots

═══ SCRIPT 3 — Angle : Aspiration ═══
[Texte: Problème → Solution → Fonctionnement → CTA]
⏱ 50 mots`
      };

      toast.loading("📱 Génération des publicités, fiche Shopify et scripts...", { id: 'analyze' });
      
      const [pubsText, shopifyText, voixOffText] = await Promise.all([
        callClaude(PROMPT_PUBS),
        callClaude(PROMPT_SHOPIFY),
        callClaude(PROMPT_VOIXOFF)
      ]);

      // Parseurs
      const parsePubs = (text: string) => {
        // Extracteur JSON robuste — supporte objets et tableaux imbriqués
        const extractFirstJSON = (s: string): any => {
          const clean = s.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();
          // Essai direct
          try { return JSON.parse(clean); } catch {}
          // Extraction par comptage de profondeur
          for (let i = 0; i < clean.length; i++) {
            if (clean[i] !== '[' && clean[i] !== '{') continue;
            const open = clean[i]; const close = open === '[' ? ']' : '}';
            let depth = 0; let j = i;
            while (j < clean.length) {
              if (clean[j] === open) depth++;
              else if (clean[j] === close) { depth--; if (depth === 0) break; }
              j++;
            }
            try { return JSON.parse(clean.slice(i, j + 1)); } catch {}
          }
          return null;
        };

        try {
          const parsed = extractFirstJSON(text);
          if (Array.isArray(parsed)) {
            return parsed.map((pub: any) => ({
              angle: pub.angle || 'Publicité',
              hook: pub.hook || '',
              explanation: pub.explanation || '',
              benefits: Array.isArray(pub.benefits) ? pub.benefits.slice(0, 4) : [],
              cta: pub.cta || ''
            }));
          }
        } catch (e) {
          console.error('parsePubs JSON error:', e);
        }

        // Fallback texte brut
        const pubs: any[] = [];
        const parts = text.split(/---PUB\d+---/);
        parts.forEach(part => {
          const clean = part.trim();
          if (clean.length > 20) {
            const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
            const hook = lines[0] || '';
            const benefits = lines.slice(1, -1)
              .filter(l => l.startsWith('-') || l.startsWith('*') || l.startsWith('•') || l.startsWith('✔') || l.length > 5)
              .map(l => l.replace(/^[-*•✔]\s*/, ''));
            const cta = lines[lines.length - 1] || '';
            pubs.push({ angle: 'Publicité', hook, explanation: '', benefits: benefits.slice(0, 4), cta });
          }
        });
        return pubs;
      };


      const parseVoixOff = (text: string) => {
        const scripts: any[] = [];
        // Séparer sur les séparateurs ═══ SCRIPT N ... ═══
        const separatorRegex = /═{3,}\s*(SCRIPT\s*\d+[^═]*?)═{3,}/g;
        const angles: string[] = [];
        let match;
        while ((match = separatorRegex.exec(text)) !== null) {
          angles.push(match[1].trim());
        }
        const parts = text.split(/═{3,}[^═]*═{3,}/);
        let scriptIndex = 0;
        parts.forEach(part => {
          const clean = part.trim();
          if (clean.length > 30) {
            const lines = clean.split('\n').filter(l => l.trim());
            // La dernière ligne peut être ⏱ N mots | ~X secondes OU Mots: N | Durée: X
            const lastLine = lines[lines.length - 1] || '';
            const isMetadata = lastLine.includes('⏱') || lastLine.toLowerCase().includes('mots') || lastLine.toLowerCase().includes('durée');
            const bodyLines = isMetadata ? lines.slice(0, -1) : lines;
            scripts.push({
              text: bodyLines.join('\n').trim(),
              angle: angles[scriptIndex] || `Script ${scriptIndex + 1}`,
              metadata: isMetadata ? lastLine : '',
              word_count: bodyLines.join(' ').split(/\s+/).filter(Boolean).length
            });
            scriptIndex++;
          }
        });
        return scripts;
      };


      const parseShopify = (text: string) => {
        const get = (key: string) => {
          const m = text.match(new RegExp(key + ':\\s*(.+)'));
          return m ? m[1].trim() : '';
        };
        const getAll = (key: string) => {
          const matches = [...text.matchAll(new RegExp(key + ':\\s*(.+)', 'g'))];
          return matches.map(m => m[1].trim());
        };
        const titres = [get('TITRE_1'), get('TITRE_2'), get('TITRE_3')].filter(Boolean);
        const accroches = [get('ACCROCHE_1'), get('ACCROCHE_2'), get('ACCROCHE_3')].filter(Boolean);
        const paragraphes = [];
        for (let i = 1; i <= 6; i++) {
          const titre = get(`§${i}_TITRE`);
          const texte = get(`§${i}_TEXTE`);
          if (titre) paragraphes.push({ title: titre, text: texte });
        }
        const bullets = getAll('BULLET_\\d');
        return { titles: titres, hook: accroches[0] || '', paragraphs: paragraphes, bullets };
      };

      const parsedPubs = parsePubs(pubsText);
      const parsedVoixOff = parseVoixOff(voixOffText);
      const parsedShopify = parseShopify(shopifyText);

      const result = {
        score: {
          total: scoreData.score,
          explication: scoreData.score_label,
          raisonnement_prix: scoreData.raisonnement_prix || '',
          prix_min: scoreData.prix_min,
          prix_max: scoreData.prix_max,
          marge_estimee: scoreData.marge_estimee,
          criteria: scoreData.criteres?.reduce((acc: any, curr: any) => {
             const key = curr.nom.replace(/[^a-zA-Z0-9]/g, '');
             acc[key] = { score: curr.score, justification: curr.commentaire };
             return acc;
          }, {}) || {}
        },
        launch_strategy: { 
          should_launch: scoreData.score >= 70 ? 'Recommandé' : 'Prudence', 
          strategy_text: scoreData.analyse_marketing 
        },
        price_recommendation: scoreData.prix_recommande,
        avatar: {
          // Champs démographiques
          sexe: avatarData.sexe,
          age: avatarData.age,
          prenom: avatarData.prenom,
          ville: avatarData.ville,
          profession: avatarData.profession,
          revenu_mensuel: avatarData.revenu_mensuel,
          situation_familiale: avatarData.situation_familiale,
          plateformes: avatarData.plateformes,
          heure_active: avatarData.heure_active,
          // Psychologie
          interets: Array.isArray(avatarData.interets) ? avatarData.interets : [avatarData.profession, avatarData.ville, avatarData.situation_familiale].filter(Boolean),
          frustrations: [avatarData.probleme_principal].filter(Boolean),
          peurs: [avatarData.peur_principale].filter(Boolean),
          desirs: [avatarData.desir_profond].filter(Boolean),
          // Neuromarketing (nouveaux champs)
          declencheurs_psychologiques: avatarData.declencheurs_psychologiques || [],
          comportement_achat: avatarData.comportement_achat || {},
          objections: avatarData.objections || [],
          declencheur_achat: avatarData.declencheur_achat || '',
          mots_cles_resonance: avatarData.mots_cles_resonance || [],
          // Phrases clés
          phrase_declenchante: avatarData.phrase_declenchante || avatarData.citation_type || '',
          citation_type: avatarData.citation_type || '',
          // Garde tous les champs bruts
          ...avatarData
        },
        shopify_page: parsedShopify,
        facebook_ads: parsedPubs,
        video_scripts: parsedVoixOff
      };

      setAnalysisResult(result);

      // Convert JSON to Raw format for immediate availability in sub-pages
      const shopifyRaw = shopifyText;
      const scriptsRaw = voixOffText;

      // Save to Supabase
      const { data: savedData, error: saveError } = await supabase.from('analyses').insert([{
        id: crypto.randomUUID(),
        product_name: productName,
        score: result.score.total,
        score_details: result.score,
        price_recommendation: result.price_recommendation,
        cost_price: costPrice,
        customer_avatar: result.avatar,
        shopify_page_content: result.shopify_page,
        shopify_page_raw: shopifyRaw,
        facebook_ad_content: result.facebook_ads,
        launch_strategy: result.launch_strategy,
        voiceover_script: result.video_scripts,
        voiceover_script_raw: scriptsRaw
      }]).select();

      if (saveError) throw saveError;

      if (savedData && savedData[0]) {
        localStorage.setItem('activeAnalysisId', savedData[0].id);
      }

      toast.success('✅ Analyse stratégique terminée !', { id: 'analyze' });
    } catch (err: any) {
      toast.error(sanitizeError(err), { id: 'analyze' });
    } finally {
      setLoading(false);
    }
  }

  // --- RESULTS VIEW ---
  if (analysisResult) {
    type ResultCard = { href: string; icon: React.ReactNode; iconBg: string; badge: string | null; badgeColor: string; badgeLabel: string; title: string; desc: string; cta: string; accent: string; };
    const RESULT_CARDS: ResultCard[] = [
      { href: '/score-et-prix', icon: <Zap className="w-6 h-6" />, iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', badge: `${analysisResult.score?.total ?? analysisResult.score ?? 0}%`, badgeColor: 'text-amber-500', badgeLabel: 'Potentiel', title: 'Score & Rentabilité', desc: `Prix conseillé : ${analysisResult.price_recommendation ?? '-'}`, cta: 'Voir les chiffres', accent: 'hover:border-amber-400' },
      { href: '/avatar', icon: <User className="w-6 h-6" />, iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', badge: null, badgeColor: '', badgeLabel: '', title: 'Avatar Client', desc: 'Déclencheurs psychologiques, objections et parcours d\'achat.', cta: 'Voir le profil', accent: 'hover:border-blue-400' },
      { href: '/page-shopify', icon: <Globe className="w-6 h-6" />, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', badge: null, badgeColor: '', badgeLabel: '', title: 'Page Shopify', desc: 'Fiche produit avec les 6 principes de Cialdini.', cta: 'Voir la fiche', accent: 'hover:border-emerald-400' },
      { href: '/publicites', icon: <Megaphone className="w-6 h-6" />, iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600', badge: '3', badgeColor: 'text-rose-500', badgeLabel: 'Pubs', title: 'Publicités Facebook', desc: 'Angles Douleur, Preuve Sociale & Urgence avec accroches choc.', cta: 'Voir les pubs', accent: 'hover:border-rose-400' },
      { href: '/script-voix-off', icon: <Mic className="w-6 h-6" />, iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600', badge: '3', badgeColor: 'text-violet-500', badgeLabel: 'Scripts', title: 'Scripts Voix Off', desc: '3 scripts 25-40s • Accroche → Solution → Fonctionnement → CTA.', cta: 'Voir les scripts', accent: 'hover:border-violet-400' },
      { href: '/image-ia', icon: <ImageIcon className="w-6 h-6" />, iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600', badge: '7', badgeColor: 'text-indigo-500', badgeLabel: 'Visuels', title: 'Images Produit IA', desc: 'Studio, lifestyle, flat lay + avantages en overlay.', cta: 'Générer les images', accent: 'hover:border-indigo-400' },
    ];

    return (
      <div className="max-w-5xl mx-auto pb-20 px-4">

        {/* Hero résultat — fade in */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationFillMode: 'both' }}>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20 shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Analyse Stratégique Complète
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3 text-slate-800 dark:text-white">{productName}</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">IA Neuromarketing — Marché Africain COD</p>

          {/* Résumé score inline */}
          <div className="mt-8 inline-flex items-center gap-6 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl divide-x divide-slate-200 dark:divide-slate-700">
            <div className="text-center pr-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
              <p className="text-3xl font-black text-amber-500">{analysisResult.score?.total ?? analysisResult.score ?? '-'}%</p>
            </div>
            <div className="text-center px-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix Conseillé</p>
              <p className="text-xl font-black text-primary-600">{analysisResult.price_recommendation ?? '-'}</p>
            </div>
            <div className="text-center pl-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Décision</p>
              <p className="text-sm font-black text-emerald-600">{analysisResult.launch_strategy?.should_launch ?? 'OK'}</p>
            </div>
          </div>
        </div>

        {/* Cards staggerées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {RESULT_CARDS.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-7 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 ${card.accent} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl shadow-sm animate-in fade-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${i * 80}ms`, animationDuration: '500ms', animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/60 to-transparent dark:from-slate-800/60 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div className={`p-3.5 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  {card.badge && (
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{card.badgeLabel}</span>
                      <p className={`text-3xl font-black ${card.badgeColor}`}>{card.badge}</p>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-black mb-2 tracking-tight text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors duration-300">{card.title}</h3>
                <p className="text-xs text-slate-400 font-bold mb-5 leading-relaxed line-clamp-2">{card.desc}</p>
                <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest">
                  {card.cta} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => { setAnalysisResult(null); setProductName(''); setProductDesc(''); setSourceLink(''); setCostPrice(''); setImages([]); }}
            className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            ← Analyser un autre produit
          </button>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col items-center text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Moteur IA 2.1 Prêt</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-slate-800 dark:text-white leading-tight">
          L'Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">Stratégique</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
          Générez votre page Shopify, vos scripts publicitaires et obtenez une analyse complète du marché en un seul clic. L'outil ultime pour le neuromarketing.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-slate-800/40 dark:to-slate-800/0 pointer-events-none" />
        
        <form onSubmit={handleAnalyze} className="relative z-10 p-5 md:p-12 space-y-8 md:space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12">
            {/* Nom Produit */}
            <div className="space-y-4 relative group/input">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                  <FileText className="w-4 h-4" /> Nom du Produit <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="Ex: Robot Mixeur Premium"
                  className="w-full bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl px-4 py-4 md:px-6 md:py-5 text-sm md:text-base font-black outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Prix Achat */}
            <div className="space-y-4 relative group/input">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                <DollarSign className="w-4 h-4" /> Prix d'Achat ({currency}) <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setCostPrice(String(Math.max(0, (Number(costPrice) || 0) - 500)))} 
                  className="px-4 py-4 md:px-6 md:py-5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  required
                  type="number"
                  step="500"
                  value={costPrice}
                  onChange={e => setCostPrice(e.target.value)}
                  placeholder="Ex: 4500"
                  className="flex-1 text-center bg-transparent border-none py-4 md:py-5 text-base md:text-lg font-black outline-none text-primary-600 dark:text-primary-400 placeholder:text-slate-300 dark:placeholder:text-slate-700 appearance-none"
                />
                <button 
                  type="button" 
                  onClick={() => setCostPrice(String((Number(costPrice) || 0) + 500))} 
                  className="px-4 py-4 md:px-6 md:py-5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12">
            {/* Lien Source */}
            <div className="space-y-4 relative group/input">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                <LinkIcon className="w-4 h-4" /> Lien Source <span className="opacity-50">(Optionnel)</span>
              </label>
              <input
                type="url"
                value={sourceLink}
                onChange={e => setSourceLink(e.target.value)}
                placeholder="https://alibaba.com/item/..."
                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-5 text-sm font-bold outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700 placeholder:text-slate-300 dark:placeholder:text-slate-700"
              />
            </div>

            {/* Description */}
            <div className="space-y-4 relative group/input">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                <Bot className="w-4 h-4" /> Informations clés <span className="opacity-50">(Optionnel)</span>
              </label>
              <textarea
                value={productDesc}
                onChange={e => setProductDesc(e.target.value)}
                placeholder="Décrivez les avantages spécifiques..."
                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl px-4 py-4 md:px-6 md:py-5 text-sm font-bold outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[100px] resize-y hover:border-slate-200 dark:hover:border-slate-700 placeholder:text-slate-300 dark:placeholder:text-slate-700 scrollbar-hide"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Photos du Produit
              </label>
              <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">Max 3 images</span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {images.map((img, i) => (
                <div key={i} className="relative w-40 h-40 flex-shrink-0 snap-start rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm group">
                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors hover:scale-110 shadow-xl"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {images.length < 3 && (
                <label className="cursor-pointer flex-shrink-0 w-40 h-40 snap-start border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-400 dark:hover:border-primary-500 transition-all group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageAdd} />
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-all">
                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-primary-500 uppercase tracking-widest transition-colors">Ajouter</span>
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-8 border-t border-slate-100 dark:border-slate-800/50">
            <button
              type="submit"
              disabled={loading}
              className="relative w-full md:w-auto group overflow-hidden px-8 py-5 md:px-12 md:py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black uppercase tracking-widest md:tracking-[0.2em] text-[10px] md:text-xs shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {loading ? (
                <div className="relative z-10 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyse des données...
                </div>
              ) : (
                <div className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5 text-primary-400 group-hover:text-white transition-colors" /> 
                  <span>Lancer l'Analyse</span>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
