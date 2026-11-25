// Conferir se o bundle Vite do Pages contém a configuração pública do Nhost.
// Executar somente após npm run build com NHOST_SUBDOMAIN e NHOST_REGION.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const subdomain = process.env.NHOST_SUBDOMAIN?.trim();
const region = process.env.NHOST_REGION?.trim();
if (!/^[a-z0-9-]+$/.test(subdomain || '') || !/^[a-z0-9-]+$/.test(region || '')) {
  console.error('Configure NHOST_SUBDOMAIN e NHOST_REGION em GitHub Actions Variables.');
  process.exit(1);
}
const html = readFileSync('dist/index.html', 'utf8');
if (!html.includes('portal-account-open') || !html.includes('portal-duel-open')) {
  console.error('Build inesperado: o portal CONQUEST/Nhost nao foi encontrado.');
  process.exit(1);
}
if (/entregavel5-root|e5-open|Progresso AWS|react\.production\.min\.js/i.test(html)) {
  console.error('Build contaminado pela interface AWS/SQLite da outra atividade.');
  process.exit(1);
}
const assets = readdirSync(join('dist', 'assets')).filter(name => name.endsWith('.js'));
if (!assets.length) {
  console.error('Nenhum bundle JavaScript Vite encontrado em dist/assets.');
  process.exit(1);
}
const js = assets.map(name => readFileSync(join('dist','assets',name), 'utf8')).join('\n');
if (!js.includes(subdomain) || !js.includes(region)) {
  console.error('Build nao contem a configuracao publica do projeto Nhost. Confira as variaveis VITE_*.');
  process.exit(1);
}
console.log('Portal sem interface AWS; configuracao publica Nhost incorporada ao build Vite.');
