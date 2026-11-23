# CONQUEST — Entregável 5: Ambientes de Desenvolvimento de Software

## Proposta da equipe (2 integrantes)

**CONQUEST — Vale dos Conjuntos** é um jogo educacional 3D em navegador. O jogador explora o mundo, enfrenta desafios de Teoria dos Conjuntos, recebe pontuação e pode registrar resultados em um serviço REST com SQLite. A modalidade de duelo com Nhost permanece como funcionalidade adicional independente, sujeita à disponibilidade do serviço externo.

## Matriz de conformidade

| Requisito | Evidência |
|---|---|
| Escolha de um jogo | `src/game/` com missões, batalhas e interações |
| HTML, CSS e JavaScript | `index.html`, `src/style.css`, `src/main.js` |
| React | `src/ui/entregavel5.js`, montado sobre o portal original |
| Backend Node.js | `server/index.mjs` (API HTTP REST e arquivos do build Vite) |
| API REST com rotas | `GET /api/health`, `POST /api/register`, `POST /api/login`, `POST /api/scores`, `PATCH /api/me` etc. |
| Autenticação e autorização | token de sessão, senhas scrypt, papéis `admin` e `jogador`; rotas privadas verificam autenticação |
| SGBD aceito | SQLite persistente no disco da instância EC2, `server/service.mjs` |
| Controle de versão | GitHub `Conquest-nuvem`; Entregável 5 mantém referência |
| Testes formais | Vitest original + `tests/entregavel5.node.mjs` + CI GitHub Actions |
| Hospedagem AWS | Instância EC2, Node.js e Nginx; URL e comprovação no README |

## Transações e divisão (mínimo de quatro para dois alunos)

**Integrante 1:** (1) cadastrar usuário `POST /api/register`; (2) autenticar-se `POST /api/login`; (3) modificar nome público `PATCH /api/me`.

**Integrante 2:** (4) registrar pontuação ao concluir partida `POST /api/scores`; (5) consultar histórico do jogador `GET /api/scores`; (6) sair da conta/revogar token `POST /api/logout`.

**Ações compartilhadas:** consultar ranking público `GET /api/ranking`, explorar cenário, resolver questões, publicar e testar. Os nomes efetivos de cada integrante podem ser preenchidos no documento de entrega.

## Roteiro de eventos da interface

1. Portal → iniciar jornada sem login ou clicar em **Conta e progresso AWS**.
2. Conta React → cadastrar usuário / entrar → backend valida → SQLite registra.
3. Jogar → completar jornada → evento `conquest:finished` → frontend React envia pontuação autenticada ao backend → SQLite persiste.
4. Conta → histórico e ranking → rotas REST consultam SQLite.
5. Admin de demonstração → consulta relação de contas (sem senhas) por rota com autorização.
6. Nhost → contas, duelo e ranking específico permanecem independentes da parte AWS acadêmica.

## Entidades de banco

`players(id, username, display_name, password_hash, role, created_at)`; `access_tokens(token_hash, player_id, expires_at)`; `scores(id, player_id, score, correct, finished, created_at)`.

## Entrada e saída dos serviços

- `POST /api/register`: entra `{username,display_name,password}`; retorna `{id,username,display_name,role}`.
- `POST /api/login`: entra `{username,password}`; retorna `{token,user}`.
- `GET /api/me`: usa `Authorization: Bearer token`; retorna dados do jogador.
- `PATCH /api/me`: entra `{display_name}` com token; retorna perfil atualizado.
- `POST /api/scores`: entra `{score,correct,finished}` com token; retorna `{id,saved:true}`.
- `GET /api/scores`: usa token; retorna histórico individual.
- `GET /api/ranking`: público; retorna melhores pontuações por jogador.
- `GET /api/admin/players`: somente `admin`, retorna contas sem hashes ou tokens.
- `GET /api/health`: público; retorna disponibilidade e indicação do banco.

## Limitações e cuidados

O jogo calcula pontuação no navegador; portanto, o ranking desse módulo **não é antitrapaça competitivo**. Ele demonstra persistência e transações acadêmicas. Duelos Nhost utilizam validação própria. A versão de demonstração em HTTP não deve receber senhas pessoais, e-mails reais ou dados sensíveis. HTTPS e domínio estável são melhorias recomendadas; o IP EC2 pode variar se a instância for parada e iniciada. O volume EBS continua sujeito ao consumo/cobrança AWS e deve ser monitorado.
