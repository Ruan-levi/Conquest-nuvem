# Plano de trabalho revisado — CONQUEST: A Jornada dos Conjuntos

**Projeto:** CONQUEST — Vale dos Conjuntos

**Equipe:** Grupo 08 — Desenvolvimento de Software em Nuvem, UNIFOR

**Revisão:** 19 de novembro de 2026

**Referência:** plano de evolução GitHub-first, requisitos da atividade, artefatos do repositório e alterações efetivamente implementadas.

> Este registro consolida as decisões e os **incrementos identificados durante o desenvolvimento**. Não substitui o enunciado oficial, não altera requisitos obrigatórios e não trata funcionalidades apenas planejadas como concluídas. A gravação do vídeo foi confirmada pelo integrante da equipe; o envio pelo AVA ainda não foi confirmado nesta revisão.

## 1. Proposta e objetivo

Desenvolver e disponibilizar um RPG educativo tridimensional no navegador para ensinar **Teoria dos Conjuntos** por meio de exploração, coleta de cristais, diálogos e batalhas com questões matemáticas. O projeto demonstra organização de código, automação de testes e deploy, com integração planejada aos recursos BaaS do Nhost e infraestrutura conteinerizada.

### Entregas principais

- **Aplicação web:** Vite + JavaScript + Babylon.js; mundo 3D, personagem, câmera, missão com Liora, três cristais, guardiões, batalha contra Cael e pontuação demonstrativa.
- **Interface:** portal de entrada, opções da jornada, acesso à conta, histórico privado condicionado à configuração do Nhost, HUD, pausa, tela de conclusão e controles móveis.
- **Repositório:** organização modular, documentação, testes automatizados, GitHub Actions e publicação de demonstração no GitHub Pages.
- **Nuvem:** cliente Nhost e infraestrutura Docker/Portainer/OCI preparados em diferentes níveis; integração real e comprovação de cada serviço continuam sujeitas a configuração e testes específicos.
- **Entrega acadêmica:** um único vídeo por equipe demonstrando a proposta e as funcionalidades. **Gravação concluída segundo a equipe; envio no AVA ainda não confirmado.**

## 2. Arquitetura escolhida e justificativas

| Camada | Tecnologia | Papel e limite |
|---|---|---|
| Interface e jogo | Vite, JavaScript, HTML e CSS | Interface e regras da jornada executadas no navegador |
| Cena 3D | Babylon.js | Terreno, câmera, personagem, efeitos e objetos interativos |
| Backend BaaS | Nhost (Auth, PostgreSQL, GraphQL, Storage, Realtime e Functions) | Cliente e operações preparadas; disponibilidade real depende das tabelas, permissões e funções aplicadas no projeto correto |
| Versionamento e CI/CD | GitHub, Pull Requests, GitHub Actions | Histórico, testes, build Vite, Pages e imagem Docker GHCR |
| Demonstração web | GitHub Pages | Versão pública estática do frontend; **não equivale à implantação em VPS** |
| Contêiner e hospedagem | Docker, GHCR, Portainer, Oracle Cloud | Imagem gerada em CI; VPS OCI, HTTPS e atualização da stack ainda sem comprovação |
| Protótipo paralelo | Unity URP | Experimentos gráficos independentes, **fora do executável web apresentado** |

**Decisão arquitetural:** manter um único CONQUEST web para Pages e possível publicação Docker; o Nhost fornece serviços, não um segundo jogo. Não expor segredos administrativos ou tokens privados no frontend. Não usar pontuação calculada pelo navegador como ranking competitivo confiável.

## 3. Funcionalidades previstas originalmente

| Frente | Situação verificada | Evidência e observação |
|---|---|---|
| Navegação 3D e campanha matemática | **Implementada e publicada** | `src/game/`; vídeo gravado pelo integrante; teste automatizado de lógica |
| Jogabilidade com objetivos, vida, acertos e cristais | **Implementada e publicada** | `src/main.js`, `src/game/logic.js` e testes |
| Autenticação e consulta no Nhost | **Interface publicada; integração real não comprovada** | `src/services/nhost.js`; foi relatado cadastro sem usuário visível em Auth |
| Banco e GraphQL com permissões por usuário | **Código de integração preparado; configuração e validação pendentes** | `docs/NHOST.md`, tabelas e políticas a conferir no Hasura |
| Storage privado e Realtime | **Cliente preparado; testes com Nhost real pendentes** | Upload e subscription estão na interface, dependem de permissões e infraestrutura |
| Desafio serverless verificado | **Implementado em branch/PR; não publicado na `main`** | PR #15 e PR #21, com migrações e Functions sujeitas a revisão |
| Ranking competitivo e dois jogadores online | **Não concluídos** | Ranking verificado ainda em PR; multiplayer simultâneo e ranking global em tempo real continuam pendentes |
| Docker e imagem no GHCR | **Automação aprovada** | GitHub Actions #30 do projeto |
| VPS Oracle, Portainer e HTTPS | **Pendente** | Roteiro em `infra/oci/README.md`; não declarar implantação real |

