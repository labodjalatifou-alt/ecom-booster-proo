// lib/claude-prompts.ts
// Prompts et parseurs exacts pour Page Shopify + Scripts Voix Off
import { callClaude } from './claude';

// ══════════════════════════════════════════════════════════════
// 1. GÉNÉRATION PAGE SHOPIFY
// ══════════════════════════════════════════════════════════════

export async function genererPageShopify(
  produit: string,
  prix: number,
  currency: string,
  pays: string,
  description: string,
  avantages: string
): Promise<string> {

  const prompt = `Tu es un copywriter expert en neuromarketing pour le e-commerce africain COD.

Crée une fiche produit Shopify pour "${produit}" vendu à ${prix} ${currency} au marché ${pays}.

RÈGLE N°1 — TITRES DE PARAGRAPHES : Une phrase courte et percutante centrée sur un BÉNÉFICE. Exemples : "Retrouvez un teint éclatant et naturel.", "Gagnez du temps chaque matin.", "Une conception robuste pour durer."

RÈGLE N°2 — TEXTE DE PARAGRAPHE : EXACTEMENT 3 phrases. MAXIMUM 3 phrases. Chaque phrase doit se concentrer UNIQUEMENT sur les caractéristiques, l'utilisation ou les BÉNÉFICES réels du produit (ce qu'il fait, en quoi il est naturel, etc.). Ajoute 1 ou 2 émojis (stickers) pertinents dans chaque paragraphe pour rendre le texte vivant.

RÈGLE N°3 — INTERDICTION ABSOLUE D'INVENTER DE LA PREUVE SOCIALE ou de la rareté. Ne dis JAMAIS "des milliers de clients ont aimé", "recommandé par des experts", "plus de 2000 adoptés", "seulement 40 en stock". Concentre-toi UNIQUEMENT sur les avantages du produit lui-même.

RÈGLE N°4 — AUCUN FORMATAGE MARKDOWN. Interdiction stricte d'utiliser des astérisques (* ou **). Le texte doit être totalement brut (sans gras ni italique).

Réponds UNIQUEMENT avec ce format exact, sans rien ajouter avant ou après :

---TITRES---
TITRE_1: [titre SEO 5 mots max]
TITRE_2: [titre bénéfice 5 mots max]
TITRE_3: [titre 5 mots max]

---ACCROCHES---
ACCROCHE_1: [une phrase choc]
ACCROCHE_2: [une phrase de transformation]
ACCROCHE_3: [une phrase rassurante]

---PARAGRAPHES---
§1_TITRE: [Bénéfice principal]
§1_TEXTE: [Phrase 1 avec émoji.] [Phrase 2.] [Phrase 3 avec émoji.]

§2_TITRE: [Avantage spécifique]
§2_TEXTE: [Phrase 1.] [Phrase 2 avec émoji.] [Phrase 3.]

§3_TITRE: [Comment ça marche/Facilité]
§3_TEXTE: [Phrase 1 avec émoji.] [Phrase 2.] [Phrase 3.]

§4_TITRE: [Composition/Qualité/Naturel]
§4_TEXTE: [Phrase 1.] [Phrase 2 avec émoji.] [Phrase 3.]

§5_TITRE: [Résultat final attendu]
§5_TEXTE: [Phrase 1 avec émoji.] [Phrase 2.] [Phrase 3.]

§6_TITRE: [Réassurance sur l'achat]
§6_TEXTE: [Phrase 1.] [Phrase 2.] [Phrase 3 avec émoji.]

---BULLETS---
• [caractéristique 1, max 8 mots]
• [caractéristique 2, max 8 mots]
• [caractéristique 3, max 8 mots]
• [caractéristique 4, max 8 mots]
• [caractéristique 5, max 8 mots]

Infos produit : ${description || produit}
Avantages : ${avantages}
`

  return await callClaude(prompt, {
    system: 'Tu es un copywriter expert neuromarketing. Respecte STRICTEMENT le format demandé. Titres : 3-5 mots MAX. Textes : EXACTEMENT 3 phrases avec émojis. INTERDIT d\'utiliser du Markdown (pas d\'astérisques). Parle uniquement des bénéfices concrets du produit, pas de preuve sociale inventée ni d\'urgence.',
    max_tokens: 2000,
  })
}

