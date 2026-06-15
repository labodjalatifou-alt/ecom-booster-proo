const payload = {
  system: 'Tu es expert e-commerce. Réponds UNIQUEMENT en JSON valide.',
  prompt: 'Analyse ce produit pour le marché africain.\nProduit: "Mini clavier portable"\nPrix: 5000 FCFA\nRéponds avec ce JSON exact: {"score": 78, "score_label": "Bon potentiel"}'
};

fetch('http://localhost:3000/api/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(r => {
  console.log('HTTP Status:', r.status);
  return r.json();
})
.then(d => {
  console.log('RESPONSE:', JSON.stringify(d, null, 2));
  if (d.text) {
    console.log('\n--- TEXT CONTENT ---');
    console.log(d.text);
  }
})
.catch(e => console.log('ERROR:', e.message));
