# CONQUEST — Arquitetura, linguagens e códigos

> Documentação técnica da aplicação **CONQUEST — Vale dos Conjuntos**, reutilizada como **Entregável 5 de Ambientes de Desenvolvimento de Software**. Este texto descreve os arquivos existentes no repositório em 23/11/2026 e distingue o módulo AWS/SQLite do Nhost original.

## 1. O que foi desenvolvido

Jogo educacional 3D sobre **Teoria dos Conjuntos**, com vila e cenário medieval procedural, exploração, conversa com Liora, coleta de três cristais, batalhas contra guardiões e confronto final com Cael. As perguntas cobrem união, interseção, complemento e diferença de conjuntos.

A **campanha 3D pode ser jogada como visitante**. A camada adicional da Entregável 5 permite criar conta, autenticar, alterar nome de exibição, salvar resultados, consultar histórico e visualizar um ranking público da campanha.

O projeto original possui **um segundo sistema de autenticação e duelo**, integrado ao Nhost; **não confundir a conta AWS/SQLite com a conta Nhost**.

## 2. Linguagens e ferramentas realmente presentes

| Linguagem/tecnologia | Uso no jogo | Principais arquivos |
|---|---|---|
| **HTML5** | Estrutura do portal, formulários, HUD, diálogos e canvas do mundo 3D | `index.html` |
| **CSS3** | Estilo do portal, responsividade, HUD e painel da entrega | `src/style.css`, `src/ui/entregavel5.css` |
| **JavaScript (ES Modules)** | Lógica, movimento, cenários, combate, questões e interface | `src/main.js`, `src/game/*.js` |
| **Babylon.js** | Renderização WebGL, câmera, iluminação, malhas e materiais 3D | `src/game/scene.js`, `src/game/environment/` |
| **React 18** | Painel complementar **Progresso AWS**, com estado e chamadas REST | `src/ui/entregavel5.js`, importado de `src/main.js`; scripts React carregados em `index.html` |
| **Node.js 22** | Servidor HTTP, rotas REST, segurança de sessão e entrega do frontend compilado | `server/index.mjs`, `server/service.mjs` |
| **SQL / SQLite** | Persistência de contas, tokens e pontuações; consultas de histórico e ranking | `server/service.mjs` |
| **YAML** | Pipeline CI/CD e teste externo da URL AWS | `.github/workflows/*.yml` |
| **Dockerfile / Compose** | Build e imagem Docker da versão estática do frontend original | `Dockerfile`, `docker-compose.yml` |
| **C#** | Protótipo **Unity separado**, não integrado ao jogo web publicado | `unity-remake/ConquestUnity/Assets/Scripts/` |

**Observação:** a implementação principal **não é escrita em C#**, e o protótipo Unity não é o executável hospedado na AWS. O backend REST implementado usa o módulo HTTP nativo do Node.js, **não Express ou Django**. O enunciado admite Node.js, rotas e Web Services REST.

## 3. Organização do código

```text
Conquest-nuvem/
├── index.html                    # Portal e canvas Babylon.js
├── package.json                  # Scripts npm e dependências
├── package-lock.json             # Versões resolvidas das dependências
├── vite.config.js                # Vite: build e base GitHub Pages
├── src/
│   ├── main.js                   # Fluxo da aventura, HUD e eventos
│   ├── style.css                 # Estilos principais
│   ├── game/
│   │   ├── scene.js              # Criação da cena 3D
│   │   ├── logic.js              # Estado do jogo, movimentação e combate
│   │   ├── questions.js          # Questões e alternativas
│   │   ├── world-map.js          # Missões, coordenadas e objetivos
│   │   ├── interactions.js       # Interações opcionais
│   │   └── environment/          # Cenário e texturas
│   ├── ui/
│   │   ├── duel.js               # Interface do duelo Nhost
│   │   ├── entregavel5.js        # Painel React da Entregável 5
│   │   └── entregavel5.css       # Estilos do painel
│   └── services/nhost.js         # Cliente Nhost/GraphQL (projeto original)
├── server/
│   ├── index.mjs                 # HTTP, rotas REST e frontend de produção
│   └── service.mjs               # SQLite, validações, sessões e regras da API
├── tests/                        # Vitest + testes Node
├── scripts/
│   ├── live-check.mjs            # Teste completo da API em execução
│   └── smoke-cloud.mjs           # Teste de ranking Nhost, se configurado
├── nhost/migrations/             # SQL original do Nhost (PostgreSQL)
├── functions/                    # Function do duelo Nhost
├── infra/oci/                    # Instruções da Oracle (alternativa, não AWS)
├── .github/workflows/            # GitHub Actions
├── Dockerfile                    # Frontend estático em Nginx
├── docker-compose.yml            # Stack opcional da Oracle
└── unity-remake/                 # Protótipo Unity independente
```

