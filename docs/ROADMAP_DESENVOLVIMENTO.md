# CONQUEST — roteiro de desenvolvimento GitHub-first

> Data de revisao: 19/11/2026. A aplicacao **Vite + Babylon.js** e a entrega principal para a disciplina. O projeto Unity e uma trilha paralela e nao substitui Nhost/Oracle.

## Status por marco

| Marco | Entrega | Status | Acompanhamento |
|---|---|---|---|
| 0. Base web | Jogo 3D, missao, controles, perguntas, Vitest, Github Actions e Pages | Codigo e CI historicamente aprovados; QA visual pendente | #1, #5 |
| 1. Backend versionado | SQL migrations, Nhost Function, cliente e tela Desafio da Nuvem | Implementado na PR #15; testes locais e CI de PR; Nhost real pendente | PR #15, #2, #3 |
| 2. Conectar Nhost | Criar projeto dedicado, vincular repo/branch, Hasura metadata, Auth, Storage, Functions | Bloqueado por credenciais/operacao no projeto real | #2 |
| 3. Ranking verificavel | Query de ranking minimo e subscription em tempo real | Query e view preparados na PR #15; realtime global pendente | #16 |
| 4. Integrar aventura | Validacao server-side de todas as batalhas e progresso da campanha 3D | Pendente | #18 |
| 5. Competitivo 2 jogadores | Sala, sincronizacao, anti-replay, regras de vencedor e reconexao | Pendente | #17 |
| 6. Deploy obrigatorio OCI | Docker, Portainer, HTTPS, CI/CD GitHub/Oracle | Pipeline preparado; VPS e deploy real pendentes | #4 |
| 7. Aceite academico | RF01–RF07, RNF01–RNF06, evidencias e relatorio | Pendente | #5 |
| 8. Portal de entrada e apresentacao | Landing page, acesso antecipado a Auth, historico privado, retorno ao portal e roteiro de video | Publicacao preparada em branch de release; Pages a confirmar apos merge | Release Pages |

## Metodo de trabalho

1. Cada mudanca relevante nasce em branch `feature/*` ou `docs/*`. Preservar `main` como versao demonstravel.
2. Abrir PR com issue relacionada, requisito RF/RNF, testes e eventual migracao ou configuracao. Usar `npm test` e `npm run build`.
3. Revisar Actions e code review antes de merge. O Nhost conectado ao GitHub pode fazer deploy automatico apos merge na `main`; **nao** mesclar migrations sem plano de rollback/permissoes conferidas.
4. Variaveis publicas `NHOST_SUBDOMAIN` e `NHOST_REGION` em GitHub Actions Variables; valores `VITE_*` sao expostos ao browser. Chaves e segredos jamais no repositorio.
5. Registrar evidencia real: status do workflow, endpoint publicado, teste em duas contas e navegadores, logs Portainer/OCI, screenshot do WebGL.
6. Atualizar este roadmap, `docs/TRABALHO_FINAL.md` e Plano de Trabalho revisado quando a implementacao estiver comprovada.

## Ordem recomendada das proximas tarefas

**Prioridade 1:** vincular Nhost separado ao repositorio (#2) e validar a PR #15 com backend real.

**Prioridade 2:** ranking realtime (#16) e registro seguro da aventura (#18).

**Prioridade 3:** duelo 2 jogadores (#17) e QA WebGL (#1).
**Prioridade 4:** VPS Oracle/Portainer (#4) e aceite final (#5).

## Limitacoes conhecidas

- O score da **campanha 3D** continua local/experimental e nao deve alimentar ranking publico.
- O **Desafio da Nuvem** valida 6 perguntas no servidor, mas so funcionara com projeto Nhost real, migracoes e metadata configuradas.
- A consulta de ranking preparada nao substitui a subscription realtime exigida em RF06.
- A versao simples do GitHub Pages exibe somente **historico individual** da conta Nhost; o ranking competitivo global da PR #15 continua em revisao.
- Nhost Functions e GitHub Actions exigem verificacoes de permissao, cota e disponibilidade em cada ambiente real.
- A apresentacao final exige **um unico video gravado por equipe**, enviado junto aos arquivos no AVA. O roteiro esta em [ROTEIRO_VIDEO_FINAL.md](ROTEIRO_VIDEO_FINAL.md); conferir prazo na atividade.
