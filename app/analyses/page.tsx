"use client";

import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, Zap, Globe, DollarSign, User, Megaphone, Mic, CheckCircle2, ArrowRight, Plus, Minus, X, ImageIcon, Link as LinkIcon, FileText, ChevronRight } from 'lucide-react';
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
        let text = data.text;
        if (options.parseJSON) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          return JSON.parse(jsonMatch ? jsonMatch[0] : text);
        }
        return text;
      };

      const PROMPT_SCORE = {
        system: `Tu es un analyste e-commerce expert du marché africain COD (Cash On Delivery). 
Tu connais parfaitement les habitudes d'achat en Guinée, Sénégal, Côte d'Ivoire, Togo, Mali.
Réponds UNIQUEMENT en JSON valide. Pas de markdown, pas de backticks, pas d'explication.`,
        user: `Analyse ce produit pour le marché e-commerce africain COD.

Produit: "${productName}"
Prix d'achat: ${costPrice} ${currency}
Description: ${productDesc || 'Non fournie'}
Catégorie: ${categorie}
Pays cible: ${pays}

Réponds avec ce JSON exact:
{
  "score": 78,
  "score_label": "Bon potentiel",
  "score_color": "green",
  "prix_min": 120000,
  "prix_max": 180000,
  "prix_recommande": 149000,
  "marge_estimee": "65%",
  "criteres": [
    {"nom": "Popularité en Afrique", "score": 82, "commentaire": "Très demandé en Guinée et Sénégal"},
    {"nom": "Facilité de marketing", "score": 88, "commentaire": "Visuel fort, démonstration facile"},
    {"nom": "Prix adapté au marché", "score": 72, "commentaire": "Dans la fourchette acceptable"},
    {"nom": "Niveau de concurrence", "score": 65, "commentaire": "Quelques vendeurs actifs"},
    {"nom": "Clarté du bénéfice", "score": 90, "commentaire": "Résultat visible rapidement"},
    {"nom": "Tendance actuelle", "score": 75, "commentaire": "En croissance sur TikTok Afrique"},
    {"nom": "Confiance à l'achat", "score": 70, "commentaire": "Paiement à la livraison rassure"}
  ],
  "analyse_marketing": "Texte d'analyse de 3-4 phrases sur le potentiel du produit pour ce marché spécifique.",
  "recommandations": [
    "Recommandation concrète 1 pour maximiser les ventes",
    "Recommandation concrète 2",
    "Recommandation concrète 3"
  ]
}`
      };

      const PROMPT_AVATAR = {
        system: `Tu es un expert en psychologie du consommateur africain et en marketing COD.
Réponds UNIQUEMENT en JSON valide. Aucun texte avant ou après.`,
        user: `Crée l'avatar client idéal pour ce produit.

Produit: "${productName}"
Catégorie: ${categorie}

JSON exact à retourner:
{
  "prenom": "Aminata",
  "sexe": "Femme",
  "age": "28-38 ans",
  "ville": "Conakry, Guinée",
  "profession": "Commerçante / Fonctionnaire",
  "revenu_mensuel": "500 000 - 1 500 000 GNF",
  "situation_familiale": "Mariée, 2 enfants",
  "plateformes": ["Facebook", "WhatsApp", "TikTok"],
  "heure_active": "19h - 22h",
  "probleme_principal": "Description du problème que ce produit résout pour elle",
  "desir_profond": "Ce qu'elle veut vraiment obtenir avec ce produit",
  "peur_principale": "Sa plus grande crainte avant d'acheter (arnaque, qualité...)",
  "objection_prix": "Ce qu'elle dit quand le prix lui semble élevé",
  "declencheur_achat": "Ce qui la fait passer à l'action et commander",
  "mots_cles_resonance": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "citation_type": "Une phrase qu'elle dirait exactement sur ce produit dans ses propres mots"
}`
      };

      // ÉTAPE 1: Score + Avatar en parallèle
      toast.loading("Génération du score et profil...", { id: 'analyze' });
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
        system: `Tu es David Ogilvy + Eugene Schwartz + un vendeur de marché africain.
Tu écris des publicités Facebook qui font VENDRE en Afrique francophone.
Tu connais les codes culturels, les expressions locales, les émotions qui déclenchent l'achat.
Règle absolue: chaque pub doit donner envie de commander MAINTENANT.`,
        user: `Écris 3 publicités Facebook DISTINCTES pour ce produit.

Produit: "${productName}"
Prix: ${prixRecommande} ${currency}  
Marché: ${pays}
Avatar: ${prenomAvatar}, ${ageAvatar}, ${professionAvatar}
Problème résolu: ${problemeAvatar}

RÈGLES STRICTES:
- PUB 1: Angle DOULEUR (commence par le problème, aggrave, puis solution)
- PUB 2: Angle PREUVE SOCIALE (témoignage fictif réaliste, chiffres)
- PUB 3: Angle URGENCE + RARETÉ (offre limitée, stock, prix temporaire)
- Chaque pub: 4 à 6 lignes maximum
- Ton: naturel, chaleureux, comme une amie qui recommande
- Inclure emoji au bon endroit (pas partout)
- Finir par CTA clair avec prix et "Paiement à la livraison"
- PAS de "Objet:" ou "Accroche:" — juste le texte pur de la pub

FORMAT DE RÉPONSE:
---PUB1---
[texte complet de la pub 1]
---PUB2---
[texte complet de la pub 2]
---PUB3---
[texte complet de la pub 3]`
      };

      const PROMPT_SHOPIFY = {
        system: `Tu es un copywriter expert en neuromarketing qui vend en Afrique francophone.
Tu utilises les 6 principes de Cialdini. Tes titres font maximum 5 mots.
Chaque paragraphe = exactement 3 phrases qui font ressentir, désirer, agir.`,
        user: `Crée la fiche produit Shopify pour "${productName}" à ${prixRecommande} ${currency} en ${pays}.

FORMAT STRICT — respecte à la lettre:

TITRE_1: [5 mots max, SEO + émotion]
TITRE_2: [5 mots max, bénéfice transformateur]  
TITRE_3: [5 mots max, preuve sociale chiffrée]

ACCROCHE_1: [1 phrase - question ou affirmation choc]
ACCROCHE_2: [1 phrase - la transformation promise]
ACCROCHE_3: [1 phrase - garantie rassurante]

§1_TITRE: [3-5 mots - Principe: DOULEUR]
§1_TEXTE: [Phrase 1 décrit la douleur.] [Phrase 2 aggrave.] [Phrase 3 annonce la solution.]

§2_TITRE: [3-5 mots - Principe: AUTORITÉ]
§2_TEXTE: [Phrase 1 crédibilité.] [Phrase 2 chiffre ou expertise.] [Phrase 3 confiance.]

§3_TITRE: [3-5 mots - Principe: PREUVE SOCIALE]
§3_TEXTE: [Phrase 1 nombre de clientes.] [Phrase 2 témoignage type.] [Phrase 3 communauté.]

§4_TITRE: [3-5 mots - Principe: BÉNÉFICES]
§4_TEXTE: [Phrase 1 résultat principal.] [Phrase 2 résultat secondaire.] [Phrase 3 vie transformée.]

§5_TITRE: [3-5 mots - Principe: URGENCE]
§5_TEXTE: [Phrase 1 stock limité.] [Phrase 2 conséquence de ne pas acheter.] [Phrase 3 agis maintenant.]

§6_TITRE: [3-5 mots - Principe: RÉASSURANCE]
§6_TEXTE: [Phrase 1 paiement à la livraison.] [Phrase 2 livraison rapide.] [Phrase 3 satisfaction garantie.]

BULLET_1: [caractéristique en 6 mots max]
BULLET_2: [caractéristique en 6 mots max]
BULLET_3: [caractéristique en 6 mots max]
BULLET_4: [caractéristique en 6 mots max]
BULLET_5: [caractéristique en 6 mots max]`
      };

      const PROMPT_VOIXOFF = {
        system: `Tu es expert en scripts publicitaires vidéo pour TikTok, Facebook Reels, YouTube Shorts.
Tu travailles pour le marché africain francophone.
RÈGLE ABSOLUE: le script s'écrit comme on le LIT au micro — texte continu, pas de labels.
Il ne faut JAMAIS utiliser de prénoms ou noms de personnages (ex: "Voici Marc" ou "Sophie avait un problème"). Ça doit faire naturel et s'adresser directement au spectateur ("Vous en avez marre de...").
COMPTE LES MOTS avant de livrer. Respecte les durées demandées.`,
        user: `Crée 3 scripts voix off pour "${productName}" à ${prixRecommande} ${currency} — marché ${pays}.

CONTRAINTES STRICTES:
Tous les scripts doivent utiliser la structure PROBLÈME / SOLUTION.
- Script 1: 45-55 mots (20-25 secondes) — Format court direct
- Script 2: 70-85 mots (30-35 secondes) — Format moyen explicatif
- Script 3: 100-115 mots (42-48 secondes) — Format long détaillé avec garantie

FORMAT EXACT:
═══ SCRIPT 1 — Problème/Solution Court | 20-25 sec ═══
[Script complet lu au micro, sans interruption]
Mots: [nombre] | Durée: [X secondes]

═══ SCRIPT 2 — Problème/Solution Moyen | 30-35 sec ═══
[Script complet lu au micro, sans interruption]
Mots: [nombre] | Durée: [X secondes]

═══ SCRIPT 3 — Problème/Solution Long | 42-48 sec ═══
[Script complet lu au micro, sans interruption]
Mots: [nombre] | Durée: [X secondes]`
      };

      toast.loading("Génération du marketing (Pubs, Shopify, Scripts)...", { id: 'analyze' });
      
      const [pubsText, shopifyText, voixOffText] = await Promise.all([
        callClaude(PROMPT_PUBS),
        callClaude(PROMPT_SHOPIFY),
        callClaude(PROMPT_VOIXOFF)
      ]);

      // Parseurs
      const parsePubs = (text: string) => {
        const pubs: any[] = [];
        const parts = text.split(/---PUB\d+---/);
        parts.forEach(part => {
          const clean = part.trim();
          if (clean.length > 20) pubs.push({ text: clean });
        });
        return pubs;
      };

      const parseVoixOff = (text: string) => {
        const scripts: any[] = [];
        const parts = text.split(/═{3,}[^═]+═{3,}/);
        parts.forEach(part => {
          const clean = part.trim();
          if (clean.length > 30) {
            const lines = clean.split('\n').filter(l => l.trim());
            const lastLine = lines[lines.length - 1];
            const isMetadata = lastLine.toLowerCase().includes('mots:');
            scripts.push({
              text: isMetadata ? lines.slice(0,-1).join('\n') : lines.join('\n'),
              angle: isMetadata ? lastLine : 'Script',
              word_count: 0
            });
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

      // Reconstruct combined result to match the expected format of the UI
      const result = {
        score: {
          total: scoreData.score,
          explication: scoreData.score_label,
          criteria: scoreData.criteres?.reduce((acc: any, curr: any) => {
             // Map standard criteria back if needed, or use the exact names generated
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
          sexe: avatarData.sexe,
          age: avatarData.age,
          interets: [avatarData.profession, avatarData.ville, avatarData.situation_familiale],
          frustrations: [avatarData.probleme_principal],
          peurs: [avatarData.peur_principale, avatarData.objection_prix],
          desirs: [avatarData.desir_profond],
          phrase_declenchante: avatarData.citation_type,
          ...avatarData // Keep all other raw fields just in case
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

      toast.success('Analyse terminée !', { id: 'analyze' });
    } catch (err: any) {
      toast.error(sanitizeError(err), { id: 'analyze' });
    } finally {
      setLoading(false);
    }
  }

  // --- RESULTS VIEW ---
  if (analysisResult) {
    return (
      <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> Analyse Stratégique Prête
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">{productName}</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">IA Engine Version 2.1</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <Link href="/score-et-prix" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group hover:-translate-y-2 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl group-hover:rotate-12 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gagnant ?</span>
                <p className="text-3xl font-black text-amber-600">{analysisResult.score.total || analysisResult.score}%</p>
              </div>
            </div>
            <h3 className="text-xl font-black mb-1 tracking-tight">Score & Rentabilité</h3>
            <p className="text-xs text-slate-400 font-bold mb-6">Prix recommandé : <span className="text-primary-600">{analysisResult.price_recommendation}</span></p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest">Détails financiers <ArrowRight className="w-3 h-3" /></div>
          </Link>

          {/* Card 2 */}
          <Link href="/avatar" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group hover:-translate-y-2 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:rotate-12 transition-transform">
                <User className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-black mb-1 tracking-tight">Avatar Client</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2">Comprenez qui achète et pourquoi.</p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest">Voir le profil <ArrowRight className="w-3 h-3" /></div>
          </Link>

          {/* Card 3 */}
          <Link href="/page-shopify" className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group hover:-translate-y-2 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl group-hover:rotate-12 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-black mb-1 tracking-tight">Page Shopify</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2">Générez votre fiche produit en 1 clic.</p>
            <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest">Accéder au builder <ArrowRight className="w-3 h-3" /></div>
          </Link>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => { setAnalysisResult(null); setProductName(''); setProductDesc(''); setSourceLink(''); setCostPrice(''); setImages([]); }}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
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
        
        <form onSubmit={handleAnalyze} className="relative z-10 p-8 md:p-12 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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
                  className="w-full bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-5 text-base font-black outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Prix Achat */}
            <div className="space-y-4 relative group/input">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                <DollarSign className="w-4 h-4" /> Prix d'Achat ({currency}) <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setCostPrice(String(Math.max(0, (Number(costPrice) || 0) - 500)))} 
                  className="px-6 py-5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                  className="flex-1 text-center bg-transparent border-none py-5 text-lg font-black outline-none text-primary-600 dark:text-primary-400 placeholder:text-slate-300 dark:placeholder:text-slate-700 appearance-none"
                />
                <button 
                  type="button" 
                  onClick={() => setCostPrice(String((Number(costPrice) || 0) + 500))} 
                  className="px-6 py-5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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
                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all h-[72px] resize-none hover:border-slate-200 dark:hover:border-slate-700 placeholder:text-slate-300 dark:placeholder:text-slate-700 scrollbar-hide"
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
              className="relative group overflow-hidden px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
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
