// lib/claude.ts
// Helpers pour appeler Claude depuis les composants Next.js

export interface ClaudeOptions {
  system?: string
  max_tokens?: number
  images?: Array<{ data: string; type: string }>
}

// Appel principal — utilise la route API Next.js (clé sécurisée côté serveur)
export async function callClaude(prompt: string, options: ClaudeOptions = {}): Promise<string> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      system: options.system || 'Tu es un expert e-commerce spécialisé dans le marché africain. Réponds en français.',
      max_tokens: options.max_tokens || 2000,
      images: options.images || [],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `Erreur Claude: ${res.status}`)
  }

  const data = await res.json()
  return data.text
}

// ══════════════════════════════════════════════════════════
// ANALYSE PRODUIT — Logique complète depuis votre HTML
// ══════════════════════════════════════════════════════════

export interface AnalyseResult {
  score: number
  prixMin: number
  prixMax: number
  avatar: {
    sexe: string
    age: string
    profession: string
    besoins: string
    objections: string
    langage: string
    revenu: string
    plateforme: string
  }
  criteres: Array<{ nom: string; score: number }>
  marketing: string
  produit: string
  prix: number
  pays: string
  categorie: string
  date: string
}

export async function analyserProduit(
  produit: string,
  prix: number,
  description: string,
  categorie: string,
  pays: string,
  images?: Array<{ data: string; type: string }>
): Promise<AnalyseResult> {

  const prompt = `Analyse ce produit pour le marché e-commerce africain (COD/paiement à la livraison).

PRODUIT: "${produit}"
PRIX D'ACHAT: ${prix} FCFA/GNF
DESCRIPTION: ${description || 'Non fournie'}
CATÉGORIE: ${categorie}
PAYS CIBLE: ${pays}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "score": 82,
  "prixMin": 25000,
  "prixMax": 35000,
  "avatar": {
    "sexe": "Femme",
    "age": "25-40 ans",
    "profession": "Commerçante / Fonctionnaire",
    "besoins": "Beauté, praticité, confiance en soi",
    "objections": "Prix, livraison lente, arnaque",
    "langage": "Aspirationnel, communautaire",
    "revenu": "200 000 - 500 000 FCFA/mois",
    "plateforme": "Facebook, WhatsApp, TikTok"
  },
  "criteres": [
    {"nom": "Popularité Afrique", "score": 85},
    {"nom": "Facilité marketing", "score": 90},
    {"nom": "Prix adapté marché", "score": 75},
    {"nom": "Concurrence", "score": 65},
    {"nom": "Audience cible claire", "score": 88},
    {"nom": "Tendance actuelle", "score": 80},
    {"nom": "Résolution problème", "score": 78}
  ],
  "marketing": "Analyse marketing détaillée ici..."
}`

  const text = await callClaude(prompt, {
    system: 'Tu es un analyste e-commerce expert en marché africain. Réponds UNIQUEMENT en JSON pur, sans markdown, sans backticks.',
    max_tokens: 1500,
    images,
  })

  // Parser le JSON — nettoyer les backticks si présents
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(clean)

  return {
    ...parsed,
    produit,
    prix,
    pays,
    categorie,
    date: new Date().toISOString(),
  }
}

// ══════════════════════════════════════════════════════════
// GÉNÉRATION CONTENU
// ══════════════════════════════════════════════════════════

export async function genererPubsFacebook(
  produit: string, prix: number, avantages: string, pays: string
): Promise<string> {
  const prompt = `Crée 3 publicités Facebook DISTINCTES pour "${produit}" à ${prix.toLocaleString()} en ${pays}.

FORMAT OBLIGATOIRE pour chaque pub:

PUB 1 — [Angle: Problème/Solution]
ACCROCHE: [texte accrocheur 1 ligne]
TEXTE: [2-3 phrases max]
CTA: [bouton d'appel à l'action]

PUB 2 — [Angle: Preuve sociale]
ACCROCHE: [texte accrocheur 1 ligne]
TEXTE: [2-3 phrases max]
CTA: [bouton d'appel à l'action]

PUB 3 — [Angle: Urgence/Rareté]
ACCROCHE: [texte accrocheur 1 ligne]
TEXTE: [2-3 phrases max]
CTA: [bouton d'appel à l'action]

Avantages produit: ${avantages}
Adapte au contexte culturel africain (${pays}). Paiement à la livraison.`

  return await callClaude(prompt, {
    system: 'Tu es un expert en publicité Facebook pour le marché africain COD.',
    max_tokens: 1200,
  })
}

