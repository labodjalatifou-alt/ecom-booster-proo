import { createCanvas, loadImage } from 'canvas';

export async function addSideAdvantages(
  imageBuffer: Buffer,
  advantages: string[]
): Promise<Buffer> {
  const size = 1000;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fond blanc
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Image produit centrée (400x400 au centre)
  const img = await loadImage(imageBuffer);
  ctx.drawImage(img as any, 300, 300, 400, 400);

  // Style des bulles d'avantages
  const leftAdvantages = advantages.slice(0, 2);   // 2 à gauche
  const rightAdvantages = advantages.slice(2, 5);  // 3 à droite

  const drawAdvantage = (text: string, x: number, y: number, color: string) => {
    // Bulle de fond
    const bubbleW = 220;
    const bubbleH = 60;
    ctx.beginPath();
    ctx.roundRect(x - bubbleW/2, y - bubbleH/2, bubbleW, bubbleH, 30);
    ctx.fillStyle = color;
    ctx.fill();

    // Icône checkmark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓ ' + text, x, y + 7);
  };

  // Couleurs par avantage
  const colors = ['#6C63FF', '#FF6584', '#43C6AC', '#F7971E', '#2193b0'];

  // Gauche
  leftAdvantages.forEach((adv, i) => {
    drawAdvantage(adv, 145, 380 + i * 120, colors[i]);
  });

  // Droite
  rightAdvantages.forEach((adv, i) => {
    drawAdvantage(adv, 855, 320 + i * 120, colors[i + 2]);
  });

  return canvas.toBuffer('image/png');
}

export async function addLeftAdvantages(
  imageBuffer: Buffer,
  advantages: string[],
  productName: string
): Promise<Buffer> {
  const size = 1000;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fond dégradé subtil
  const gradient = ctx.createLinearGradient(0, 0, 1000, 1000);
  gradient.addColorStop(0, '#F8F9FF');
  gradient.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Image produit à droite
  const img = await loadImage(imageBuffer);
  ctx.drawImage(img as any, 520, 150, 450, 700);

  // Titre produit
  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(productName.toUpperCase(), 40, 120);

  // Ligne décorative sous le titre
  ctx.fillStyle = '#6C63FF';
  ctx.fillRect(40, 135, 80, 4);

  // Avantages liste
  advantages.forEach((adv, i) => {
    const y = 220 + i * 110;

    // Cercle numéroté
    ctx.beginPath();
    ctx.arc(65, y, 28, 0, Math.PI * 2);
    ctx.fillStyle = ['#6C63FF','#FF6584','#43C6AC','#F7971E','#2193b0'][i];
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), 65, y + 8);

    // Texte avantage
    ctx.fillStyle = '#2D2D2D';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(adv, 105, y + 8);
  });

  return canvas.toBuffer('image/png');
}
