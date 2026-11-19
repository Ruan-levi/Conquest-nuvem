# CONQUEST — partida validada no Nhost (primeira etapa)

## Finalidade

O jogo 3D continua executando normalmente em modo local. A aba **Conta / Ranking** recebe um **Desafio da Nuvem** de seis perguntas como prova incremental de **Nhost Auth + PostgreSQL/GraphQL + Functions**. O placar verificado e uma tabela distinta de `conquest_scores`, cujos pontos continuam apenas demonstrativos por virem do navegador.

Esta e uma entrega de codigo/testes; **nao** afirmamos que o projeto Nhost foi provisionado ou que o endpoint funciona em producao ate o teste real.

## Arquivos versionados

| Caminho | Responsabilidade |
|---|---|
| `functions/challenge.js` | Endpoint Nhost: autenticar token, iniciar rodada, validar resposta e pontuar no servidor |
| `functions/_shared/quiz.js` | Banco de perguntas e gabarito privados do bundle Vite |
| `nhost/migrations/default/20261118210000_create_conquest_scores/` | Historico antigo, agora em formato de migracao do Nhost CLI |
| `nhost/migrations/default/20261118211000_create_verified_quiz/` | Partidas verificadas e view pseudonimizada do ranking |
| `tests/server/challenge.test.mjs` | Testes automatizados de segurança e regras da API |

## Vincular pelo GitHub — sem expor credenciais

1. Criar **projeto Nhost novo e separado** para o Conquest, na organizacao escolhida; nao reutilizar `smartops-nhost`.
2. Conectar no Nhost a **repository GitHub `Ruan-levi/Conquest-nuvem`**, **branch `main`**. Nhost executa deploys dos arquivos Functions e migracoes versionadas apos merge, quando a integracao Git estiver habilitada. Confira o deploy no dashboard.
3. Confirmar as migracoes aplicadas no Nhost; no Hasura/Database fazer Track de `public.conquest_scores`, `public.conquest_verified_runs` e da view `public.conquest_leaderboard`. A estrutura da metadata Hasura deve ser capturada com Nhost CLI (`nhost init`/`nhost link` e edicao no ambiente local), commitada e revisada; nao sobrescrever metadata de um projeto ja existente.
4. Definir permissoes de Hasura, sem confiar em dados enviados pelo browser:

   - `conquest_scores` role `user`: SELECT so `user_id = X-Hasura-User-Id`; INSERT so `score`, `correct_answers`, `total_answers`, `completed` com preset de `user_id = X-Hasura-User-Id`; negar UPDATE e DELETE.
   - `conquest_verified_runs`: **NENHUMA permissao `user`, `public` ou `anonymous`**, seja SELECT, INSERT, UPDATE ou DELETE. Apenas a Nhost Function usa o `NHOST_ADMIN_SECRET` injetado no servidor.
   - `conquest_leaderboard` role `user`: **somente SELECT** das colunas `nickname`, `best_score`, `completed_runs`, sem filtro de linha. Nao permitir INSERT, UPDATE, DELETE. Ao apresentar ranking a pessoas nao autenticadas, revise primeiro os requisitos de privacidade.
   - `public/anonymous`: sem permissoes nas tabelas; nao publicar email nem identificadores completos. `auth.users` continua gerenciado pelo Nhost.

5. Em GitHub → Settings → Secrets and variables → Actions → **Variables**, definir `NHOST_SUBDOMAIN` e `NHOST_REGION` com os valores **publicos** do novo projeto. O workflow passa esses valores para os builds do Pages e da imagem Docker; reexecutar build/deploy apos configuracao.
6. No Nhost/Auth: conferir origens e redirecionamentos permitidos e confirmacao de email, caso habilitada. Nhost Functions usa automaticamente `NHOST_AUTH_URL`, `NHOST_GRAPHQL_URL` e `NHOST_ADMIN_SECRET` no **servidor**. **Nunca** adicionar `NHOST_ADMIN_SECRET` a GitHub variables publicas, `VITE_*` ou ao cliente.
7. A funcao aceita as origens `https://ruan-levi.github.io` e as de desenvolvimento local. Se houver dominio da Oracle, adicionar `CONQUEST_ALLOWED_ORIGINS` nas environment variables privadas **do Nhost**, separadas por virgula, contendo apenas origens HTTPS confiaveis (sem caminho).
8. No painel do Nhost testar endpoint, logs, Hasura, Auth, view e UI por duas contas. Apenas depois documentar evidencias de funcionamento real.

## Contrato da API

URL publicada pelo Nhost ao vincular repositório: `https://<subdomain>.functions.<region>.nhost.run/v1/challenge`

Todos os POSTs exigem `Authorization: Bearer <accessToken>` (providenciado pelo Nhost SDK, sem colocar token no codigo):

- Iniciar: `{ "action": "start" }` → `{runId, round, totalRounds, score, correctAnswers, question: {text, options}}`.
- Responder: `{ "action": "answer", "runId": "uuid", "round": 1, "choice": 0 }` → `{correct, correctOption, finished, score, correctAnswers, round, totalRounds, question}`.

As respostas corretas nao saem do backend ate que a alternativa tenha sido consumida. O Hasura atualiza pontuacao/rodada por **update condicional atomico**; chamadas repetidas geram conflito 409. Os resultados competitivos da view sao registrados somente para 6 perguntas concluidas.

## Testar antes do merge

- `npm test` executa os testes de logica Vite/Vitest e os testes Node da Function.
- `npm run build` verifica frontend e importacoes.
- No Nhost real: verificar que usuario A nao acessa partidas de B, nao existe INSERT aberto em `conquest_verified_runs`, respostas duplicadas nao aumentam pontos, URLs e headers estao corretos, e ranking mostra apenas pseudonimos.

## Limites desta etapa

- O **Desafio da Nuvem** e um modo de perguntas separado das batalhas 3D. A pontuacao da aventura principal continua local/experimental; somente o desafio usa pontuacao verificada.
- Nao inclui ainda multiplayer sincronizado, matchmaking, reconexao ou ranking **em tempo real**. A consulta do placar ocorre ao abrir a aba e ao terminar o desafio; a subscription privada existente permanece no historico antigo.
- A funcao exige verificacao de rate limit, cotas/abuso e integracao real antes de ser declarada pronta para competicoes publicas de alto valor.
- A view de ranking publica apenas apelidos derivados de prefixos UUID; para um uso publico definitivo, planejar apelidos opt-in (sem email ou identificadores completos).

## Documentacao Nhost consultada

- https://docs.nhost.io/products/functions
- https://docs.nhost.io/platform/cli/local-development
- https://docs.nhost.io/products/auth/jwt
- https://docs.nhost.io/reference/auth/post-token-verify