## 4. Incrementos acrescentados ao plano durante o projeto

Os itens **INC** abaixo registram alterações que não estavam descritas de forma explícita nas primeiras etapas do roteiro. Eles complementam os requisitos, sem substituí-los.

| ID | Incremento e motivo | Resultado e situação |
|---|---|---|
| INC-01 | **Portal inicial** para explicar proposta e permitir decidir antes de carregar a aventura | Tela de entrada responsiva publicada no Pages |
| INC-02 | **Acesso a cadastro e login antes de jogar**, evitando a necessidade de entrar primeiro no mundo 3D | Botões do portal abrem o painel Nhost; autenticação real necessita diagnóstico |
| INC-03 | **Apresentação dos modos de jogo e do progresso**, deixando claro o que está disponível ou em construção | Jornada 3D disponível; Desafio da Nuvem e duelo identificados como futuros |
| INC-04 | **Histórico privado de melhores partidas** para consultar pontuações da conta, sem inventar classificação global | Interface publicada; consulta depende da tabela `conquest_scores` e ACL do Nhost |
| INC-05 | **Voltar ao portal** pela pausa ou tela de resultado, melhorando a navegação | Comandos implementados na interface |
| INC-06 | **Texturas procedurais e decoração 3D** em solo, água, pedra, madeira, telhados e vila | Código publicado em `src/game/environment/`; sem assets externos obrigatórios |
| INC-07 | **Interações opcionais no cenário** com mural, pedra, fogueira e fonte, reforçando a exploração e os conceitos | Código publicado em `src/game/interactions.js`; testado em nível de lógica |
| INC-08 | **Melhorias de orientação e acessibilidade operacional:** HUD, marcador de objetivo, controles de câmera, sprint e controles móveis | Recursos presentes no frontend; QA visual em diferentes navegadores ainda recomendado |
| INC-09 | **Identificação do projeto Nhost na própria tela de conta**, para diagnosticar discrepância entre app e dashboard | Subdomínio e região públicos exibidos; não confirma que o cadastro funcionou |
| INC-10 | **Organização GitHub-first:** branches, PRs, revisão de migrações, documentação e CI automatizada | Release da interface pela PR #22; backend avançado mantido separado nas PRs #15/#21 |
| INC-11 | **Testes de lógica das interações e build reproduzível**, protegendo a versão demonstrável | 16 testes Vitest e build aprovados no workflow #30; testes serverless separados nas PRs de backend |
| INC-12 | **Roteiro para vídeo final obrigatório**, inclusive versão curta para apresentação simples | `docs/ROTEIRO_VIDEO_FINAL.md`; **vídeo gravado pela equipe**; verificar envio e acesso no AVA |

### Critérios de aceite dos incrementos

1. Portal carrega no GitHub Pages, apresenta a proposta e leva à jornada com um botão claro.
2. Login/cadastro abre sem iniciar o jogo; a tela identifica o projeto Nhost utilizado e não anuncia autenticação bem-sucedida antes da resposta do serviço.
3. Objetos decorativos/interativos preservam os objetivos e as batalhas obrigatórias.
4. Histórico mostra somente registros autorizados da conta; falhas do Nhost não impedem a campanha local.
5. CI verifica testes e compilação, enquanto a validação WebGL deve ser demonstrada em navegador compatível.
6. Na apresentação, serviços futuros devem ser identificados como pendentes; o vídeo precisa ser enviado conforme o AVA.

## 5. Processo de desenvolvimento adotado

1. **Levantar requisitos:** separar jogabilidade obrigatória, BaaS, deploy OCI e critérios acadêmicos; registrar prioridades.
2. **Implementar o núcleo do jogo:** mundo 3D, objetivos, perguntas, combate e testes de lógica.
3. **Incorporar incrementos de experiência:** portal, navegação, texturas, iluminação, interações e suporte a celulares.
4. **Preparar serviços de nuvem:** integração pública via variáveis de build, operações Auth/GraphQL e políticas com acesso mínimo; manter banco/Functions em PR quando não validados.
5. **Validar alterações no GitHub:** PR, testes automatizados e build; implantar frontend no Pages somente após aprovação.
6. **Verificar publicação e documentação:** confirmar URL, registrar status real, riscos e pendências.
7. **Demonstrar e entregar:** gravar um vídeo por equipe, mostrar tecnologias e resultado, conferir acessibilidade do arquivo/link e anexar os demais artefatos no AVA.

