// Esperar o workflow Pages/Jekyll criado automaticamente pelo GitHub.
// Sem esta espera, o Jekyll pode substituir o jogo Vite compilado pelo HTML
// de desenvolvimento da branch main, quebrando estilos e scripts do CONQUEST.
const { GITHUB_EVENT_NAME: event, GITHUB_REPOSITORY: repo, GITHUB_SHA: sha, GITHUB_TOKEN: token } = process.env;
if (event !== 'push') {
  console.log('Execucao manual: nao ha publicacao Jekyll simultanea a aguardar.');
  process.exit(0);
}
if (!repo || !sha || !token) {
  console.error('Variaveis de GitHub Actions ausentes; nao e possivel verificar concorrencia do Jekyll.');
  process.exit(1);
}
const url = new URL('https://api.github.com/repos/' + repo + '/actions/runs');
url.searchParams.set('head_sha', sha);
url.searchParams.set('per_page', '30');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let seen = false;
for (let attempt = 1; attempt <= 40; attempt++) {
  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'conquest-pages-deploy'
    },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error('Falha consultando workflows concorrentes: HTTP ' + response.status);
  const body = await response.json();
  const legacy = (body.workflow_runs || []).find(run =>
    run.name === 'pages build and deployment' &&
    run.head_sha === sha &&
    run.event === 'dynamic'
  );
  if (legacy) {
    seen = true;
    if (legacy.status === 'completed') {
      console.log('Jekyll terminado (' + legacy.conclusion + '). Publicar o Vite agora, em ultimo lugar.');
      process.exit(0);
    }
    console.log('Jekyll em andamento (' + legacy.status + '): aguardando antes do deploy Vite.');
  } else if (!seen && attempt >= 6) {
    console.log('Nenhum deploy Jekyll concorrente encontrado. Publicando Vite diretamente.');
    process.exit(0);
  }
  await delay(3000);
}
throw new Error('Jekyll nao terminou a tempo; confira Actions e configure Pages > Source: GitHub Actions.');
