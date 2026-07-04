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
        let text = data.text;
        if (options.parseJSON) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          return JSON.parse(jsonMatch ? jsonMatch[0] : text);
        }
        return text;
      };

      const PROMPT_SCORE = {
        system: `Tu es un analyste e-commerce senior spécialisé dans les marchés africains COD (Cash On Delivery).
Tu connais parfaitement les habitudes d'achat en Guinée, Sénégal, Côte d'Ivoire, Togo, Mali, Cameroun.
IMPORTANT : Les données fiables sont rares en Afrique. Tu dois RAISONNER par étapes, en t'appuyant sur des heuristiques de marchés analogues (Maghreb COD, Asie du Sud-Est COD, marchés émergents similaires) et sur ta connaissance du comportement consommateur africain.
Réponds UNIQUEMENT en JSON valide. Pas de markdown, pas de backticks.`,
        user: `Analyse ce produit pour le marché e-commerce africain COD. Raisonne étape par étape.

Produit: "${productName}"
Prix d'achat: ${costPrice} ${currency}
Description: ${productDesc || 'Non fournie'}
Catégorie: ${categorie}
Pays cible: ${pays}

MÉTHODOLOGIE — Avant de générer le JSON, raisonne mentalement :
1. Ce produit répond-il à un besoin réel et urgent dans ce pays spécifique ?
2. Y a-t-il des équivalents qui fonctionnent dans des marchés COD analogues (Maroc, Tunisie, Vietnam) ? Quels prix pratiquent-ils ?
3. Quelle marge brute est réaliste après coût d'achat + livraison (~2000-5000 GNF) + pub Facebook (~3000-8000 GNF par commande) ?
4. L'audience est-elle facilement identifiable et adressable sur Facebook/TikTok ?
5. La démonstration visuelle du produit est-elle convaincante pour un acheteur COD méfiant ?

Sur la base de ce raisonnement, réponds avec ce JSON exact:
{
  "score": 78,
  "score_label": "Bon potentiel",
  "score_color": "green",
  "prix_min": 120000,
  "prix_max": 180000,
  "prix_recommande": 149000,
  "marge_estimee": "65%",
  "raisonnement_prix": "Explication en 2 phrases du raisonnement pour arriver à ces prix (analogie marché, élasticité prix, pouvoir d'achat local)",
  "criteres": [
    {"nom": "Popularité en Afrique", "score": 82, "commentaire": "Très demandé en Guinée et Sénégal"},
    {"nom": "Facilité de marketing", "score": 88, "commentaire": "Visuel fort, démonstration facile"},
    {"nom": "Prix adapté au marché", "score": 72, "commentaire": "Dans la fourchette acceptable"},
    {"nom": "Niveau de concurrence", "score": 65, "commentaire": "Quelques vendeurs actifs"},
    {"nom": "Clarté du bénéfice", "score": 90, "commentaire": "Résultat visible rapidement"},
    {"nom": "Tendance actuelle", "score": 75, "commentaire": "En croissance sur TikTok Afrique"},
    {"nom": "Confiance à l'achat", "score": 70, "commentaire": "Paiement à la livraison rassure"}
  ],
  "analyse_marketing": "Analyse de 3-4 phrases sur le potentiel concret du produit pour ce marché, basée sur des heuristiques réelles.",
  "recommandations": [
    "Recommandation actionnable 1 avec exemple concret",
    "Recommandation actionnable 2",
    "Recommandation actionnable 3"
  ]
}`
      };

      const PROMPT_AVATAR = {
        system: `Tu es un expert de classe mondiale en psychologie du consommateur africain, neuromarketing COD et comportement d'achat en ligne.
Tu connais les biais cognitifs, les déclencheurs émotionnels, les dynamiques sociales (tontines, pression des pairs, statut) et les mécanismes de décision d'achat en Afrique francophone.
Réponds UNIQUEMENT en JSON valide. Aucun texte avant ou après.`,
        user: `Crée un avatar client ULTRA-DÉTAILLÉ et psychologiquement précis pour ce produit.

Produit: "${productName}"
Catégorie: ${categorie}
Pays cible: ${pays}

TU DOIS ALLER BIEN AU-DELÀ DE LA DÉMOGRAPHIE. Fournis :
- Le comportement d'achat CONCRET (pas juste "achète en ligne")
- Les déclencheurs PSYCHOLOGIQUES réels (neuromarketing : FOMO, statut social, appartenance tribale, sécurité, réciprocité)
- Le VRAI monologue intérieur au moment de l'achat
- Les objections avec CE QU'ELLE DIT et CE QU'ELLE PENSE VRAIMENT (ces deux choses diffèrent)
- Son PARCOURS DÉCISIONNEL de la découverte à la commande

JSON exact à retourner (NE CHANGE PAS LES CLÉS) :
{
  "prenom": "Aminata",
  "sexe": "Femme",
  "age": "28-38 ans",
  "ville": "Conakry, Guinée",
  "profession": "Commerçante / Fonctionnaire",
  "revenu_mensuel": "500 000 - 1 500 000 GNF",
  "situation_familiale": "Mariée, 2 enfants",
  "interets": ["Intérêt profond 1 (valeur/passion spécifique)", "Intérêt profond 2 (appartenance communautaire)", "Intérêt profond 3 (aspiration précise)"],
  "plateformes": ["Facebook", "WhatsApp", "TikTok"],
  "heure_active": "19h - 22h",
  "probleme_principal": "Le problème concret et douloureux que ce produit résout dans sa vie quotidienne",
  "desir_profond": "Ce qu'elle veut VRAIMENT au fond d'elle (pas juste le bénéfice produit, mais le désir humain profond)",
  "peur_principale": "Sa peur la plus viscérale avant d'acheter en ligne en Afrique (arnaque, jugement des proches, argent gaspillé...)",
  "declencheurs_psychologiques": [
    {"type": "FOMO", "description": "Comment le FOMO s'applique à elle pour ce produit"},
    {"type": "Statut social", "description": "Comment ce produit affecte son statut dans son cercle social africain"},
    {"type": "Appartenance", "description": "À quelle communauté ce produit lui permet d'appartenir"}
  ],
  "comportement_achat": {
    "moment_decouverte": "Où et quand elle découvre le produit (scroll Facebook 20h, WhatsApp groupe...)",
    "action_avant_achat": "Ce qu'elle fait avant de commander (cherche avis amies, screenshote, demande au mari...)",
    "temps_decision": "Combien de temps entre la découverte et la commande en moyenne",
    "canal_achat": "Comment elle commande (WhatsApp direct, formulaire, appel...)"
  },
  "objections": [
    {"objection": "Ce qu'elle dit", "vrai_blocage": "Ce qu'elle pense vraiment", "reponse_ideale": "Comment lever ce blocage"},
    {"objection": "C'est trop cher", "vrai_blocage": "Je ne suis pas sûre que ça marche vraiment", "reponse_ideale": "Garantie de remboursement + témoignage similaire"},
    {"objection": "Je vais réfléchir", "vrai_blocage": "Je veux en parler à quelqu'un avant", "reponse_ideale": "Offre limitée + suggestion d'en parler à une amie qui a déjà acheté"}
  ],
  "declencheur_achat": "Le déclencheur final concret qui la fait passer à l'action (une amie qui l'a aussi, une promotion flash, la peur de rater...)",
  "mots_cles_resonance": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "citation_type": "Une phrase qu'elle dirait EXACTEMENT dans ses propres mots sur ce produit, avec son ton africain authentique",
  "phrase_declenchante": "La phrase publicitaire parfaite qui la ferait stopper son scroll et commander"
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

RÈGLES STRICTES DE STRUCTURE POUR CHAQUE PUBLICITÉ:
1. HOOK / TITRE: Un titre accrocheur ou le nom du produit avec des EMOJIS très vivants et captivants (une seule phrase d'accroche choc, pas de texte d'explication ici).
2. EXPLANATION: Une très courte phrase d'introduction ou de transition (1 ligne maximum).
3. POINTS CLÉS (BENEFITS): Exactement 3 à 4 puces (bullet points) courtes, percutantes et concises (pas trop longues !), commençant chacune par un emoji pertinent (ex: 🚚, ✅, 💰, 🔥, etc.).
4. CTA: Un appel à l'action complet et direct qui mentionne le prix (${prixRecommande} ${currency}), le "Paiement à la livraison" et la livraison rapide.

LES 3 ANGLES:
- Pub 1: Angle DOULEUR (commence par le problème principal, aggrave l'inconfort, puis montre le produit comme la solution miracle)
- Pub 2: Angle PREUVE SOCIALE (commence par la recommandation chaleureuse d'un client satisfait, met en avant le nombre de clients heureux et les résultats visibles)
- Pub 3: Angle URGENCE & RARETÉ (met en avant une offre temporaire, des stocks limités en Afrique, le prix promotionnel et la fin imminente de l'offre)

FORMAT DE RÉPONSE:
Tu dois répondre UNIQUEMENT avec un bloc de code JSON valide (sans aucun autre texte de blabla avant ou après) contenant un tableau de 3 objets JSON respectant exactement cette structure:
[
  {
    "angle": "Angle Douleur",
    "hook": "Le titre accrocheur avec emojis",
    "explanation": "La phrase courte d'introduction",
    "benefits": [
      "Emoji + Premier bénéfice ultra-court et punchy",
      "Emoji + Deuxième bénéfice ultra-court et punchy",
      "Emoji + Troisième bénéfice ultra-court et punchy",
      "Emoji + Quatrième bénéfice ultra-court (optionnel, max 4)"
    ],
    "cta": "Appel à l'action complet avec prix, livraison et paiement à la livraison"
  },
  {
    "angle": "Angle Preuve Sociale",
    "hook": "Le titre accrocheur avec emojis",
    "explanation": "La phrase courte d'introduction",
    "benefits": [
      "Emoji + Premier bénéfice ultra-court et punchy",
      "Emoji + Deuxième bénéfice ultra-court et punchy",
      "Emoji + Troisième bénéfice ultra-court et punchy",
      "Emoji + Quatrième bénéfice ultra-court (optionnel, max 4)"
    ],
    "cta": "Appel à l'action complet avec prix, livraison et paiement à la livraison"
  },
  {
    "angle": "Angle Urgence & Rareté",
    "hook": "Le titre accrocheur avec emojis",
    "explanation": "La phrase courte d'introduction",
    "benefits": [
      "Emoji + Premier bénéfice ultra-court et punchy",
      "Emoji + Deuxième bénéfice ultra-court et punchy",
      "Emoji + Troisième bénéfice ultra-court et punchy",
      "Emoji + Quatrième bénéfice ultra-court (optionnel, max 4)"
    ],
    "cta": "Appel à l'action complet avec prix, livraison et paiement à la livraison"
  }
]`
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
        system: `Tu es expert en scripts publicitaires vidéo pour TikTok et Facebook Ads, marché africain francophone.
RÈGLES ABSOLUES:
1. Texte continu lu au micro — AUCUN label interne.
2. JAMAIS de prénoms ou personnages inventés.
3. Adresse directement le spectateur (vous/tu).
4. Chaque script = 4 étapes OBLIGATOIRES : Accroche/Problème viscéral → Solution (le produit) → Comment ça fonctionne → CTA.
5. Chaque script : STRICTEMENT 65 à 100 mots (25-40 secondes à débit oral normal).
COMPTE LES MOTS avant de livrer.`,
        user: `Crée 3 scripts voix off pour "${productName}" à ${prixRecommande} ${currency} — marché ${pays}.

STRUCTURE OBLIGATOIRE POUR CHAQUE SCRIPT :
- ÉTAPE 1 ACCROCHE/PROBLÈME : Commence en appuyant là où ça fait vraiment mal (douleur viscérale, peur, honte, frustration quotidienne).
- ÉTAPE 2 SOLUTION : Présente "${productName}" comme LA réponse concrète.
- ÉTAPE 3 FONCTIONNEMENT : 1-2 phrases sur comment ça marche ou les bénéfices clés.
- ÉTAPE 4 CTA : Variante de "Cliquez sur le bouton en bas, remplissez le formulaire et commandez le vôtre maintenant."

3 ANGLES DISTINCTS :
- Script 1 — Douleur Émotionnelle : frustration intérieure, insécurité, honte ressentie
- Script 2 — Inconfort Quotidien : problème concret du quotidien, temps/argent perdu
- Script 3 — Aspiration & Transformation : projection vers la vie désirée, le produit comme pont

FORMAT EXACT (respecte les séparateurs) :
═══ SCRIPT 1 — Angle : Douleur Émotionnelle ═══
[Texte continu 65-100 mots]
⏱ [N] mots | ~[X] secondes

═══ SCRIPT 2 — Angle : Inconfort Quotidien ═══
[Texte continu 65-100 mots]
⏱ [N] mots | ~[X] secondes

═══ SCRIPT 3 — Angle : Aspiration & Transformation ═══
[Texte continu 65-100 mots]
⏱ [N] mots | ~[X] secondes`
      };

      toast.loading("📱 Génération des publicités, fiche Shopify et scripts...", { id: 'analyze' });
      
      const [pubsText, shopifyText, voixOffText] = await Promise.all([
        callClaude(PROMPT_PUBS),
        callClaude(PROMPT_SHOPIFY),
        callClaude(PROMPT_VOIXOFF)
      ]);

      // Parseurs
      const parsePubs = (text: string) => {
        try {
          const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
              return parsed.map((pub: any) => ({
                angle: pub.angle || 'Publicité',
                hook: pub.hook || '',
                explanation: pub.explanation || '',
                benefits: Array.isArray(pub.benefits) ? pub.benefits.slice(0, 4) : [],
                cta: pub.cta || ''
              }));
            }
          }
        } catch (e) {
          console.error("Error parsing generated pubs JSON, using fallback parsing", e);
        }

        // Fallback: parse markdown/text representation if JSON fails
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
            pubs.push({
              angle: 'Publicité',
              hook,
              explanation: '',
              benefits: benefits.slice(0, 4),
              cta
            });
          }
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
