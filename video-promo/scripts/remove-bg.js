// Quita el fondo azul marino del isotipo QBB y genera un PNG transparente
// Uso: node scripts/remove-bg.js <entrada.png> <salida.png>
const fs = require('fs');
const { PNG } = require('pngjs');

const [, , inPath, outPath] = process.argv;
const png = PNG.sync.read(fs.readFileSync(inPath));
const { width, height, data } = png;

// Color de fondo: media de las cuatro esquinas
const corners = [0, (width - 1) * 4, (height - 1) * width * 4, ((height - 1) * width + width - 1) * 4];
const bg = [0, 1, 2].map(c => corners.reduce((s, i) => s + data[i + c], 0) / 4);

const HARD = 40;  // distancia ≤ HARD → totalmente transparente
const SOFT = 90;  // distancia ≥ SOFT → totalmente opaco

for (let i = 0; i < data.length; i += 4) {
  const d = Math.sqrt(
    (data[i] - bg[0]) ** 2 + (data[i + 1] - bg[1]) ** 2 + (data[i + 2] - bg[2]) ** 2
  );
  if (d <= HARD) data[i + 3] = 0;
  else if (d < SOFT) data[i + 3] = Math.round(((d - HARD) / (SOFT - HARD)) * 255);
}

fs.writeFileSync(outPath, PNG.sync.write(png));
console.log(`OK ${outPath} (fondo ${bg.map(Math.round).join(',')})`);
