// Test direct de l'API images-ia pour voir ce qu'elle retourne
const payload = {
  productName: "Mini Clavier Portable",
  productDescription: "Clavier sans fil compact, idéal pour tablette et TV Box",
  productImageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
};

fetch('http://localhost:3000/api/images-ia/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(r => {
  console.log('HTTP Status:', r.status);
  return r.json();
})
.then(d => {
  console.log('Success:', d.success);
  console.log('Images count:', d.images?.length);
  console.log('Errors:', d.partialErrors);
  if (d.error) console.log('ERROR:', d.error);
  if (d.images) {
    d.images.forEach(img => console.log(`  - [${img.label}]: ${img.url}`));
  }
})
.catch(e => console.log('FETCH ERROR:', e.message));
