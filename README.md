# ⚔️ CONQUEST — Vale dos Conjuntos

**Jogo educacional 3D de Teoria dos Conjuntos · UNIFOR · Entregável 5 de Ambientes de Desenvolvimento de Software**

Explore um vale medieval, encontre a anciã Liora, reúna três cristais, enfrente guardiões matemáticos e derrote Cael. O projeto web original foi **reutilizado para a Entregável 5**, acrescentando um painel React e um backend REST com SQLite na AWS.

[![Conquest - CI/CD](https://github.com/Ruan-levi/Conquest-nuvem/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Ruan-levi/Conquest-nuvem/actions/workflows/ci-cd.yml)
[![Entregável 5 - AWS](https://github.com/Ruan-levi/Conquest-nuvem/actions/workflows/aws-entregavel5.yml/badge.svg)](https://github.com/Ruan-levi/Conquest-nuvem/actions/workflows/aws-entregavel5.yml)

## 🎮 Acessar o jogo

| Aplicação / serviço | Link |
|---|---|
| **Jogar CONQUEST na AWS — Entregável 5** | **[http://3.149.254.9/](http://3.149.254.9/)** |
| **Verificar backend REST e SQLite** | [API `/api/health`](http://3.149.254.9/api/health) |
| **Ranking da Entregável 5** | [API `/api/ranking`](http://3.149.254.9/api/ranking) |
| Portal web original GitHub Pages | [ruan-levi.github.io/Conquest-nuvem](https://ruan-levi.github.io/Conquest-nuvem/) |
| Registro da disciplina | [Entregavel5-Ambientes](https://github.com/Ruan-levi/Entregavel5-Ambientes) |
| Teste da aplicação pública | [GitHub Actions — AWS](https://github.com/Ruan-levi/Conquest-nuvem/actions/workflows/aws-entregavel5.yml) |

> **Uso acadêmico:** a URL AWS usa **HTTP**, ainda sem HTTPS; use somente contas, senhas e informações fictícias. A instância usa IP público não reservado, que pode mudar após parada e reinício. Infraestrutura AWS pode consumir créditos ou gerar custos.

## 📋 Funcionalidades

- **Jornada 3D sem login:** exploração, movimentação WASD, câmera Q/R, corrida Shift, interação E, cristais, perguntas, batalhas e pontuação.
- **Progresso AWS (React):** cadastro e login de jogadores, edição do nome público, salvamento de pontuações, histórico e ranking de resultados gravados no SQLite.
- **Backend REST (Node.js):** autenticação por sessão, controle de acesso `jogador` / `admin`, operações com persistência e respostas JSON.
- **Módulos do projeto original (Nhost):** login externo, duelos de dois jogadores, ranking específico das disputas e integrações GraphQL/Storage/Realtime. A disponibilidade depende da configuração do projeto Nhost; **as contas do Nhost são independentes das contas AWS/SQLite**.
- **Engenharia:** Git/GitHub, GitHub Actions, testes automatizados, build Vite e publicação adicional do frontend via GitHub Pages/GHCR.

A equipe da **Entregável 5 tem duas pessoas**, e a aplicação implementa mais do que as quatro transações mínimas previstas. Consulte a [matriz de requisitos](docs/ENTREGAVEL5.md).

## 🛠️ Linguagens e tecnologias utilizadas

| Tecnologia | Função | Onde estudar o código |
|---|---|---|
| **HTML5** | Portal, formulários, HUD e canvas | [`index.html`](index.html) |
| **CSS3** | Estilo e interface responsiva | [`src/style.css`](src/style.css), [`src/ui/entregavel5.css`](src/ui/entregavel5.css) |
| **JavaScript (ES Modules)** | Lógica da jornada, eventos e regras | [`src/main.js`](src/main.js), [`src/game/logic.js`](src/game/logic.js) |
| **Babylon.js / WebGL** | Cenários, câmera, iluminação e objetos 3D | [`src/game/scene.js`](src/game/scene.js) |
| **React 18** | Painel de conta, progresso e ranking AWS | [`src/ui/entregavel5.js`](src/ui/entregavel5.js) |
| **Node.js 22** | API REST e entrega do frontend compilado | [`server/index.mjs`](server/index.mjs) |
| **SQL / SQLite** | Jogadores, tokens, histórico e pontuação | [`server/service.mjs`](server/service.mjs) |
| **Vite / npm / Vitest** | Desenvolvimento, compilação e testes | [`package.json`](package.json), [`vite.config.js`](vite.config.js) |
| **YAML / GitHub Actions** | Testes, build e verificação de publicação | [`.github/workflows/`](.github/workflows/) |

O protótipo **Unity/C#** está em [`unity-remake/`](unity-remake/) e **não integra o jogo web publicado**. O [Dockerfile](Dockerfile) e [docker-compose.yml](docker-compose.yml) do projeto original publicam **o frontend estático**, não o backend SQLite da AWS. O servidor REST usa a API HTTP nativa do Node.js, sem Express.

**[Explicação detalhada de cada linguagem, módulo e exemplos de código](docs/ARQUITETURA_E_CODIGO.md)**

## 🗂️ Estrutura do repositório

```text
Conquest-nuvem/
├── index.html                  # Portal e canvas 3D
├── src/
│   ├── main.js                 # Aventura, controles e eventos
│   ├── style.css               # Interface principal
│   ├── game/                   # Lógica, cenários, questões e mundo
│   ├── ui/                     # Duelo e painel React da Entregável 5
│   └── services/nhost.js       # Integração Nhost original
├── server/
│   ├── index.mjs               # Servidor Node.js HTTP / API REST
│   └── service.mjs             # Autenticação, regras e SQLite
├── tests/                      # Testes do jogo, duelo e Entregável 5
├── scripts/                    # Verificações públicas e de API
├── docs/                       # Documentação acadêmica e técnica
├── functions/                  # Function de duelos Nhost
├── nhost/migrations/           # SQL PostgreSQL da integração Nhost
├── infra/oci/                  # Alternativa anterior Oracle/Portainer
├── unity-remake/               # Protótipo Unity separado
├── .github/workflows/          # Testes, builds e verificações AWS
├── package.json
├── vite.config.js
├── Dockerfile
└── docker-compose.yml
```

## 💻 Como instalar e executar

**Pré-requisitos:** Git, Node.js 22.12+ e npm. O navegador precisa suportar WebGL e acessar a CDN React para exibir o painel complementar.

### 1. Baixar e iniciar o jogo (frontend Vite)

```bash
git clone https://github.com/Ruan-levi/Conquest-nuvem.git
cd Conquest-nuvem
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. Esse modo serve o **frontend**, mas não inicializa o backend SQLite.

### 2. Testar, compilar e executar a aplicação completa

```bash
npm test
npm run build
```

Em **Linux/macOS**, por exemplo:

```bash
mkdir -p data
CONQUEST_DB="$PWD/data/conquest.sqlite" CONQUEST_DIST="$PWD/dist" PORT=4000 node server/index.mjs
```

Abra `http://127.0.0.1:4000/`. Em Windows, consulte os comandos PowerShell no [guia de configuração e execução](docs/CONFIGURACAO_E_EXECUCAO.md).

**Variáveis:** `CONQUEST_DB` (banco), `CONQUEST_DIST` (arquivos estáticos), `PORT` (porta) e, opcionalmente, `CONQUEST_ADMIN_USER` e `CONQUEST_ADMIN_PASSWORD` (semente inicial de administrador). Não publique senhas ou tokens.

## ☁️ Publicação na AWS

A versão da **Entregável 5** está em uma instância EC2 `t3.micro`, **us-east-2 (Ohio)**, com:

- **Amazon Linux 2023**, Nginx na **porta 80** e Node.js no loopback **127.0.0.1:4000**.
- Frontend gerado em `/opt/conquest/dist`; código do servidor em `/opt/conquest/server/`.
- Banco SQLite em `/var/lib/conquest/conquest.sqlite` persistido no volume EBS.
- Acesso administrativo à instância por **AWS Systems Manager / Session Manager**.
- Verificações externas da página, API, ranking e controle de acesso no GitHub Actions.

**[Configuração da EC2, comandos de criação, inicialização, atualização, testes e monitoramento](docs/CONFIGURACAO_E_EXECUCAO.md)**

> A CI compila e testa, e o workflow AWS verifica a URL publicada. **O deploy na EC2 ainda é manual**: atualizar Git, rodar `npm ci`, `npm test`, `npm run build` e reiniciar `conquest`. Não confundir aprovação do workflow com atualização automática do servidor.

## 🧪 Testes

```bash
npm test
npm run build
```

- Vitest: lógica da campanha, interações e integração Nhost simulada.
- `node:test`: fluxo de duelo e operações da API REST/SQLite (cadastro, login, ranking, perfil e permissões).
- `scripts/live-check.mjs`: cenário de integração de verdade, **cria registros fictícios** no SQLite quando executado em servidor de demonstração.
- GitHub Actions: build, testes, GitHub Pages, GHCR e verificação pública da AWS.

**[Serviços REST, modelos SQL, exemplos de requisições e transações por integrante](docs/API_E_BANCO.md)**

## 📖 Índice completo de documentação

| Guia | Conteúdo |
|---|---|
| [**Arquitetura e códigos**](docs/ARQUITETURA_E_CODIGO.md) | Linguagens, estrutura de pastas, trechos de código e fluxo de dados |
| [**Configuração e execução**](docs/CONFIGURACAO_E_EXECUCAO.md) | Git, npm, Vite, Node.js, EC2, Nginx, AWS e testes |
| [**API e banco de dados**](docs/API_E_BANCO.md) | REST, SQLite, autenticação e E/S das transações |
| [**Entregável 5**](docs/ENTREGAVEL5.md) | Requisitos da disciplina e divisão das transações |
| [Plano de trabalho](docs/PLANO_DE_TRABALHO_REVISADO.md) | Histórico de desenvolvimento do CONQUEST original |
| [Nhost](docs/NHOST.md) | Configuração do projeto externo |
| [Duelos Nhost](docs/NHOST_DUELOS.md) | Function, permissões e ranking de duelo |
| [Validação técnica](docs/VALIDACAO_FINAL.md) | Limites de validação do trabalho original |
| [Publicação Oracle/Portainer](docs/PUBLICACAO.md) | Alternativa do trabalho original, não o deploy AWS atual |
| [Protótipo Unity](unity-remake/README.md) | Experimento visual independente |

## ⚠️ Limitações conhecidas

1. AWS usa **HTTP**, não HTTPS. Faça a demonstração apenas com **contas de teste**.
2. A pontuação da campanha é calculada no cliente; o ranking da Entregável 5 é acadêmico, **não antifraude**.
3. A integração de duelos **Nhost** depende de serviço externo e validação com duas contas; não é o banco SQLite da Entregável 5.
4. Ainda não foi realizada uma verificação visual completa de todas as cenas WebGL nos navegadores/dispositivos finais.
5. EC2, EBS, IPv4 e transferência de dados podem gerar cobrança dependendo do plano, dos créditos e do uso.

---

**CONQUEST · Projeto educacional da UNIFOR · Repositório principal do jogo e documentação da Entregável 5.**