// ── Parseur page Shopify ──────────────────────────────────────
export interface ShopifyPageParsed {
  titres: string[]          // [titre1, titre2, titre3]
  accroches: string[]       // [accroche1, accroche2, accroche3]
  paragraphes: Array<{
    titre: string
    texte: string
    principe?: string
  }>
  bullets: string[]
  raw: string               // texte brut original
}

export function parseShopifyPage(raw: string): ShopifyPageParsed {
  const result: ShopifyPageParsed = {
    titres: [],
    accroches: [],
    paragraphes: [],
    bullets: [],
    raw,
  }

  // Parser les titres : TITRE_1: texte
  const titreRegex = /TITRE_\d+:\s*(.+)/g
  let m: RegExpExecArray | null
  while ((m = titreRegex.exec(raw)) !== null) {
    result.titres.push(m[1].replace(/\*/g, '').trim())
  }

  // Parser les accroches : ACCROCHE_1: texte
  const accrocheRegex = /ACCROCHE_\d+:\s*(.+)/g
  while ((m = accrocheRegex.exec(raw)) !== null) {
    result.accroches.push(m[1].trim())
  }

  // Parser les paragraphes : §1_TITRE: + §1_TEXTE:
  for (let i = 1; i <= 6; i++) {
    const titreMatch = raw.match(new RegExp(`§${i}_TITRE:\\s*(.+)`))
    const texteMatch = raw.match(new RegExp(`§${i}_TEXTE:\\s*(.+)`))
    if (titreMatch) {
      result.paragraphes.push({
        titre: titreMatch[1].replace(/\*/g, '').trim(),
        texte: texteMatch ? texteMatch[1].replace(/\*/g, '').trim() : '',
      })
    }
  }

  // Parser les bullets : • texte
  const bulletRegex = /^[•·]\s*(.+)$/gm
  while ((m = bulletRegex.exec(raw)) !== null) {
    result.bullets.push(m[1].trim())
  }

  return result
}

// ── Convertir en HTML Shopify propre ─────────────────────────
export function shopifyPageToHtml(parsed: ShopifyPageParsed): string {
  let html = ''

  if (parsed.paragraphes.length > 0) {
    parsed.paragraphes.forEach((p) => {
      html += `<h2>${p.titre}</h2>\n`
      // Séparer les 3 phrases et les mettre en <p>
      const phrases = p.texte.split(/(?<=\.)\s+/).filter(s => s.trim())
      phrases.forEach(phrase => {
        html += `<p>${phrase.trim()}</p>\n`
      })
      html += `\n`
    })
  }

  if (parsed.bullets.length > 0) {
    html += `<ul>\n`
    parsed.bullets.forEach(b => {
      html += `  <li>${b}</li>\n`
    })
    html += `</ul>\n`
  }

  return html
}


// ══════════════════════════════════════════════════════════════
// 2. GÉNÉRATION SCRIPTS VOIX OFF — Spec 25-40s, structure imposée
// ══════════════════════════════════════════════════════════════

