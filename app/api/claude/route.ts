// app/api/claude/route.ts
// Route API sécurisée — la clé Anthropic reste côté serveur

import { NextRequest, NextResponse } from 'next/server'

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Claude API error:', error)
      
      let errorMessage = error.error?.message || `Erreur API Claude: ${response.status}`
      if (response.status === 401) {
        errorMessage = "La clé API Claude est invalide ou a été révoquée."
      } else if (response.status === 404) {
        errorMessage = "Votre clé API Claude n'a pas l'autorisation d'utiliser ce modèle (accès restreint ou crédits manquants)."
      } else if (response.status === 429) {
        errorMessage = "Le quota de l'API Claude est dépassé ou limite de requêtes atteinte."
      } else if (response.status >= 500) {
        errorMessage = "Erreur serveur chez Anthropic (Claude)."
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    let text = data.content?.[0]?.text || ''

    // Le nouveau modèle enveloppe parfois la réponse dans des balises markdown ```json...```
    // On les supprime pour garder la compatibilité avec le frontend
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    return NextResponse.json({ text, usage: data.usage })

  } catch (err: any) {
    console.error('Claude route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
