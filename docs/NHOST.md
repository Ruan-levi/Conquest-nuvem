# Integração Nhost — instruções do Conquest

**Estado atual:** código de autenticação e operações GraphQL preparado, ainda sem configuração em um projeto Nhost real.

## 1. Criar projeto e configurar o frontend

Acesse https://app.nhost.io e crie o projeto. Anote somente os identificadores públicos **subdomain** e **region**.

Copie o arquivo .env.example para .env e informe os valores mostrados no painel:

~~~dotenv
VITE_NHOST_SUBDOMAIN=seu-subdominio
VITE_NHOST_REGION=sua-regiao
~~~

Reinicie o servidor Vite e clique em **Conta / Ranking** no jogo.

**Proibido:** incluir admin secret, tokens privados ou senhas em variáveis VITE_*.

## 2. Esquema de dados proposto

No SQL Editor do Nhost, execute após confirmar os nomes e permissões do ambiente:

~~~sql
CREATE TABLE IF NOT EXISTS public.conquest_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100000),
  correct_answers integer NOT NULL CHECK (correct_answers BETWEEN 0 AND 100),
  total_answers integer NOT NULL CHECK (total_answers BETWEEN correct_answers AND 300),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conquest_scores_top
  ON public.conquest_scores (score DESC, created_at ASC);
~~~

Faça Track da tabela na interface Hasura.

## 3. Política de segurança Hasura

Para o papel **user** autenticado:

1. **INSERT:** permitir somente campos score, correct_answers, total_answers e completed; definir user_id automaticamente com o preset de variável de sessão **X-Hasura-User-Id**.
2. **SELECT do jogador:** filtro por user_id = X-Hasura-User-Id.
3. **UPDATE/DELETE:** negar aos jogadores.
4. **ANONYMOUS:** negar inserção de pontuação.
5. Para o ranking público, publicar uma **view segura** com score, acertos e data, sem e-mail nem outros dados pessoais.

Sem uma view de ranking pública, a consulta de ranking em src/services/nhost.js poderá ver somente linhas autorizadas para o usuário atual.

## 4. Login e e-mail

O Nhost costuma exigir verificação de e-mail para novas contas. O usuário pode precisar confirmar o e-mail e depois entrar. O fluxo completo de redirecionamento/PKCE deve ser testado após configurar Auth e domínio.

Configure os domínios permitidos de acordo com as URLs reais:
- https://ruan-levi.github.io
- https://ruan-levi.github.io/Conquest-nuvem/
- Endereço HTTPS da VPS Oracle, quando houver.

## 5. GitHub Actions

Em GitHub → Settings → Secrets and variables → Actions → Variables, criar:

- NHOST_SUBDOMAIN
- NHOST_REGION

O workflow os usa para compilar as versões Pages e Docker. São identificadores públicos; **nunca** publique credenciais de administrador.

## 6. Critério dos quatro recursos BaaS

| Recurso | Situação |
|---|---|
| Auth: conta/login/sessão | Preparado, testar com conta |
| PostgreSQL: jogadores/partidas/pontuação | Esquema proposto, aplicar |
| GraphQL: query e mutation | Código preparado, configurar Hasura |
| Storage: avatar | **A implementar** |
| Realtime: ranking/partida sincronizada | **A implementar** |

**A exigência acadêmica é apresentar pelo menos 4 funcionalidades BaaS funcionando, não apenas declarar essas tecnologias.**

## 7. Segurança das pontuações

Nesta versão, a pontuação do jogo é calculada no navegador. Um usuário pode forjar uma requisição GraphQL ou editar o JavaScript. Os limites SQL e permissões Hasura ajudam a restringir operações, **mas não comprovam que uma partida realmente ocorreu**.

Antes de um ranking competitivo verdadeiro, implemente validação de partida e respostas em Nhost Functions ou outro backend seguro.

Documentação: https://docs.nhost.io/reference/javascript/nhost-js/main
