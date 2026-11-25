# ⚔️ CONQUEST — A Jornada dos Conjuntos

**Jogo educativo 3D de Teoria dos Conjuntos · UNIFOR · Desenvolvimento de Software em Nuvem**

[**🎮 Jogar CONQUEST no GitHub Pages**](https://ruan-levi.github.io/Conquest-nuvem/) · [**Pipeline GitHub Actions**](https://github.com/Ruan-levi/Conquest-nuvem/actions) · [**Painel Nhost**](https://app.nhost.io/)

> **Backend oficial deste repositório: Nhost.** O jogo utiliza Vite, Babylon.js e serviços Nhost (Auth, PostgreSQL/GraphQL, Functions, Storage e Realtime). A versão acadêmica AWS/SQLite da outra disciplina permanece preservada na branch [archive/entregavel5-aws-20261123](https://github.com/Ruan-levi/Conquest-nuvem/tree/archive/entregavel5-aws-20261123), mas **não faz parte da aplicação publicada pelo GitHub Pages**.

## O que o jogo faz

O jogador explora o Vale dos Conjuntos, conhece Liora, reúne três cristais, enfrenta guardiões matemáticos e desafia Cael. A jornada 3D pode ser jogada como visitante; funcionalidades de conta, histórico e duelo exigem um projeto Nhost configurado.

| Recurso | Como funciona | Onde está no código |
|---|---|---|
| Aventura 3D e quiz | Movimentação, interações, batalhas e pontos | `src/main.js`, `src/game/` |
| Cadastro, login e logout | Nhost Auth; requer e-mail verificado conforme configuração | `src/services/nhost.js` |
| Histórico privado | Grava e consulta `public.conquest_scores` via GraphQL | `nhost/migrations/001_conquest_scores.sql` |
| Duelo entre dois jogadores | Salas por convite; respostas corrigidas pelo backend | `src/ui/duel.js`, `functions/duel.js` |
| Ranking público | View de duelos concluídos; nenhum e-mail exposto | `nhost/migrations/002_conquest_duels.sql` |
| Realtime | GraphQL subscriptions, com consulta periódica como alternativa | `src/services/nhost.js` |
| Storage privado | Upload de imagem de até 2 MB no bucket `personal` | `src/services/nhost.js` |
| CI/CD | Testes, build Vite, Pages, GHCR e validação pública do Nhost | `.github/workflows/ci-cd.yml` |

**Importante:** a pontuação da jornada 3D é calculada no navegador, então não entra no ranking competitivo. Só entram no ranking partidas online concluídas por dois usuários e corrigidas em `functions/duel.js`. A existência de código e de scripts SQL não substitui testes reais de cadastro, permissões, Storage e duelo.

## Como configurar GitHub Pages + Nhost

1. Abra seu projeto em [Nhost Dashboard](https://app.nhost.io/) e copie **somente** os valores públicos `subdomain` e `region`.
2. No repositório GitHub abra **Settings → Secrets and variables → Actions → Variables** e configure exatamente:
   - `NHOST_SUBDOMAIN`: subdomínio do projeto.
   - `NHOST_REGION`: região do projeto, por exemplo `sa-east-1` (use a região real do seu projeto).
3. Em **Settings → Pages**, selecione **Build and deployment → Source: GitHub Actions**, não `Deploy from a branch`. Isso evita que o workflow automático do GitHub Pages concorra com o build Vite configurado para Nhost.
4. Execute **Actions → Conquest - build, testes e publicacao → Run workflow**. O workflow compila o frontend já com os dois valores públicos do Nhost, verifica o bundle e publica no Pages. A verificação do endpoint de ranking ocorre depois.
5. No Nhost configure em **Auth** os redirecionamentos permitidos para `https://ruan-levi.github.io/Conquest-nuvem/`. Confira contas em **Auth → Users**.
6. No Nhost, execute as migrações SQL na ordem `001` e `002`, faça o *Track* das tabelas/view no Hasura e configure as permissões conforme [NHOST.md](docs/NHOST.md) e [NHOST_DUELOS.md](docs/NHOST_DUELOS.md).
7. Em **Functions**, confira o deploy de `/duel`. Teste login com duas contas verificadas, crie uma sala, finalize seis questões por conta e confira o ranking público em janela anônima.

**Nunca publique** `NHOST_ADMIN_SECRET`, tokens, senhas ou chaves privadas nas variáveis `VITE_*` ou no código do frontend. `NHOST_SUBDOMAIN` e `NHOST_REGION` não são segredos.

Se a página indicar **“Nhost não configurado”**, confira as duas variáveis, a execução do workflow de Pages e se a fonte de publicação está definida como **GitHub Actions**. Variáveis alteradas exigem novo build: o Vite incorpora os valores no JavaScript distribuído.

Se o ranking responder mas login ou Storage falharem, confira a configuração de Auth, tabelas, permissões Hasura, bucket `personal`, Function `duel` e os domínios autorizados no Nhost. A validação do ranking não significa que todos os recursos BaaS já foram testados.

## Executar localmente

Instale **Node.js 22.12+** e npm.

```bash
git clone https://github.com/Ruan-levi/Conquest-nuvem.git
cd Conquest-nuvem
npm ci
cp .env.example .env
# Preencha VITE_NHOST_SUBDOMAIN e VITE_NHOST_REGION com os valores publicos
npm run dev
```

Abra o endereço exibido pelo Vite. Para testar e compilar:

```bash
npm test
npm run build
```

No GitHub Actions, as variáveis se chamam **`NHOST_SUBDOMAIN`** e **`NHOST_REGION`**; o workflow as passa como `VITE_NHOST_SUBDOMAIN` e `VITE_NHOST_REGION` para o build. Não configure URLs de AWS ou SQLite nesse repositório.

## Estrutura técnica

```text
src/
  main.js                 Interface, HUD e jornada
  game/                   Mundo 3D, perguntas e batalhas
  services/nhost.js       Auth, GraphQL, Realtime, Storage e Functions
  ui/duel.js              Duelo online
functions/duel.js         Correção segura e ranking público no Nhost
nhost/migrations/         PostgreSQL: pontuações, duelos e view
scripts/smoke-cloud.mjs   Verificação do ranking público Nhost
scripts/check-nhost-build.mjs  Confere variáveis dentro do build publicado
.github/workflows/ci-cd.yml   Testes, Pages, Docker e verificação Nhost
Dockerfile                Imagem do frontend Vite
infra/oci/                Planejamento de Oracle Cloud e Portainer
unity-remake/             Protótipo Unity independente
```

## Infraestrutura planejada e limites

- O **GitHub Pages** publica a demonstração web com conexão ao Nhost. Não é um servidor Oracle.
- O **Dockerfile/GHCR** cria a imagem do frontend para futura implantação na VPS Oracle Cloud.
- A etapa **Oracle Cloud + Portainer** continua pendente até haver uma VPS/Stack real e atualização automatizada comprovada.
- Para apresentar o trabalho, demonstre as tabelas no Nhost, duas contas de teste, o duelo, as permissões GraphQL/Hasura, o Storage, o Realtime e a execução do GitHub Actions. Não confunda testes automatizados com teste completo de dois navegadores reais.

## Documentação

- [Configurar Auth, banco, Storage e Realtime Nhost](docs/NHOST.md)
- [Duelos Nhost, ranking e permissões](docs/NHOST_DUELOS.md)
- [Validação prática de autenticação, ranking e deploy](docs/VALIDACAO_FINAL.md)
- [Infraestrutura OCI + Portainer](infra/oci/README.md)
- [Plano revisado, escopo e incrementos](docs/PLANO_DE_TRABALHO_REVISADO.md)
- [Roteiro da apresentação](docs/ROTEIRO_VIDEO_FINAL.md)

**O histórico anterior da Entregável 5 AWS foi preservado em uma branch de arquivo; o frontend público deste repositório permanece exclusivo do CONQUEST + Nhost.**