## 4. Exemplos reais de implementação

### Lógica de movimento — `src/game/logic.js`

```js
export function movementVector(keys, yaw = 0) {
  const forward = Number(Boolean(keys.w || keys.arrowup)) - Number(Boolean(keys.s || keys.arrowdown));
  const strafe = Number(Boolean(keys.d || keys.arrowright)) - Number(Boolean(keys.a || keys.arrowleft));
  const magnitude = Math.hypot(forward, strafe);
  if (magnitude === 0) return { x: 0, z: 0 };
  const f = forward / magnitude;
  const r = strafe / magnitude;
  return {
    x: Math.sin(yaw) * f + Math.cos(yaw) * r,
    z: Math.cos(yaw) * f - Math.sin(yaw) * r
  };
}
```

A função usa a orientação da câmera e normaliza as diagonais. As constantes do arquivo incluem `WALK_SPEED = 5.2` e `RUN_SPEED = 9.0`.

### Cena 3D — `src/game/scene.js`

```js
const engine = new B.Engine(canvas, true, {
  preserveDrawingBuffer: false, stencil: false, antialias: true
}, true);
const scene = new B.Scene(engine);
const camera = new B.FreeCamera("Câmera de exploração", v(0, 9, -17), scene);
```

O módulo também cria luzes, terreno, câmera, materiais e objetos com a API Babylon.js.

### API REST — `server/index.mjs`

```js
const service = createConquestService(
  process.env.CONQUEST_DB || '/var/lib/conquest/conquest.sqlite'
);
service.seedAdmin();
```

O servidor usa `http.createServer`, identifica caminhos `/api/` e encaminha as operações ao `service.dispatch(...)`; os demais caminhos servem os arquivos compilados do Vite.

### SQLite — `server/service.mjs`

```js
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(file);
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
```

São criadas três tabelas: `players`, `access_tokens` e `scores`. Senhas usam `scryptSync` com salt; tokens são aleatórios e armazenados em hash SHA-256. As rotas privadas exigem `Authorization: Bearer <token>`.

### React — `src/ui/entregavel5.js`

```js
const React = window.React;
const { useEffect, useState } = React;
const { createRoot } = window.ReactDOM;
```

O painel utiliza hooks, chamadas `fetch('/api/...')` e um evento `conquest:finished` emitido ao terminar a jornada. O React 18 é carregado por CDN no `index.html`, portanto **a conexão com a CDN é necessária para esse painel na implementação atual**.

## 5. Fluxo de dados

1. O jogador abre a URL AWS, e o Node.js devolve o frontend gerado pelo Vite.
2. A cena Babylon.js e os controles executam no navegador.
3. Ao abrir **Progresso AWS**, o painel React consulta a API REST na mesma origem.
4. Cadastro/login geram registros e token de sessão no SQLite.
5. Ao terminar a jornada, o evento do jogo permite registrar pontuação autenticada na API.
6. O backend grava ou consulta o banco e retorna JSON.
7. As rotas administrativas verificam `role === 'admin'`.

**Limite:** o placar da campanha é calculado no navegador e não é um ranking competitivo antifraude. O duelo Nhost possui outro fluxo de validação.

## 6. Recursos do projeto original que permanecem separados

- **Nhost:** auth própria, PostgreSQL, Hasura GraphQL, Storage, Realtime e Function de duelos; configurar e verificar conforme `docs/NHOST.md` e `docs/NHOST_DUELOS.md`.
- **GitHub Pages:** alternativa de frontend estático; não substitui o backend AWS/SQLite.
- **Docker/GHCR/Oracle/Portainer:** trilha de publicação anterior. O `Dockerfile` atual gera **frontend estático em Nginx**, sem embutir o servidor `server/index.mjs` ou o SQLite.
- **Unity:** protótipo visual C# independente.

Para instalar e configurar, consulte [CONFIGURACAO_E_EXECUCAO.md](CONFIGURACAO_E_EXECUCAO.md). Para a entrega acadêmica, consulte [ENTREGAVEL5.md](ENTREGAVEL5.md).
