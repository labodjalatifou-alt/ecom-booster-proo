/**
 * Test de flux commande — vérifie que l'API de création de commande fonctionne
 *
 * Usage :
 *   node scripts/test-order-flow.mjs [URL_BASE]
 *
 * URL_BASE par défaut : http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000'

async function main() {
  let passed = 0
  let failed = 0

  function assert(label, ok, detail) {
    if (ok) {
      console.log(`  ✅ ${label}`)
      passed++
    } else {
      console.log(`  ❌ ${label} — ${detail || 'échec'}`)
      failed++
    }
  }

  console.log(`\n🧪 Test flux commande — ${BASE_URL}\n`)

  // ── 1. Test création commande simple ──
  console.log('── 1. Création commande ──')

  const orderPayload = {
    customer_name: 'Test Client',
    phone: '62000000',
    city: 'Abidjan, Cocody',
    email: 'test@example.com',
    product: 'Produit Test',
    price: 15000,
    total: 15000,
    quantity: 1,
    currency: 'FCFA',
  }

  let orderId
  try {
    const res = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    })
    const data = await res.json()
    assert('Réponse HTTP 200', res.ok, `Status ${res.status}`)
    assert('Réponse contient success', data.success === true)
    assert('Réponse contient orderId', !!data.orderId)
    orderId = data.orderId
  } catch (err) {
    assert('Requête API réussie', false, err.message)
  }

  // ── 2. Test création commande avec variantes ──
  console.log('\n── 2. Commande avec variantes ──')

  try {
    const variantPayload = {
      ...orderPayload,
      customer_name: 'Test Variantes',
      phone: '63000001',
      city: 'Yopougon',
      variant: { Taille: 'XL', Couleur: 'Bleu' },
    }
    const res = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variantPayload),
    })
    const data = await res.json()
    assert('Réponse HTTP 200', res.ok, `Status ${res.status}`)
    assert('Commande avec variantes créée', data.success === true)
  } catch (err) {
    assert('Requête variantes réussie', false, err.message)
  }

  // ── 3. Test validation ──
  console.log('\n── 3. Validation des champs requis ──')

  const invalidTests = [
    { payload: { customer_name: '', phone: '62000000', city: 'Abidjan' }, label: 'Nom vide' },
    { payload: { customer_name: 'Test', phone: '', city: 'Abidjan' }, label: 'Téléphone vide' },
    { payload: { customer_name: 'Test', phone: '62000000', city: '' }, label: 'Ville vide' },
  ]

  for (const t of invalidTests) {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t.payload),
      })
      assert(`Rejet: ${t.label}`, res.status === 400, `Status ${res.status}`)
    } catch (err) {
      assert(`Rejet: ${t.label}`, false, err.message)
    }
  }

  // ── 4. Test clonage boutique ──
  console.log('\n── 4. Clonage boutique (URL test) ──')

  try {
    const res = await fetch(`${BASE_URL}/api/stores/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    })
    const data = await res.json()
    if (res.ok) {
      assert('Boutique clonée avec succès', true)
      assert('Analyse contient theme_used', !!data.analysis?.theme_used)
      assert('Analyse contient couleurs', data.analysis?.colors_detected?.length > 0)
      assert('Store ID présent', !!data.data?.id)
    } else {
      assert('Clonage URL test', false, data.error || `Status ${res.status}`)
    }
  } catch (err) {
    assert('Clonage URL test', false, err.message)
  }

  // ── Résumé ──
  console.log(`\n${'─'.repeat(40)}`)
  console.log(`\n📊 Résultat : ${passed} ✅ / ${failed} ❌ / ${passed + failed} total\n`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
