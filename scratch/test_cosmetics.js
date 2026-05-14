require('dotenv').config({ path: '.env.local' });
const SERPER_KEY = process.env.SERPER_API_KEY;
async function testQuery(query) {
  const res = await fetch('https://google.serper.dev/images', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5, gl: 'us', hl: 'en' }),
  });
  const data = await res.json();
  console.log('QUERY:', query);
  if (data.images) data.images.slice(0,3).forEach(i => console.log(' - ' + i.title + ' | ' + i.imageUrl));
  else console.log("NO IMAGES FOUND");
}
testQuery('site:pinterest.com "purifying exfoliating gel"')
  .then(() => testQuery('site:amazon.com "purifying exfoliating gel"'))
  .then(() => testQuery('site:aliexpress.com "purifying exfoliating gel"'))
  .then(() => testQuery('"purifying exfoliating gel" skincare aesthetic'));
