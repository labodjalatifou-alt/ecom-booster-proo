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

RÈGLE N°1 — TITRES DE PARAGRAPHES : Une phrase courte et percutante. Exemples corrects : "Obtenez enfin des résultats visibles.", "Rejoignez des milliers de clientes satisfaites.", "Commandez avant la rupture de stock.".

RÈGLE N°2 — TEXTE DE PARAGRAPHE : EXACTEMENT 3 phrases. Pas 2, pas 4. 3 phrases courtes et percutantes.

RÈGLE N°3 — Chaque paragraphe utilise un principe de neuromarketing différent.

Réponds UNIQUEMENT avec ce format, sans rien ajouter avant ou après :

---TITRES---
TITRE_1: [titre SEO 5 mots max]
TITRE_2: [titre bénéfice 5 mots max]
TITRE_3: [titre preuve sociale 5 mots max]

---ACCROCHES---
ACCROCHE_1: [une phrase, choc émotionnel]
ACCROCHE_2: [une phrase, transformation promise]
ACCROCHE_3: [une phrase, garantie rassurante]

---PARAGRAPHES---
§1_TITRE: [3-5 mots — douleur/problème]
§1_TEXTE: [Phrase 1.] [Phrase 2.] [Phrase 3.]

§2_TITRE: [3-5 mots — autorité/crédibilité]
§2_TEXTE: [Phrase 1.] [Phrase 2.] [Phrase 3.]

§3_TITRE: [3-5 mots — preuve sociale]
§3_TEXTE: [Phrase 1.] [Phrase 2.] [Phrase 3.]

§4_TITRE: [3-5 mots — bénéfices concrets]
§4_TEXTE: [Phrase 1.] [Phrase 2.] [Phrase 3.]

§5_TITRE: [3-5 mots — rareté/urgence]
§5_TEXTE: [Phrase 1.] [Phrase 2.] [Phrase 3.]

§6_TITRE: [3-5 mots — réassurance/garantie]
§6_TEXTE: [Phrase 1.] [Phrase 2.] [Phrase 3.]

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
    system: 'Tu es un copywriter expert neuromarketing. Respecte STRICTEMENT le format demandé. Titres de paragraphes : 3-5 mots MAX. Textes : EXACTEMENT 3 phrases.',
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
  
  Crée 3 scripts voix off DISTINCTS pour "${produit}" à ${prix} ${currency}.
  
  RÈGLE ABSOLUE 1 : Chaque script s'écrit comme un texte continu qu'on lit au micro d'un seul trait. PAS de sections "Accroche :", "Corps :", "CTA :" dans le texte. Juste le texte pur qu'on lit.
  RÈGLE ABSOLUE 2 : NE MENTIONNE JAMAIS de prénoms inventés (ex: Aminata, etc.). Reste général.
  
  RÈGLE DURÉE : 
  - Script 1 : exactement 20-25 secondes = 50 à 60 mots
  - Script 2 : exactement 30-35 secondes = 75 à 90 mots
  - Script 3 : exactement 40-45 secondes = 100 à 115 mots
  
  Compte les mots avant d'écrire chaque script.
  
  Réponds UNIQUEMENT avec ce format exact :
  
  ═══ SCRIPT 1 — Technique : Problème, Solution, Fonctionnement ═══
  [Texte continu du script, 50-60 mots, commence par exposer le problème, donne le produit comme solution, explique rapidement comment il fonctionne, finit par un appel à commander]
  ⏱ mots | 22 secondes
  
  ═══ SCRIPT 2 — Technique : Problème, Solution, Fonctionnement (Détaillé) ═══
  [Texte continu du script, 75-90 mots, expose un problème douloureux de manière plus détaillée, présente la solution, explique précisément son fonctionnement, finit par un appel à l'action avec urgence]
  ⏱ mots | 32 secondes
  
  ═══ SCRIPT 3 — Technique : Transformation et Preuve Sociale ═══
  [Texte continu du script, 100-115 mots, parle de la transformation qu'apporte le produit (avant/après) et mentionne que beaucoup de clients ont déjà été satisfaits (sans donner de prénoms), finit par une offre spéciale pour commander]
  ⏱ mots | 43 secondes
  
  Infos produit : ${description || produit}
  Points forts : ${avantages}
  `
  
    return await callClaude(prompt, {
      system: `Tu es un expert en scripts publicitaires pour l'Afrique francophone. 
  RÈGLES STRICTES :
  1. Chaque script = texte continu lu au micro, SANS labels internes (pas de "Accroche:", "Corps:", "CTA:")
  2. PAS DE PRÉNOMS INVENTÉS.
  3. Script 1 = 50-60 mots MAX
  4. Script 2 = 75-90 mots MAX  
  5. Script 3 = 100-115 mots MAX
  6. Compte les mots avant d'écrire
  7. Format avec ═══ SCRIPT N ═══ obligatoire`,
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
