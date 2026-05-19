const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\35facb02-95a1-4ffd-9623-b2f5ff2b7676\\icon_512_1779194693340.png';

const dest512 = path.join(__dirname, '..', 'public', 'icon-512.png');
const dest192 = path.join(__dirname, '..', 'public', 'icon-192.png');
const destBadge = path.join(__dirname, '..', 'public', 'badge.png');

try {
  fs.copyFileSync(srcPath, dest512);
  fs.copyFileSync(srcPath, dest192);
  fs.copyFileSync(srcPath, destBadge);
  console.log("PNG Icons successfully copied to public folder!");
} catch (err) {
  console.error("Error copying icons:", err.message);
}