export async function genererScriptsVoixOff(
  produit: string,
  prix: number,
  currency: string,
  pays: string,
  description: string,
  avantages: string
): Promise<string> {

  const prompt = `Tu es expert en scripts publicitaires vidéo pour Facebook Ads et TikTok, marché ${pays}.

Crée EXACTEMENT 3 scripts voix off pour "${produit}" à ${prix} ${currency}.

RÈGLES ABSOLUES :
1. Chaque script dure entre 25 et 40 secondes à l'oral (environ 65 à 100 mots — débit naturel = ~2.5 mots/seconde).
2. Chaque script suit OBLIGATOIREMENT cette structure en 4 étapes :
   - ÉTAPE 1 — ACCROCHE / PROBLÈME : Commence fort en appuyant là où ça fait mal. La douleur doit être palpable, viscérale.
   - ÉTAPE 2 — SOLUTION : Présente "${produit}" comme LA réponse concrète au problème.
   - ÉTAPE 3 — COMMENT ÇA FONCTIONNE : 1-2 phrases sur le mécanisme ou les bénéfices clés.
   - ÉTAPE 4 — CALL-TO-ACTION : Termine par une variante de "Cliquez sur le bouton en bas, remplissez le formulaire et commandez."
3. Texte continu lu au micro — AUCUN label interne (pas de "Problème :", "Solution :", etc.).
4. NE MENTIONNE JAMAIS de prénoms ou personnages inventés.
5. Adresse directement le spectateur (vous/tu).
6. Compte les mots AVANT de valider. Entre 65 et 100 mots strictement.

LES 3 ANGLES (un angle distinct par script) :
- Script 1 — Angle DOULEUR ÉMOTIONNELLE : L'accroche insiste sur la frustration intérieure, la honte, l'insécurité que le client ressent.
- Script 2 — Angle INCONFORT QUOTIDIEN : L'accroche décrit le problème concret du quotidien (temps perdu, argent gaspillé, inefficacité).
- Script 3 — Angle ASPIRATION & TRANSFORMATION : L'accroche projette le client vers la vie qu'il veut avoir, puis montre le produit comme le pont.

EXEMPLE DE STRUCTURE ET TON :
"Vous en avez assez de vous regarder dans le miroir et de ne pas vous reconnaître ? ${produit} a été conçu exactement pour ça. En quelques minutes par jour, il agit en profondeur pour des résultats visibles dès la première semaine. Cliquez sur le bouton en bas de la vidéo, remplissez le formulaire et commandez le vôtre maintenant."

Réponds UNIQUEMENT avec ce format exact :

═══ SCRIPT 1 — Angle : Douleur Émotionnelle ═══
[Texte continu 65-100 mots]
⏱ [N] mots | ~[X] secondes

═══ SCRIPT 2 — Angle : Inconfort Quotidien ═══
[Texte continu 65-100 mots]
⏱ [N] mots | ~[X] secondes

═══ SCRIPT 3 — Angle : Aspiration & Transformation ═══
[Texte continu 65-100 mots]
⏱ [N] mots | ~[X] secondes

Infos produit : ${description}
Points forts : ${avantages}
`

  return await callClaude(prompt, {
    system: "Tu es un expert en scripts publicitaires pour l'Afrique francophone. RÈGLES STRICTES ET NON NÉGOCIABLES : 1. Génère EXACTEMENT 3 scripts. 2. Chaque script = EXACTEMENT 4 étapes : Accroche/Problème → Solution → Fonctionnement → CTA. 3. Texte continu SANS labels internes. 4. PAS DE PRÉNOMS INVENTÉS. 5. Chaque script : STRICTEMENT entre 65 et 100 mots (25-40 secondes). Compte les mots avant de valider. 6. Utilise le format de sortie exact avec ═══ SCRIPT N ═══.",
    max_tokens: 1800,
  })
}


// ── Parseur scripts voix off ──────────────────────────────────
export interface VoixOffScript {
  numero: number
  technique: string
  texte: string
  mots: number
  duree: string
}

export function parseScriptsVoixOff(raw: string): VoixOffScript[] {
  const scripts: VoixOffScript[] = []

  // Séparer par ═══ SCRIPT N ═══
  const sections = raw.split(/═══\s*SCRIPT\s*(\d+)[^═]*═══/g)

  // La regex split donne : ['', '1', 'texte script 1', '2', 'texte script 2', ...]
  for (let i = 1; i < sections.length; i += 2) {
    const numero = parseInt(sections[i])
    const bloc = sections[i + 1] || ''

    // Extraire la technique/angle depuis le raw original
    const rawTechniqueMatch = raw.match(
      new RegExp(`SCRIPT\\s*${numero}[^═]*Angle\\s*[:\\-]?\\s*([^═\n]+)`)
    )
    const technique = rawTechniqueMatch
      ? rawTechniqueMatch[1].trim()
      : `Script ${numero}`

    // Extraire la ligne ⏱ et le texte principal
    const dureeMatch = bloc.match(/⏱\s*(.+)/)
    const duree = dureeMatch ? dureeMatch[1].trim() : ''

    // Le texte = tout sauf la ligne ⏱
    const texte = bloc
      .replace(/⏱.*/g, '')
      .trim()

    // Compter les mots
    const mots = texte.split(/\s+/).filter(w => w.length > 0).length

    if (texte) {
      scripts.push({ numero, technique, texte, mots, duree })
    }
  }

  return scripts
}