## 6. Validações e evidências existentes

- **Frontend publicado:** [CONQUEST no GitHub Pages](https://ruan-levi.github.io/Conquest-nuvem/), com portal e melhorias 3D.
- **Entrega do portal:** [PR #22 — integrada à `main`](https://github.com/Ruan-levi/Conquest-nuvem/pull/22).
- **CI da publicação:** [GitHub Actions #30 — sucesso](https://github.com/Ruan-levi/Conquest-nuvem/actions/runs/44555324162), com testes, build Vite, GHCR e Pages aprovados.
- **Testes automatizados:** 16 casos Vitest na versão web publicada; 7 testes Node adicionais nas propostas de backend, sem equivalência a teste Nhost real.
- **Apresentação acadêmica:** integrante da equipe confirmou que **gravou o vídeo e realizou a apresentação com sucesso**; não há confirmação neste registro de anexação ao AVA.
- **Limite da evidência:** ambiente de inspeção automatizada não conseguiu iniciar WebGL; não inferir que o jogo falha em todos os dispositivos. O usuário relatou jogabilidade real anteriormente.

## 7. Riscos, falhas observadas e prevenções

| Risco ou falha | Tratamento planejado |
|---|---|
| Cadastro não aparece no Auth do painel Nhost | Comparar subdomínio/região mostrados no jogo com o projeto aberto no Nhost; verificar resposta do cadastro, confirmação de e-mail e Auth → Users |
| Build aponta para projeto Nhost diferente | Conferir GitHub Actions Variables `NHOST_SUBDOMAIN`/`NHOST_REGION`; valores de `VITE_*` ficam públicos no navegador |
| Pontuação local adulterável | Não alimentar placar competitivo com score do browser; manter desafio validado em Functions separado até revisão |
| Migração Hasura altera permissões ou dados | Backups, revisão de roles, deploy controlado e plano de rollback antes de mesclar PR #15/#21 |
| Pages aparenta versão antiga | Conferir a execução de deploy e, em Settings → Pages, usar GitHub Actions como fonte (evitar concorrência com o fluxo Jekyll) |
| WebGL não inicia em algum navegador | Testar em Chrome/Edge com aceleração gráfica, reduzir efeitos em dispositivos limitados, registrar mensagem de erro e fallback |
| Texturas/cenário pesados em dispositivos móveis | Limitar densidade de decoração e resolução de texturas; revisar FPS e controles de toque |
| OCI/Portainer não implantados | Não tratar Docker no GHCR como prova de VPS; registrar pendência e demonstrar apenas a infraestrutura realmente disponível |
| Vídeo inacessível ao avaliador | Abrir link/arquivo em sessão sem privilégios; conferir envio e prazo da atividade no AVA |

## 8. Backlog após a apresentação

| Prioridade | Ação futura | Dependência e resultado esperado |
|---|---|---|
| Alta | Confirmar **envio do vídeo e artefatos no AVA** | Atividade de entrega do professor; confirmação da equipe |
| Alta | Verificar conta Nhost e fluxo de confirmação de e-mail | Projeto e Auth → Users correspondentes ao frontend publicado |
| Média | Testar tabelas, permissões Hasura, Storage e Realtime com duas contas | Nhost real configurado e credenciais de teste apropriadas |
| Média | Revisar e validar backend do desafio verificado antes de integrar PRs #15/#21 | Banco versionado, Function e permissões seguros |
| Média | Validar WebGL, responsividade e desempenho em dispositivos diferentes | Teste manual/QA visual |
| Condicional à exigência acadêmica | Implantar Oracle Cloud com Docker, Portainer, DNS e HTTPS | Conta e instância OCI, acesso à VPS, política de rede e domínio |
| Evolução posterior | Implementar ranking global em Realtime, validação integral da campanha e duelo de dois jogadores | Backend verificado, regras contra trapaça e testes de concorrência |

## 9. Controle de versão do plano

| Registro | Alteração |
|---|---|
| Plano inicial / roteiro existente | Foco em jogo educativo 3D, serviços BaaS, Docker, GitHub e Oracle |
| Revisão de 18/11/2026 | Separação entre backend verificado em PR e validação Nhost/OCI ainda pendente |
| Revisão de 19/11/2026 | Portal, interações e texturas 3D, histórico privado, diagnóstico Auth, GitHub Pages atualizado, CI aprovado e vídeo final gravado |

**Princípio de manutenção:** quando surgir uma funcionalidade não prevista, registrar o motivo, sua relação com os requisitos, o status real, como testar e a evidência da entrega. Assim o plano permanece fiel ao projeto, sem confundir intenção com implementação.
