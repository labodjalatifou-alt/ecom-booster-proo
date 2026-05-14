require('dotenv').config({ path: '.env.local' });
const SERPER_KEY = process.env.SERPER_API_KEY;

async function testQuery(query) {
  const res = await fetch('https://google.serper.dev/images', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5, gl: 'us', hl: 'en' }),
  });
  const data = await res.json();
  console.log(`\n=== QUERY: ${query} ===`);
  if (!data.images || data.images.length === 0) {
    console.log("0 results");
  } else {
    data.images.slice(0, 3).forEach(img => {
      console.log(`- ${img.title.substring(0, 40)} | ${img.source}`);
      console.log(`  ${img.imageUrl}`);
    });
  }
}

async function run() {
  await testQuery('site:pinterest.com "laser tape measure" aesthetic');
  await testQuery('"laser tape measure" product photography high quality');
  await testQuery('"laser tape measure" infographic');
  await testQuery('site:amazon.com "laser tape measure"');
}
run();
