# Integracao Nhost — Conquest (guia de instalacao real)

**Estado:** SDK e interface integrados em codigo; falta configurar projeto Nhost, tabela, permissoes e Storage no painel. A execucao real nao foi comprovada.

## Passo 1 — Configurar o cliente

Crie projeto em https://app.nhost.io. Copie APENAS subdomain e region publicos.
Localmente, preencha VITE_NHOST_SUBDOMAIN e VITE_NHOST_REGION no seu .env.
Para o GitHub Pages e o GHCR (Docker), defina GitHub Actions Variables
NHOST_SUBDOMAIN e NHOST_REGION e reexecute a compilacao.
O Vite incorpora VITE_* durante o build; elas NAO guardam segredos.

Configure no Nhost URLs autorizadas de redirecionamento para os dominios
reais usados no GitHub Pages e na VPS Oracle. O cadastro pode exigir confirmacao
por e-mail: depois da verificacao, o usuario entra com email/senha.

## Passo 2 — Database + GraphQL com Hasura

Execute nhost/migrations/001_conquest_scores.sql no SQL Editor.
No Hasura, faca Track da tabela public.conquest_scores.

Permissoes para role **user**:
- INSERT: somente colunas score, correct_answers, total_answers, completed;
  defina preset user_id = X-Hasura-User-Id; usuario nao pode preencher user_id.
- SELECT: filtro user_id = X-Hasura-User-Id; liberar id, score,
  correct_answers, total_answers, completed, created_at.
- UPDATE e DELETE: negar.
- Roles **public/anonymous**: negar SELECT, INSERT, UPDATE, DELETE.

O jogo mostra o historico **individual**, nao ranking publico. A pontuacao
calculada no navegador e manipulavel pelo proprio jogador. Nao usar para
ranking competitivo sem validacao de partida em backend confiavel.

## Passo 3 — Storage

Crie no Nhost Storage um bucket chamado **personal**. Na tela Permissions:
- Role user Upload: bucket_id = personal e preset
  uploaded_by_user_id = X-Hasura-User-Id.
- Role user Download: bucket_id = personal E uploaded_by_user_id = X-Hasura-User-Id.
- Role user Delete (se habilitado): mesmos filtros.
- Role public/anonymous: negar upload, leitura e exclusao.

A UI Conta/Ranking faz upload de PNG, JPEG e WebP ate 2 MB no bucket personal.
O id do arquivo devolvido pelo SDK pode ser conferido no dashboard.

## Passo 4 — Realtime

Na conta autenticada, o jogo abre WebSocket graphql-transport-ws
para subscription conquest_scores, sujeita as mesmas permissoes de SELECT.
Teste com duas abas na mesma conta: uma nova partida salva em uma aba deve
aparecer na outra sem recarregar. O botao Atualizar Dados usa GraphQL query
como fallback, sem comprovar realtime.

## Prova dos quatro recursos BaaS

1. Auth: conta, verificacao, login e logout.
2. Banco + GraphQL: grava e consulta de partida, visivel no Postgres/Hasura.
3. Storage: arquivo privado aparece no bucket personal.
4. Realtime: duas abas recebem atualizacoes sem refresh.

Teste duas contas diferentes para demonstrar isolamento de registros e arquivos.
Nao anuncie os quatro recursos como comprovados ate a demo funcionar de fato.

Documentacao oficial:
- https://docs.nhost.io/reference/javascript/nhost-js/main
- https://docs.nhost.io/products/auth/sign-in-email-password
- https://docs.nhost.io/products/storage/permissions
- https://docs.nhost.io/products/graphql
