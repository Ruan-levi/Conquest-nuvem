# ⚔️ CONQUEST — Vale dos Conjuntos

**Jogo 3D educacional de batalhas matemáticas | Desenvolvimento de Software em Nuvem — UNIFOR**

## 🎮 [CLIQUE AQUI PARA JOGAR CONQUEST](https://ruan-levi.github.io/Conquest-nuvem/)

**Acesse gratuitamente pelo navegador:** https://ruan-levi.github.io/Conquest-nuvem/

No portal, você pode iniciar a aventura 3D sem cadastro. O duelo online e o ranking global
exigem que a integração do Nhost esteja configurada e publicada conforme [as instruções](docs/NHOST.md).

Projeto web em **Vite + Babylon.js**, organizado para **Nhost, GitHub Pages, Docker, Portainer e Oracle Cloud**.

**Atualização para GitHub Pages:** portal inicial com cadastro/login antes da aventura, modos de jogo, histórico individual de pontuação no Nhost (somente com tabelas/permissões configuradas) e retorno ao portal ao pausar/concluir. O ranking global e o duelo de dois jogadores já estão publicados no GitHub Pages e no backend Nhost. O acesso com duas contas ainda precisa de um teste completo.

> **Status real (19/11/2026):** portal e melhorias 3D publicados, **16 testes Vitest, build Vite, imagem Docker GHCR e deploy personalizado do GitHub Pages aprovados no workflow #30**. Confira em Settings → Pages se a fonte é GitHub Actions. O Nhost implantou a Function `/duel`, a tabela `conquest_duels`, a view de ranking e os metadados Hasura com sucesso; o ranking público foi consultado na aplicação publicada. **Ainda falta testar a partida completa com duas contas reais e o WebSocket entre dispositivos.** Oracle Cloud permanece pendente.

## 🏰 Projeto Unity 6.3 LTS (prototipo visual URP)

Existe uma trilha **separada** em [unity-remake/ConquestUnity](unity-remake/ConquestUnity/README.md),
com scripts Unity C#, gerador de cena 3D de vila medieval, terrenos PBR,
iluminacao, camera em terceira pessoa e cristais coletaveis. A cena precisa
ser **gerada e validada no Unity Editor** por Tools > Conquest > Gerar cenario 3D URP.
A estrutura Unity ainda nao foi compilada em Unity nem convertida em executavel Windows;
a jogabilidade academica e o Nhost/Oracle continuam na aplicacao web.

## 🎓 Entregável 5 — Ambientes de Desenvolvimento de Software

O Conquest também é a aplicação oficial da Entregável 5 (equipe de dois integrantes). Mantivemos a campanha 3D original e adicionamos uma camada acadêmica em **React** para contas e progresso, com API **Node.js REST**, banco **SQLite** e autenticação com papéis. O Nhost permanece como sistema independente dos duelos online existentes.

**[Matriz de requisitos, transações, estrutura do banco e serviços da Entregável 5](docs/ENTREGAVEL5.md)**.

A URL AWS será registrada aqui após a validação do deploy.

## 🎮 Acessar e executar

- **Código-fonte:** https://github.com/Ruan-levi/Conquest-nuvem
- **GitHub Actions:** https://github.com/Ruan-levi/Conquest-nuvem/actions
- **Endereço do Pages informado pelo workflow de deploy bem-sucedido:** https://ruan-levi.github.io/Conquest-nuvem/

Instale **Node.js 22.12+** e npm:

~~~bash
git clone https://github.com/Ruan-levi/Conquest-nuvem.git
cd Conquest-nuvem
npm install
npm run dev
~~~

Abra a URL indicada pelo Vite, geralmente http://localhost:5173/.

~~~bash
npm test
npm run build
npm run preview
~~~

## 🎮 Controles aprimorados

| Tecla | Função |
|---|---|
| **W / S** | Avançar / recuar (W = frente; S = trás, sem inversão) |
| **A / D** | Esquerda / direita, relativas à câmera |
| **Shift** | Corrida com animação dos braços e pernas |
| **Q / R** | Girar câmera |
| **E** | Conversar, coletar cristais, iniciar combate |
| **1 a 4** | Selecionar a resposta nas batalhas |
| **Esc** | Pausar |
| **Celular** | Botões na tela para movimentação, corrida e ação |

**A orientação durante a história inclui**: painel de objetivo, seta giratória, distância até o destino, marcador flutuante no mundo 3D e pontos luminosos indicando o caminho.

## 🌿 A história

1. Encontre **Liora** na vila.
2. Reúna os **três cristais do conhecimento**.
3. Derrote os Guardiões de **União, Interseção e Complemento** resolvendo questões de conjuntos.
4. Siga até o castelo e enfrente **Cael, o Excludente**.
5. Conclua a partida e veja vida, pontuação e respostas corretas.

**Observação sobre o Unity:** a versão anteriormente enviada era compilada para Windows. Esta reconstrução web usa modelos/cenários gerados em Babylon.js, não uma conversão automática do executável ou uma importação fiel dos rigs originais.

