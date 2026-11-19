# CONQUEST — roteiro de desenvolvimento GitHub-first

**Versão detalhada e consolidada:** [Plano de Trabalho Revisado](PLANO_DE_TRABALHO_REVISADO.md), incluindo os 12 incrementos acrescentados ao escopo, critérios de aceite, evidências, riscos e pendências após a gravação do vídeo.

> Data de revisao: 19/11/2026. A aplicacao **Vite + Babylon.js** e a entrega principal para a disciplina. O projeto Unity e uma trilha paralela e nao substitui Nhost/Oracle.

## Status por marco

| Marco | Entrega | Status | Acompanhamento |
|---|---|---|---|
| 0. Base web | Jogo 3D, missao, controles, perguntas, Vitest, Github Actions e Pages | **Publicado:** 16 testes, CI e Pages aprovados no workflow #30; QA WebGL ainda recomendado | #1, #5 |
| 1. Backend versionado | SQL migrations, Nhost Function, cliente e tela Desafio da Nuvem | Implementado na PR #15; testes locais e CI de PR; Nhost real pendente | PR #15, #2, #3 |
| 2. Conectar Nhost | Criar projeto dedicado, vincular repo/branch, Hasura metadata, Auth, Storage, Functions | Bloqueado por credenciais/operacao no projeto real | #2 |
| 3. Ranking verificavel | Query de ranking minimo e subscription em tempo real | Query e view preparados na PR #15; realtime global pendente | #16 |
| 4. Integrar aventura | Validacao server-side de todas as batalhas e progresso da campanha 3D | Pendente | #18 |
| 5. Competitivo 2 jogadores | Sala, sincronizacao, anti-replay, regras de vencedor e reconexao | Pendente | #17 |
| 6. Deploy obrigatorio OCI | Docker, Portainer, HTTPS, CI/CD GitHub/Oracle | Pipeline preparado; VPS e deploy real pendentes | #4 |
| 7. Aceite academico | RF01–RF07, RNF01–RNF06, evidencias e relatorio | **Vídeo gravado pela equipe**; envio AVA e conformidade técnica integral não confirmados | #5 |
| 8. Portal de entrada e apresentacao | Landing page, acesso antecipado a Auth, historico privado, retorno ao portal e roteiro de video | **Publicado na main/Pages pela PR #22**; Auth real ainda a validar | PR #22 |
| 9. Incrementos não previstos | Melhorias visuais e interações, diagnóstico Auth, CI, roteiro de vídeo e controle de mudanças | Consolidado em [PLANO_DE_TRABALHO_REVISADO.md](PLANO_DE_TRABALHO_REVISADO.md) | INC-01 a INC-12 |

## Metodo de trabalho

1. Cada mudanca relevante nasce em branch `feature/*` ou `docs/*`. Preservar `main` como versao demonstravel.
2. Abrir PR com issue relacionada, requisito RF/RNF, testes e eventual migracao ou configuracao. Usar `npm test` e `npm run build`.
3. Revisar Actions e code review antes de merge. O Nhost conectado ao GitHub pode fazer deploy automatico apos merge na `main`; **nao** mesclar migrations sem plano de rollback/permissoes conferidas.
4. Variaveis publicas `NHOST_SUBDOMAIN` e `NHOST_REGION` em GitHub Actions Variables; valores `VITE_*` sao expostos ao browser. Chaves e segredos jamais no repositorio.
5. Registrar evidencia real: status do workflow, endpoint publicado, teste em duas contas e navegadores, logs Portainer/OCI, screenshot do WebGL.
6. Atualizar este roadmap, `docs/TRABALHO_FINAL.md` e [Plano de Trabalho Revisado](PLANO_DE_TRABALHO_REVISADO.md) com a evidência e a situação real de cada incremento.

## Ordem recomendada das proximas tarefas

**Prioridade acadêmica imediata:** confirmar que o vídeo e os artefatos foram enviados e podem ser abertos no AVA. A gravação já foi relatada como concluída.

**Prioridade 1 da evolução técnica:** conferir o projeto Nhost correto (#2), cadastro e login; validar a PR #15 com backend real.

**Prioridade 2:** ranking realtime (#16) e registro seguro da aventura (#18).

**Prioridade 3:** duelo 2 jogadores (#17) e QA WebGL (#1).

**Prioridade 4:** VPS Oracle/Portainer (#4) e aceite técnico final (#5), se ainda forem necessários.

## Limitacoes conhecidas

- O score da **campanha 3D** continua local/experimental e nao deve alimentar ranking publico.
- O **Desafio da Nuvem** valida 6 perguntas no servidor, mas so funcionara com projeto Nhost real, migracoes e metadata configuradas.
- A consulta de ranking preparada nao substitui a subscription realtime exigida em RF06.
- A versao simples do GitHub Pages exibe somente **historico individual** da conta Nhost; o ranking competitivo global da PR #15 continua em revisao.
- Nhost Functions e GitHub Actions exigem verificacoes de permissao, cota e disponibilidade em cada ambiente real.
- A apresentacao final exige **um unico video gravado por equipe**, enviado junto aos arquivos no AVA. A equipe informou que gravou o vídeo com sucesso; **o envio e a abertura pelo avaliador ainda não foram confirmados**. O roteiro está em [ROTEIRO_VIDEO_FINAL.md](ROTEIRO_VIDEO_FINAL.md).
