# CONQUEST — API REST, banco SQLite e fluxo de transações

## Arquitetura

- **Servidor:** `server/index.mjs`, Node.js (`http.createServer`), ligado somente a `127.0.0.1:4000` na AWS.
- **Regras de negócio / BD:** `server/service.mjs`, usando `DatabaseSync` do Node 22, preparado com foreign keys e journal WAL.
- **Cliente:** `src/ui/entregavel5.js`, painel React sobre a campanha original.
- **Banco persistente AWS:** `/var/lib/conquest/conquest.sqlite` no EBS da instância.
- **Autenticação:** `Authorization: Bearer TOKEN` nas rotas privadas; sessões expiram após 8 horas ou logout.

## Modelo de dados

| Tabela | Principais colunas | Finalidade |
|---|---|---|
| `players` | `id`, `username` (único), `display_name`, `password_hash`, `role`, `created_at` | Jogadores e perfis `jogador` / `admin` |
| `access_tokens` | `token_hash`, `player_id`, `expires_at` | Sessões autenticadas vinculadas aos jogadores |
| `scores` | `id`, `player_id`, `score`, `correct`, `finished`, `created_at` | Histórico de pontos e acertos |

O backend usa placeholders de SQL por meio de `db.prepare(...).get/all/run` nos dados dinâmicos. As senhas são armazenadas como hash `scryptSync` com salt por conta; as sessões guardam hash SHA-256 do token (e não o token em texto).

## Rotas implementadas

| Método | Caminho | Precisa entrar? | Entrada | Saída/efeito |
|---|---|---|---|---|
| GET | `/api/health` | Não | — | `{status:"ok",service:"Conquest",database:"SQLite"}` |
| GET | `/api/ranking` | Não | — | 20 melhores jogadores por pontuação máxima de partidas concluídas |
| POST | `/api/register` | Não | `username, display_name, password` | Cria jogador, retorna perfil sem senha |
| POST | `/api/login` | Não | `username, password` | Emite token e retorna dados do perfil |
| GET | `/api/me` | Sim | Bearer token | Retorna perfil |
| PATCH | `/api/me` | Sim | `display_name` | Altera nome público |
| POST | `/api/scores` | Sim | `score, correct, finished` | Registra pontuação no SQLite |
| GET | `/api/scores` | Sim | Bearer token | Consulta últimas 30 pontuações do jogador |
| POST | `/api/logout` | Sim | Bearer token | Revoga o token |
| GET | `/api/admin/players` | Sim, admin | Bearer token | Lista jogadores, sem hashes de senha |

## Exemplo de cadastro com a API local

```bash
curl -X POST http://127.0.0.1:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"aluno_teste","display_name":"Jogador Teste","password":"SenhaFicticia123!"}'
```

Exemplo de resposta (IDs variam):

```json
{"id":1,"username":"aluno_teste","display_name":"Jogador Teste","role":"jogador"}
```

Após login, a API devolve `token` para ser passado no cabeçalho `Authorization`; **não inclua tokens reais nos prints nem no GitHub**.

## Permissões e códigos HTTP

- **200:** operação bem-sucedida.
- **400:** campos inválidos.
- **401:** autenticação ausente, senha incorreta ou sessão expirada/revogada.
- **403:** usuário autenticado sem permissão administrativa.
- **404:** rota inexistente.
- **409:** nome de usuário já cadastrado.
- **413:** corpo de requisição acima do limite de 32 KiB.

## Transações mínimas da equipe de duas pessoas

| Integrante | Transações demonstráveis | Evidência no código |
|---|---|---|
| 1 | Cadastro e autenticação; edição do nome público | `register`, `authenticate`, `PATCH /api/me` |
| 2 | Registrar pontuação; consultar histórico e fazer logout | `POST/GET /api/scores`, `POST /api/logout` |

A execução da campanha 3D, coleta e batalha usa as regras de `src/game/logic.js`, ao passo que a persistência do módulo acadêmico ocorre após a ação do usuário no painel React.

**Nota de segurança:** a pontuação recebida em `POST /api/scores` é validada quanto aos tipos e limites, mas **não é recalculada a partir de uma partida confiável do servidor**. O ranking desse módulo serve à demonstração acadêmica, não a competições com proteção antifraude.

Para instalação e hospedagem, consulte [CONFIGURACAO_E_EXECUCAO.md](CONFIGURACAO_E_EXECUCAO.md).
