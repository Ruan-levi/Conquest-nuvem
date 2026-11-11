# ⚔️ CONQUEST — Vale dos Conjuntos

**Jogo 3D educacional de batalhas matemáticas | Desenvolvimento de Software em Nuvem — UNIFOR**

Projeto web em **Vite + Babylon.js**, organizado para **Nhost, GitHub Pages, Docker, Portainer e Oracle Cloud**.

> **Status real:** código de reconstrução publicado. **10 testes Vitest, compilação Vite, build Docker e deploy personalizado do GitHub Pages passaram no GitHub Actions**. Por segurança, confira em Settings → Pages se a fonte é GitHub Actions (há também um fluxo Jekyll automático da branch); Nhost e Oracle Cloud ainda precisam de contas/configuração. O modo multiplayer online não está implementado nesta versão.

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
tests/
  logic.test.js           Testes da movimentação e progressão
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

- **Nhost:** serviço opcional de autenticação e GraphQL. Exige configurar projeto, tabela e políticas Hasura.
- **GitHub Pages:** site estático após ativar o workflow em Settings → Pages.
- **GHCR:** imagem Docker automatizada após testes bem-sucedidos.
- **Oracle Cloud/Portainer:** VPS, HTTPS e atualização automática após a configuração das contas.

O frontend **não pode conter admin secret**. Valores VITE_* são públicos. A pontuação é calculada no navegador nesta etapa e **não deve ser considerada confiável para competições até existir validação no servidor**.

## 📚 Documentação

- [Conectar o Nhost](docs/NHOST.md)
- [Publicar Pages e Oracle/Portainer](docs/PUBLICACAO.md)
- [Conferência do trabalho final](docs/TRABALHO_FINAL.md)

### Estado de implementação

| Funcionalidade | Estado |
|---|---|
| Jogabilidade matemática e progressão | Código disponível |
| WASD corrigido, corrida, animação e navegação | Código disponível |
| Testes Vitest e workflow CI/CD | **10 testes e build aprovados no GitHub Actions** |
| GitHub Pages | **Deploy Vite concluído no Actions; confirmar fonte GitHub Actions nas configurações** |
| Nhost Auth/GraphQL | Cliente preparado; ainda sem projeto conectado |
| Quatro recursos BaaS comprovados | Pendente |
| Multiplayer real | Pendente |
| Oracle/Portainer com HTTPS | Pendente |

**Não confundir:** GitHub Pages permite demonstrar o jogo no navegador, mas a atividade também exige a publicação em **VPS Oracle com Docker e Portainer**.

## ✅ Primeira execução automatizada verificada

O workflow de **11/11/2026** executou o teste automatizado (**10 aprovados**), o build de produção Vite, a publicação da imagem Docker no GHCR e o deploy de Vite no GitHub Pages, todos com **conclusão de sucesso**. [Ver execução oficial](https://github.com/Ruan-levi/Conquest-nuvem/actions/runs/43043313992).

**Limite da verificação:** essa evidência confirma build, testes unitários e deploy, mas não comprova que cada cena WebGL e cada controle foram testados visualmente em um navegador real. A validação de Nhost e OCI continua pendente.

## 🤝 Melhorias futuras

Ao solicitar alterações, podemos modificar o código no GitHub, documentar a mudança e conferir o resultado no Actions. Próximas prioridades: validar WebGL/browser, resolver colisões e desempenho, conectar Nhost, implementar Storage e sincronização em tempo real, e concluir a publicação Oracle com evidências acadêmicas.
