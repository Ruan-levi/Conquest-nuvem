# CONQUEST — acompanhamento de requisitos e integracao em nuvem

> Revisao: 18/11/2026. Documento de acompanhamento tecnico; nao substitui o Plano de Trabalho aprovado.

## Fontes de referencia e escopo

- Projeto: **CONQUEST — A Jornada dos Conjuntos** (UNIFOR, Desenvolvimento de Software em Nuvem).
- Aplicacao principal para a disciplina: **Vite + Babylon.js (web)**.
- Backend obrigatório: **Nhost (BaaS)**. Infraestrutura: **Docker + Portainer + Oracle Cloud**, com CI/CD no **GitHub Actions**.
- O prototipo Unity em `unity-remake/` e uma trilha paralela, nao substitui os requisitos de nuvem da aplicacao web.
- Manter intacto qualquer projeto Nhost anterior: foi identificado no fluxo Work o projeto `smartops-nhost`; a intencao e criar um projeto **separado** para o CONQUEST na organizacao `Baas Api's`.

## Estado verificado no repositorio

| Item | Situacao | Evidencia / proxima validacao |
|---|---|---|
| Vite, Babylon.js, controles, missoes e quiz | Implementado em codigo; teste visual pendente | `src/` e `README.md` |
| Vitest e build Vite | Resultado anterior documentado: 10 testes e build aprovados | `.github/workflows/ci-cd.yml`; reexecutar apos integracao |
| Pagina publicada via GitHub Pages | Deploy anterior documentado; conferir a versao atualmente servida | `README.md` |
| SDK e interface Nhost (Auth/GraphQL/Storage/Realtime) | Preparados em codigo, incorporados via PR #11 | `src/services/nhost.js`, `docs/NHOST.md` |
| Projeto Nhost exclusivo do CONQUEST | Criacao/parametros **nao comprovados** neste repositorio | Conferir painel Nhost; nao alterar `smartops-nhost` |
| Banco, permissoes Hasura e Storage no Nhost real | **Nao comprovados** | Aplicar migrações e regras, testar duas contas |
| Ranking geral de jogadores em tempo real (RF06) | **Pendente** | Hoje ha historico individual; nao confundir com ranking global |
| Modo competitivo sincronizado para 2 jogadores (RF07) | **Pendente** | Desenvolver partidas compartilhadas e sincronizacao |
| Validacao de respostas e pontos no backend | **Pendente** | Evitar pontuacoes manipuladas no navegador |
| Nhost Functions (serverless) | **Pendente** | Exigencia expressa no Plano de Trabalho |
| Docker + imagem GHCR | Workflow preparado / build anterior documentado | Confirmar execucao atual e imagem publicada |
| VM Oracle Cloud + Portainer + HTTPS | **Pendente de implementacao e comprovacao** | `infra/oci/README.md` |
| Protótipo Unity Windows | Fonte e gerador de cena disponiveis; build Windows nao comprovado | `unity-remake/` |

## Conformidade com os requisitos do Plano de Trabalho

- **RF01 Cadastro e login:** cliente Nhost criado; falta comprovacao da autenticacao com projeto real.
- **RF02 Ambiente 3D:** implementado em codigo; validar compatibilidade e jogabilidade no navegador.
- **RF03 Batalhas por perguntas:** implementado em codigo; conferir fluxos completos.
- **RF04 Pontuacao:** calculo local existente; requer validacao segura no backend.
- **RF05 Armazenar partidas:** codigo GraphQL e SQL existente; requer banco e permissoes reais.
- **RF06 Ranking em tempo real:** ainda nao atendido; historico individual nao equivale a classificacao entre jogadores.
- **RF07 Competitivo 2 jogadores:** ainda nao atendido; requer sincronizacao de estado e regra de disputa.
- **RNF01–RNF06:** verificar navegador 3D, seguranca, desempenho, Docker, GitHub e automacao em ambiente real.

### Quatro funcionalidades BaaS que devem ser demonstradas

O Plano de Trabalho indica explicitamente:
1. **Autenticacao Nhost**;
2. **Banco PostgreSQL / API GraphQL**;
3. **Comunicacao em tempo real** (subscription GraphQL);
4. **Funcoes serverless Nhost** (por exemplo, validacao de respostas e pontuacao).

**Storage privado** ja foi previsto no codigo e e um **recurso adicional**, mas nao substitui automaticamente a demonstracao de **funcoes serverless** exigida no documento original.

## Sequencia segura de execucao

1. **Nhost**: concluir criacao de projeto separado `conquest` (nome exato a definir no painel) na organizacao `Baas Api's`; registrar apenas `subdomain` e `region` publicos. Nao compartilhar segredos de admin, senhas ou tokens.
2. **Banco/seguranca**: revisar e aplicar `nhost/migrations/001_conquest_scores.sql`, acompanhar o Track no Hasura; restringir `user_id` ao usuario autenticado, sem UPDATE/DELETE para jogadores; impedir leitura publica de dados pessoais.
3. **Auth/GraphQL/Storage/Realtime**: configurar credenciais publicas de build no GitHub Actions, URLs de Auth, bucket `personal` e suas permissoes; validar login, salvamento, isolamento entre duas contas e duas abas sem refresh.
4. **Serverless/antifraude**: desenhar a API segura da partida; a resposta correta nao deve ser confiada ao navegador. Validar respostas, progressao e pontos no servidor; limitar repeticao de respostas, pedidos duplicados e abusos antes de permitir ranking competitivo.
5. **Ranking global**: publicar apenas dados minimos autorizados (apelido e pontos validados); consulta agregada para ranking, com subscription realtime. Manter dados privados separados do placar publico.
6. **Multiplayer**: tabelas/estado de salas, dois participantes, tempo/rodadas e desfecho; sincronizar progresso e pontuacoes com regras no backend, testar cenarios de reconexao.
7. **DevOps**: revisar GitHub Actions, testes, build de frontend com variaveis publicas de Nhost, imagem Docker e publicacao via Oracle Cloud/Portainer/HTTPS. Nao considerar GitHub Pages substituto da VPS.
8. **Aceite**: registrar demonstracoes reais de cada RF/RNF e dos quatro recursos BaaS antes de declarar a entrega concluida.

## Regras de implementacao e rastreabilidade

- Branch `main` permanece estavel; desenvolver em `feature/*` e revisar por Pull Request.
- Nunca colocar admin secret/credenciais em `VITE_*`, codigo cliente, docs, issues ou commits. Valores `VITE_*` sao expostos no bundle.
- A versao web e seus requisitos sao prioritarios frente ao remake Unity.
- A cada nova funcionalidade: atualizar tabela de status, documentar requisitos impactados, testes e possiveis alteracoes no Plano de Trabalho.
- **Adicionais identificados alem dos RF originais**: historico individual de partidas, armazenamento privado de imagens no Nhost Storage, navegacao guiada, corrida/animacoes, validacao antifraude e eventual trilha Unity para Windows.
- Antes da entrega academica, consolidar esses adicionais no Plano de Trabalho revisado, **sem afirmar que recursos ainda pendentes foram implementados**.
