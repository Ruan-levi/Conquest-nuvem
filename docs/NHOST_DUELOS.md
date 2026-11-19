# Ranking global e competição online — Nhost

O jogo preserva a jornada 3D existente. O modo **Duelo online** reúne **dois jogadores autenticados**, com convite de oito caracteres e seis perguntas de Teoria dos Conjuntos. As respostas são validadas em `functions/duel.js`, e somente o backend atualiza pontos e resultados. O ranking público mostra o melhor resultado e as vitórias de duelos terminados por ambos.

## 1. Pré-requisitos

- GitHub Pages com as variables `NHOST_SUBDOMAIN` e `NHOST_REGION` no workflow (valores públicos).
- Projeto Nhost correspondente ao subdomínio e região exibidos na interface do jogo.
- Auth → Users funcionando: crie **duas contas reais**, confirme o e-mail se necessário e teste o login.
- Nhost conectado ao repositório/branch correto (ou deploy controlado por Nhost CLI).

**Nunca coloque `NHOST_ADMIN_SECRET` em `.env` do Vite, `VITE_*`, GitHub Pages, código JavaScript do navegador ou screenshots.** No Nhost Functions, os segredos e URLs de backend já são injetados pelo serviço.

## 2. SQL e GraphQL

No Nhost Dashboard, abra o **SQL Editor** e execute, na ordem:

1. `nhost/migrations/001_conquest_scores.sql` se ainda não tiver sido aplicado (para o histórico privado da jornada 3D).
2. `nhost/migrations/002_conquest_duels.sql` para criar `public.conquest_duels` e a view `public.conquest_duel_leaderboard`.

Abra **Database/GraphQL → Hasura → Data** e clique em **Track** nas duas estruturas novas. Configure as permissões **exatamente assim**:

### `public.conquest_duels`

| Operação / role | Permissão |
|---|---|
| `user` — SELECT | Filtro `_or`: `host_id = X-Hasura-User-Id` **ou** `guest_id = X-Hasura-User-Id` |
| `user` — colunas visíveis | `id`, `status`, `host_nickname`, `guest_nickname`, `host_round`, `guest_round`, `host_score`, `guest_score` |
| `user` — INSERT, UPDATE, DELETE | **Nenhuma** |
| `public` / `anonymous` — todas as operações | **Nenhuma** |

O usuário vê somente a sala em que participa. Os IDs internos não são expostos na assinatura GraphQL. O backend usa o segredo administrativo **apenas em `functions/duel.js`**.

### `public.conquest_duel_leaderboard`

| Operação / role | Permissão |
|---|---|
| `user` e `public` / `anonymous` — SELECT | Sem filtro, **apenas** `nickname`, `best_score`, `played`, `wins` |
| Qualquer role — INSERT, UPDATE, DELETE | **Nenhuma** |

**Não libere a coluna `user_id`** nessa view nem dados de `auth.users`. Um jogador escolhe conscientemente seu apelido público no início do duelo. As permissões Hasura habilitam subscriptions WebSocket; a aplicação usa consultas automáticas como fallback.

## 3. Publicar a Function

O arquivo `functions/duel.js` vira o endpoint:

```text
https://<subdomain>.functions.<region>.nhost.run/v1/duel
```

Verifique no Nhost se o projeto conectado ao GitHub **publicou a revisão contendo `functions/duel.js`**. A integração ao GitHub não é prova suficiente: confira o histórico do deploy/Functions e os logs.

O método `GET` devolve o ranking público. `POST` exige um JWT Nhost validado pelo serviço Auth e aceita:

| Ação | Campos obrigatórios | Uso |
|---|---|---|
| `create` | `nickname` | Abre sala e cria código aleatório |
| `join` | `code`, `nickname` | Entra com a segunda conta na sala |
| `status` | `roomId` | Consulta sala e próxima pergunta individual |
| `answer` | `roomId`, `round`, `choice` | Corrige no servidor e incrementa pontos de forma atômica |
| `cancel` | `roomId` | Encerra sem alimentar o ranking |

O código verifica Auth em `/token/verify` e lê o identificador do usuário **somente após verificação**. Nunca aceita `user_id`, pontuação ou gabarito enviados pelo cliente. Atualizações de uma mesma rodada usam condição de concorrência no banco: uma resposta duplicada não incrementa pontos duas vezes.

Para deploy em domínio próprio/Oracle, acrescente o domínio completo a `CONQUEST_ALLOWED_ORIGINS` no **ambiente do backend Nhost Functions**, separado por vírgulas, por exemplo `https://jogo.exemplo.com`. O Pages oficial e o Vite local já estão autorizados.

## 4. Testar com duas contas

1. Abra o [CONQUEST no GitHub Pages](https://ruan-levi.github.io/Conquest-nuvem/) em duas janelas independentes, uma normal e outra anônima.
2. Em cada janela, clique em **Entrar / Cadastrar** e entre com **contas diferentes** do mesmo projeto Nhost.
3. Na primeira janela, abra **Duelo online → JOGAR**, defina um apelido e clique em **Criar sala**.
4. Copie o código de oito caracteres e informe-o na segunda janela em **Entrar no duelo**.
5. Responda às seis questões em cada janela. O placar deve acompanhar as mudanças **sem recarregar a página** (via WebSocket se autorizado, com fallback de consulta a cada 2,5 segundos).
6. Quando ambos terminarem, confira o vencedor nas duas janelas. Volte ao portal e confira os apelidos no **Ranking global**.
7. Teste o mesmo botão com uma terceira conta: ela não pode consultar o ID da sala nem enviar respostas; somente quem possui código pode tentar ingressar enquanto houver vaga.

Se a tela disser **“Nhost indisponível”**, confira primeiro o deploy de `functions/duel.js`, as duas estruturas SQL rastreadas (*tracked*) e o projeto público indicado na tela. Se houver rejeição de WebSocket, confira o SELECT de `user` na tabela e da view; a consulta periódica mantém o duelo utilizável.

## 5. O que está e o que não está pronto

- **Implementado no código:** interface de convite, sincronização, placar com dois usuários, correção de questões no backend, ranking baseado em duelos concluídos, fallback sem WebSocket, testes de lógica e verificação de acesso.
- **Exige ativação no Nhost:** migração SQL, Track no Hasura, permissões, Functions e duas contas de teste reais.
- **Limite consciente:** os pontos obtidos na campanha 3D local continuam demonstrativos e **não entram no ranking competitivo**. O resultado online só entra após os dois jogadores responderem todas as perguntas.
- **Não comprovado até testar no projeto real:** deploy da Function, WebSocket de produção e partidas entre duas contas remotas.

Fontes oficiais: [Nhost Functions](https://docs.nhost.io/products/functions), [GraphQL](https://docs.nhost.io/products/graphql), [Permissions](https://docs.nhost.io/products/graphql/permissions), [Token Verify](https://docs.nhost.io/reference/auth/post-token-verify).
