// app/api/claude/route.ts
// Route API sécurisée — la clé Anthropic reste côté serveur

import { NextRequest, NextResponse } from 'next/server'

// Vercel coupe les requêtes à 60s — on timeout à 55s pour avoir le temps de renvoyer une erreur propre
const CLAUDE_TIMEOUT_MS = 55_000

export const maxDuration = 60 // Vercel Pro / Edge config

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, system, max_tokens = 2000, images } = body

    if (!messages && !body.prompt) {
      return NextResponse.json({ error: 'messages requis' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configuré' }, { status: 500 })
    }

    // Construire les messages
    let userContent: any = messages || [{ role: 'user', content: body.prompt }]

    // Si images envoyées (base64), les ajouter au message
    if (images && images.length > 0 && typeof userContent === 'string') {
      userContent = [
        ...images.map((img: { data: string; type: string }) => ({
          type: 'image',
          source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data }
        })),
        { type: 'text', text: userContent }
      ]
    }

    const requestBody: any = {
      model: 'claude-sonnet-4-5',
      max_tokens,
      messages: Array.isArray(userContent) && userContent[0]?.role
        ? userContent
        : [{ role: 'user', content: userContent }]
    }

    if (system) {
      requestBody.system = system
    }

    // Timeout explicite pour ne pas dépasser la limite Vercel
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      if (fetchErr.name === 'AbortError') {
        console.error('Claude API timeout après', CLAUDE_TIMEOUT_MS, 'ms')
        return NextResponse.json(
          { error: 'Le modèle met trop de temps à répondre. Essayez avec un prompt plus court ou relancez.' },
          { status: 504 }
        )
      }
      throw fetchErr
    }
    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Réponse non-JSON' } }))
      console.error('Claude API error:', response.status, JSON.stringify(error))

      let errorMessage = error.error?.message || `Erreur API Claude: ${response.status}`
      if (response.status === 401) {
        errorMessage = 'La clé API Claude est invalide ou a été révoquée. Vérifiez ANTHROPIC_API_KEY.'
      } else if (response.status === 403) {
        errorMessage = 'Accès refusé au modèle. Votre clé n\'a pas les droits pour claude-sonnet-4-5.'
      } else if (response.status === 404) {
        errorMessage = 'Modèle introuvable (claude-sonnet-4-5). Vérifiez les accès de votre compte Anthropic.'
      } else if (response.status === 429) {
        errorMessage = 'Quota API Claude dépassé ou trop de requêtes simultanées. Patientez quelques secondes.'
      } else if (response.status === 529) {
        errorMessage = 'Anthropic est surchargé. Réessayez dans quelques instants.'
      } else if (response.status >= 500) {
        errorMessage = 'Erreur interne chez Anthropic. Réessayez dans quelques instants.'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    let text = data.content?.[0]?.text || ''

    // Nettoyage agressif — Claude peut envelopper sa réponse de plusieurs façons
    text = cleanClaudeResponse(text)

    return NextResponse.json({ text, usage: data.usage })

  } catch (err: any) {
    console.error('Claude route error:', err.message, err.stack)
    return NextResponse.json({ error: err.message || 'Erreur serveur interne' }, { status: 500 })
  }
}

/**
 * Nettoie la réponse Claude de tout wrapper parasite.
 * Supprime : balises <thinking>, blocs ```json ... ```, texte avant/après le JSON.
 */
function cleanClaudeResponse(text: string): string {
  // 1. Supprimer les balises <thinking>...</thinking> (extended thinking)
  text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim()

  // 2. Supprimer les blocs markdown ```json ... ``` ou ``` ... ```
  text = text.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim()

  // 3. Supprimer les préfixes textuels courants avant un JSON
  text = text.replace(/^[^[{]*([{[])/, '$1').trim()

  // 4. Supprimer les suffixes textuels après le JSON
  // On cherche le dernier } ou ] et on coupe après
  const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'))
  if (lastBrace !== -1 && lastBrace < text.length - 1) {
    text = text.substring(0, lastBrace + 1)
  }

  return text
}