export async function genererPageShopify(
  produit: string, prix: number, avantages: string, pays: string
): Promise<string> {
  const prompt = `Écris une page produit Shopify complète pour "${produit}" à ${prix.toLocaleString()} en ${pays}.

FORMAT STRICT:

TITRE 1 : [titre SEO principal]
TITRE 2 : [titre orienté bénéfice]
TITRE 3 : [titre preuve sociale]

ACCROCHE 1 : [phrase courte percutante]
ACCROCHE 2 : [transformation promise]
ACCROCHE 3 : [garantie/réassurance]

§1 — [TITRE PARAGRAPHE 1]
[3-4 phrases sur le problème résolu]

§2 — [TITRE PARAGRAPHE 2]
[3-4 phrases sur les caractéristiques]

§3 — [TITRE PARAGRAPHE 3]
[3-4 phrases sur les avantages pour ${pays}]

§4 — [TITRE PARAGRAPHE 4]
[3-4 phrases sur livraison et paiement à la livraison]

§5 — [TITRE PARAGRAPHE 5]
[3-4 phrases sur garantie et confiance]

BULLET POINTS:
• [caractéristique 1]
• [caractéristique 2]
• [caractéristique 3]
• [caractéristique 4]
• [caractéristique 5]

Avantages: ${avantages}`

  return await callClaude(prompt, {
    system: 'Tu es un copywriter expert Shopify pour l\'Afrique.',
    max_tokens: 2000,
  })
}

export async function genererScriptsVoixOff(
  produit: string, prix: number, avantages: string, pays: string
): Promise<string> {
  const prompt = `Crée 3 scripts voix off pour "${produit}" à ${prix.toLocaleString()} en ${pays}.

SCRIPT 15 SECONDES:
[Script court et percutant, environ 30 mots]

SCRIPT 30 SECONDES:
[Script médium avec problème + solution + CTA, environ 60 mots]

SCRIPT 60 SECONDES:
[Script complet avec histoire + bénéfices + preuves + CTA, environ 120 mots]

Avantages: ${avantages}
Ton: naturel, chaleureux, adapté au marché ${pays}.`

  return await callClaude(prompt, {
    system: 'Tu es un expert en scripts publicitaires pour l\'Afrique francophone.',
    max_tokens: 1000,
  })
}

export async function genererScriptCloser(
  produit: string, prix: number, avantages: string, pays: string
): Promise<string> {
  const prompt = `Crée un script complet pour closer (vendeur par téléphone) pour "${produit}" à ${prix.toLocaleString()} en ${pays}.

SCRIPT CLOSER WHATSAPP/TÉLÉPHONE:

1. ACCROCHE D'OUVERTURE (phrase d'intro naturelle)

2. QUALIFICATION (2-3 questions pour qualifier)

3. PRÉSENTATION PRODUIT (pitch en 3 points max)

4. GESTION DES OBJECTIONS:
- "C'est trop cher" → Réponse:
- "Je dois réfléchir" → Réponse:
- "Est-ce que c'est fiable?" → Réponse:
- "Je n'ai pas l'argent maintenant" → Réponse:

5. CLOSING (phrase de conclusion + confirmation commande)

6. CONFIRMATION LIVRAISON (récapitulatif adresse + délai)

Avantages produit: ${avantages}`

  return await callClaude(prompt, {
    system: 'Tu es un expert en techniques de closing pour le e-commerce africain COD.',
    max_tokens: 1500,
  })
}

// Génère tout le contenu en une fois
export async function genererToutLeContenu(
  produit: string,
  prix: number,
  avantages: string,
  pays: string
): Promise<{ facebook: string; shopifyPage: string; voixoff: string; whatsapp: string }> {
  const [facebook, shopifyPage, voixoff, whatsapp] = await Promise.all([
    genererPubsFacebook(produit, prix, avantages, pays),
    genererPageShopify(produit, prix, avantages, pays),
    genererScriptsVoixOff(produit, prix, avantages, pays),
    genererScriptCloser(produit, prix, avantages, pays),
  ])
  return { facebook, shopifyPage, voixoff, whatsapp }
}