## 🗂️ Organização do repositório

~~~text
src/
  main.js                 Controles, HUD, menus e desafios
  style.css               Interface e controles móveis
  game/
    scene.js              Mundo 3D, personagem e animações
    world-map.js          Mapa e destinos da missão
    logic.js              Regras, combate, vidas e movimento
    questions.js          Perguntas de conjuntos
  services/
    nhost.js              Auth e GraphQL opcionais
  ui/
    duel.js               Sala online, perguntas e placar
functions/
  duel.js                 Validacao de duelos no servidor Nhost
  _shared/duel-questions.js  Gabarito privado dos duelos
nhost/migrations/
  002_conquest_duels.sql  Estrutura de duelos e ranking verificado
tests/
  logic.test.js           Testes da movimentação e progressão
  server/duel.node.mjs    Fluxo simulado de duas contas e anti-replay
docs/
  NHOST.md                Configuração do BaaS e permissões
  PUBLICACAO.md           Passos para Pages e Oracle Cloud
  TRABALHO_FINAL.md       Conformidade acadêmica
.github/workflows/
  ci-cd.yml               CI, Pages, GHCR e Portainer
Dockerfile
docker-compose.yml
~~~

## ☁️ Integrações em nuvem

**Atualização 11/11/2026 (branch de integração):** UI Conta/Ranking inclui histórico individual de pontuações via GraphQL, upload privado no Nhost Storage e subscription GraphQL Realtime; a migração SQL e permissões ainda precisam ser aplicadas num projeto real. Para Oracle/Portainer, consulte infra/oci/README.md. Sem credenciais/instância, não há deploy real na VPS.


- **Nhost:** serviço opcional de autenticação e GraphQL. Exige configurar projeto, tabela e políticas Hasura.
- **GitHub Pages:** site estático após ativar o workflow em Settings → Pages.
- **GHCR:** imagem Docker automatizada após testes bem-sucedidos.
- **Oracle Cloud/Portainer:** VPS, HTTPS e atualização automática após a configuração das contas.

O frontend **não pode conter admin secret**. Valores VITE_* são públicos. A pontuação é calculada no navegador nesta etapa e **não deve ser considerada confiável para competições até existir validação no servidor**.

## 📚 Documentação

- [Conectar o Nhost](docs/NHOST.md)
- [Ativar ranking global e duelos de dois jogadores no Nhost](docs/NHOST_DUELOS.md)
- [Publicar Pages e Oracle/Portainer](docs/PUBLICACAO.md)
- [Conferência do trabalho final](docs/TRABALHO_FINAL.md)
- [Organização dos módulos, melhorias visuais e checklist de QA](docs/ORGANIZACAO_E_QA.md)
- [Roteiro de gravação e entrega do vídeo obrigatório no AVA](docs/ROTEIRO_VIDEO_FINAL.md)
- [Plano de Trabalho Revisado — incrementos, evidências, riscos e pendências](docs/PLANO_DE_TRABALHO_REVISADO.md)

### Estado de implementação

| Funcionalidade | Estado |
|---|---|
| Jogabilidade matemática e progressão | Código disponível |
| WASD corrigido, corrida, animação e navegação | Código disponível |
| Testes Vitest e workflow CI/CD | **16 testes e build aprovados no workflow #30** |
| GitHub Pages | **Novo portal e melhorias 3D publicados pela PR #22; confirmar fonte GitHub Actions nas configurações** |
| Nhost Auth/GraphQL | Cliente configurado no build; cadastro, tabelas e permissões reais pendentes de validação |
| Quatro recursos BaaS comprovados | Pendente |
| Multiplayer real e ranking global | Frontend e backend publicados; ranking público consultado com sucesso; teste de duas contas e WebSocket pendente |
| Oracle/Portainer com HTTPS | Pendente |

**Não confundir:** GitHub Pages permite demonstrar o jogo no navegador, mas a atividade também exige a publicação em **VPS Oracle com Docker e Portainer**.

## ✅ Primeira execução automatizada verificada

O workflow de **11/11/2026** executou o teste automatizado (**10 aprovados**), o build de produção Vite, a publicação da imagem Docker no GHCR e o deploy de Vite no GitHub Pages, todos com **conclusão de sucesso**. [Ver execução oficial](https://github.com/Ruan-levi/Conquest-nuvem/actions/runs/43043313992).

**Limite da verificação:** essa evidência confirma build, testes unitários e deploy, mas não comprova que cada cena WebGL e cada controle foram testados visualmente em um navegador real. A validação de Nhost e OCI continua pendente.

## 🤝 Melhorias futuras

Ao solicitar alterações, podemos modificar o código no GitHub, documentar a mudança e conferir o resultado no Actions. Próximas prioridades: validar WebGL/browser, resolver colisões e desempenho, conectar Nhost, implementar Storage e sincronização em tempo real, e concluir a publicação Oracle com evidências acadêmicas.
