// Test direct Serper.dev API
// node scratch/test_serper.js

require('dotenv').config({ path: '.env.local' });

const SERPER_KEY = process.env.SERPER_API_KEY;

console.log('=== DIAGNOSTIC SERPER.DEV ===');
console.log('Clé:', SERPER_KEY ? (SERPER_KEY === 'COLLE_TA_CLE_ICI' ? '❌ Placeholder non remplacé' : `✅ ${SERPER_KEY.substring(0, 8)}...`) : '❌ MANQUANTE');

if (!SERPER_KEY || SERPER_KEY === 'COLLE_TA_CLE_ICI') {
  console.error('\n❌ Va sur https://serper.dev, crée un compte, copie ta clé et colle-la dans .env.local à la place de COLLE_TA_CLE_ICI');
  process.exit(1);
}

async function test() {
  console.log('\n🔍 Test recherche: "electric shaver men product white background"...\n');

  try {
    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'electric shaver men product white background',
        num: 5,
        gl: 'us',
        hl: 'en',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ ERREUR SERPER:', JSON.stringify(data, null, 2));
      if (res.status === 401) console.error('\n⚠️  Clé API incorrecte ou expirée');
      if (res.status === 403) console.error('\n⚠️  Accès refusé — vérifiez votre plan Serper');
      if (res.status === 429) console.error('\n⚠️  Quota dépassé (2500 requêtes gratuites épuisées)');
      return;
    }

    const images = data.images || [];
    console.log(`✅ SUCCÈS — ${images.length} images trouvées\n`);

    images.slice(0, 3).forEach((img, i) => {
      console.log(`Image ${i + 1}:`);
      console.log(`  Titre    : ${img.title?.substring(0, 60)}`);
      console.log(`  URL      : ${img.imageUrl?.substring(0, 80)}`);
      console.log(`  Source   : ${img.source}`);
      console.log(`  Taille   : ${img.imageWidth}x${img.imageHeight}`);
      console.log(`  Thumb    : ${img.thumbnailUrl?.substring(0, 60)}`);
      console.log('');
    });

    console.log('🎉 Serper fonctionne parfaitement! Les images vont apparaître dans votre app.');
  } catch (err) {
    console.error('❌ ERREUR RÉSEAU:', err.message);
    console.error('Vérifiez votre connexion internet.');
  }
}

test();
