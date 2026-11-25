// Teste de integridade do GitHub Pages: impede declarar sucesso se Jekyll
// publicar o HTML de desenvolvimento em vez do bundle Vite + Nhost.
const url = process.env.CONQUEST_PAGES_URL || 'https://ruan-levi.github.io/Conquest-nuvem/';
const attempts = 10;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const jsPattern = /<script[^>]*type=["']module["'][^>]*src=["']([^"']*\/Conquest-nuvem\/assets\/[^"']+\.js)["']/i;

let last = 'Nenhuma resposta.';
for (let i = 1; i <= attempts; i++) {
  try {
    const site = new URL(url);
    site.searchParams.set('conquest_ci', process.env.GITHUB_SHA || 'verify');
    const response = await fetch(site, {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(10000)});
    const html = await response.text();
    const match = html.match(jsPattern);
    if (response.ok && match && html.includes('portal-duel-open') &&
        !html.includes('src="/src/main.js"') && !html.includes('e5-open')) {
      const asset = new URL(match[1], site.origin);
      const jsResponse = await fetch(asset, {signal: AbortSignal.timeout(10000)});
      if (jsResponse.ok) {
        console.log('CONQUEST publicado corretamente: bundle Vite ativo, Nhost no frontend.');
        console.log('HTML: ' + site.origin + site.pathname + ' | JavaScript: ' + asset.pathname);
        process.exit(0);
      }
      last = 'Bundle JavaScript retornou HTTP ' + jsResponse.status;
    } else {
      last = 'HTTP ' + response.status + '; HTML publicado nao corresponde ao bundle Vite do CONQUEST. ' +
        (html.includes('src="/src/main.js"') ? 'GitHub Pages esta servindo os arquivos-fonte via Jekyll.' : 'Verifique Source e base path.');
    }
  } catch (err) { last = err.message; }
  if (i < attempts) await sleep(6000);
}
console.error(last);
console.error('Corrija Settings > Pages > Build and deployment > Source para GitHub Actions e reexecute o workflow CONQUEST.');
process.exit(1);
