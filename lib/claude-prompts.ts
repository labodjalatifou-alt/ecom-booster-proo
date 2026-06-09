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
    result.titres.push(m[1].trim())
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
        titre: titreMatch[1].trim(),
        texte: texteMatch ? texteMatch[1].trim() : '',
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
// 2. GÉNÉRATION SCRIPTS VOIX OFF
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
1. Chaque script suit OBLIGATOIREMENT le format Problème → Solution (et uniquement ce format).
2. Chaque script est un texte continu lu au micro d'un seul trait. AUCUN label interne (pas de "Problème :", "Solution :", "CTA :", etc.).
3. NE MENTIONNE JAMAIS de prénoms inventés.
4. Chaque script doit contenir STRICTEMENT entre 55 et 110 mots. Pas moins. Pas plus.
5. Compte les mots AVANT de valider chaque script.

STRUCTURE OBLIGATOIRE POUR CHAQUE SCRIPT :
- Pose le problème clairement (douleur, inconfort, frustration du client cible)
- Présente "${produit}" comme LA solution concrète
- Donne 1-2 bénéfices directs
- Termine par une variante de : "Cliquez sur le bouton en bas de la vidéo, remplissez le formulaire et commandez le vôtre"

EXEMPLE DE TON ET STRUCTURE :
"Arrêtez d'abîmer vos yeux avec les colles pour faux cils. Les yeux sont fragiles et méritent d'être protégés. Optez plutôt pour nos cils magnétiques, sans colle et sans risque. En moins de 5 minutes, vous obtenez un regard intense qui tient toute la journée. Ils sont réutilisables et vous font économiser sur le long terme. Cliquez sur le bouton en bas de la vidéo, remplissez le formulaire et commandez les vôtres maintenant."

Réponds UNIQUEMENT avec ce format exact, sans rien ajouter avant ou après :

═══ SCRIPT 1 — Problème-Solution ═══
[Texte continu, 55-110 mots, angle : frustration principale]
⏱ mots | durée estimée

═══ SCRIPT 2 — Problème-Solution ═══
[Texte continu, 55-110 mots, angle : inconfort quotidien]
⏱ mots | durée estimée

═══ SCRIPT 3 — Problème-Solution ═══
[Texte continu, 55-110 mots, angle : aspiration / bénéfice clé]
⏱ mots | durée estimée

Infos produit : ${description}
Points forts : ${avantages}
`

  return await callClaude(prompt, {
    system: "Tu es un expert en scripts publicitaires pour l'Afrique francophone. RÈGLES STRICTES ET NON NÉGOCIABLES : 1. Génère EXACTEMENT 3 scripts. 2. Chaque script = format Problème-Solution UNIQUEMENT. 3. Chaque script = texte continu SANS labels internes. 4. PAS DE PRÉNOMS INVENTÉS. 5. Chaque script : STRICTEMENT entre 55 et 110 mots — compte les mots avant de valider. 6. Utilise le format de sortie exact avec ═══ SCRIPT N ═══.",
    max_tokens: 1500,
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

    // Extraire la technique depuis le texte avant le bloc
    // On va chercher dans le raw original
    const rawTechniqueMatch = raw.match(
      new RegExp(`SCRIPT\\s*${numero}[^═]*Technique\\s*:\\s*([^═\n]+)`)
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
