const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const standaloneDir = path.join(root, '.next/standalone');
const staticDir = path.join(root, '.next/static');
const publicDir = path.join(root, 'public');

if (!fs.existsSync(standaloneDir)) {
  console.error('[bbs-monitor] Build standalone introuvable — lancez npm run build.');
  process.exit(1);
}

if (!fs.existsSync(staticDir)) {
  console.error('[bbs-monitor] .next/static introuvable.');
  process.exit(1);
}

if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, path.join(standaloneDir, 'public'), { recursive: true });
} else {
  console.warn('[bbs-monitor] Dossier public/ absent — ignoré.');
}
fs.cpSync(staticDir, path.join(standaloneDir, '.next/static'), { recursive: true });

console.log('[bbs-monitor] Assets copiés vers .next/standalone (public + static).');
