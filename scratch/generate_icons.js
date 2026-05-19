const fs = require('fs');
const path = require('path');

// Base64 of a tiny 1x1 transparent PNG
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

const files = [
  'icon-192.png',
  'icon-512.png',
  'badge.png'
];

const publicDir = path.join(__dirname, '..', 'public');

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created ${file} at ${filePath}`);
});
