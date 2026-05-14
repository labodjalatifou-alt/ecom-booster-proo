// Test direct Google Custom Search API
// node scratch/test_google_api.js

require('dotenv').config({ path: '.env.local' });

const GOOGLE_API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CUSTOM_SEARCH_CX;

console.log('=== DIAGNOSTIC GOOGLE CUSTOM SEARCH ===');
console.log('API Key:', GOOGLE_API_KEY ? `${GOOGLE_API_KEY.substring(0, 10)}...` : '❌ MANQUANTE');
console.log('CX:', GOOGLE_CX ? GOOGLE_CX : '❌ MANQUANT');

if (!GOOGLE_API_KEY || !GOOGLE_CX) {
  console.error('\n❌ Clés manquantes dans .env.local');
  process.exit(1);
}

async function test() {
  const query = 'electric shaver men product white background';
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX,
    q: query,
    searchType: 'image',
    num: '5',
    imgSize: 'large',
    safe: 'active',
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params}`;
  console.log('\n🔍 URL de test:', url.replace(GOOGLE_API_KEY, 'API_KEY_HIDDEN'));

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error('\n❌ ERREUR GOOGLE:', JSON.stringify(data.error, null, 2));
      
      if (data.error?.code === 403) {
        console.error('\n⚠️  Causes possibles:');
        console.error('  1. Custom Search API non activée dans Google Cloud Console');
        console.error('  2. API key sans permission pour Custom Search');
        console.error('  3. Quota dépassé');
      }
      if (data.error?.code === 400) {
        console.error('\n⚠️  CX (Search Engine ID) invalide ou mal configuré');
      }
      return;
    }

    console.log('\n✅ SUCCÈS!');
    console.log('Nombre d\'items:', data.items?.length || 0);
    console.log('Total results:', data.searchInformation?.totalResults);
    if (data.items?.length > 0) {
      console.log('\nPremière image:');
      console.log('  URL:', data.items[0].link);
      console.log('  Source:', data.items[0].displayLink);
      console.log('  Taille:', data.items[0].image?.width, 'x', data.items[0].image?.height);
    }
  } catch (err) {
    console.error('\n❌ ERREUR RÉSEAU:', err.message);
  }
}

test();
