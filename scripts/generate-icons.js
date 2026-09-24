import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Brand SVG for modern browsers
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a2724" />
      <stop offset="100%" stop-color="#181614" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="104" fill="url(#bg)" />
  <rect x="24" y="24" width="464" height="464" rx="88" fill="none" stroke="#d4a373" stroke-width="6" opacity="0.3" />
  <!-- Book spine & pages -->
  <path d="M120 140 C180 120, 240 135, 256 160 C272 135, 332 120, 392 140 L392 360 C332 340, 272 355, 256 380 C240 355, 180 340, 120 360 Z" fill="#fffef2" stroke="#d4a373" stroke-width="12" stroke-linejoin="round" />
  <path d="M256 160 L256 380" stroke="#d4a373" stroke-width="8" stroke-linecap="round" />
  <!-- Feather quill / bookmark -->
  <path d="M246 120 C256 90, 276 90, 286 110 C296 130, 286 160, 266 180 L256 190 Z" fill="url(#gold)" />
  <circle cx="256" cy="270" r="16" fill="#d97706" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

function createIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });

  // Warm bookish colors: background #1c1917, accent #d4a373, warm paper #fffef2
  const bgR = 28, bgG = 25, bgB = 23;
  const goldR = 212, goldG = 163, goldB = 115;
  const paperR = 255, paperG = 254, paperB = 242;

  // Margin for maskable safe zone is 15%, regular is 10%
  const padding = isMaskable ? Math.round(size * 0.15) : Math.round(size * 0.08);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Fill background
      png.data[idx] = bgR;
      png.data[idx + 1] = bgG;
      png.data[idx + 2] = bgB;
      png.data[idx + 3] = 255;

      // Subtle border for rounded app icons
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Book shape coordinates
      const bookLeft = padding;
      const bookRight = size - padding;
      const bookTop = padding + Math.round(size * 0.05);
      const bookBottom = size - padding - Math.round(size * 0.05);

      if (x >= bookLeft && x <= bookRight && y >= bookTop && y <= bookBottom) {
        // Spine in middle
        const midX = size / 2;
        const distFromMid = Math.abs(x - midX);

        if (distFromMid < 4) {
          // Spine crease
          png.data[idx] = goldR;
          png.data[idx + 1] = goldG;
          png.data[idx + 2] = goldB;
        } else if (distFromMid < (size * 0.38)) {
          // Book pages
          // Curve pages slightly
          const pageWave = Math.sin((x / size) * Math.PI) * (size * 0.03);
          if (y > bookTop + pageWave && y < bookBottom - pageWave) {
            png.data[idx] = paperR;
            png.data[idx + 1] = paperG;
            png.data[idx + 2] = paperB;

            // Page text lines
            const lineY = (y - bookTop) % Math.round(size * 0.08);
            if (lineY < 3 && distFromMid > (size * 0.08) && distFromMid < (size * 0.32)) {
              png.data[idx] = 180;
              png.data[idx + 1] = 160;
              png.data[idx + 2] = 140;
            }
          }
        }
      }

      // Golden center emblem
      if (dist < size * 0.08) {
        png.data[idx] = goldR;
        png.data[idx + 1] = goldG;
        png.data[idx + 2] = goldB;
      }
    }
  }

  return PNG.sync.write(png);
}

// Write icons
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createIcon(180, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createIcon(512, true));

console.log('PWA icons generated successfully in /public');
