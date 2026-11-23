# CONQUEST — Criação, instalação, configuração e execução

> Guia baseado nos arquivos existentes do jogo web. Use Node.js **22.12 ou superior** conforme `package.json`; na AWS atual a versão instalada é Node.js 22. O projeto possui dois modos diferentes: **frontend de desenvolvimento Vite** e **aplicação completa Node.js REST + SQLite**.

## 1. Pré-requisitos

- Git instalado; Node.js 22.12+ e npm; editor como VS Code.
- Internet para instalação de pacotes, recursos Nhost opcionais e React CDN.
- Navegador atual com suporte a WebGL para a campanha 3D.
- Para produção, uma máquina ou servidor com armazenamento persistente para SQLite.

## 2. Baixar e executar o frontend de desenvolvimento

```bash
git clone https://github.com/Ruan-levi/Conquest-nuvem.git
cd Conquest-nuvem
npm ci
npm run dev
```

Acesse o endereço informado pelo Vite, geralmente `http://localhost:5173`.

**Importante:** o Vite sozinho não executa a API REST de `server/index.mjs`; por isso o painel **Progresso AWS** não terá persistência nesse modo sem backend e proxy configurados. A campanha 3D pode funcionar como visitante.

## 3. Gerar a aplicação de produção e executar frontend + backend

```bash
npm ci
npm test
npm run build
```

No terminal Linux/macOS, crie um diretório persistente de desenvolvimento e inicie o Node.js:

```bash
mkdir -p data
CONQUEST_DB="$PWD/data/conquest.sqlite" \
CONQUEST_DIST="$PWD/dist" \
PORT=4000 \
node server/index.mjs
```

No PowerShell (Windows):

```powershell
New-Item -ItemType Directory -Force data
$env:CONQUEST_DB = (Join-Path (Get-Location) "data/conquest.sqlite")
$env:CONQUEST_DIST = (Join-Path (Get-Location) "dist")
$env:PORT = "4000"
node server/index.mjs
```

Abra **http://127.0.0.1:4000/** para utilizar tanto o jogo quanto a API na mesma origem. Para conferir o serviço, acesse `http://127.0.0.1:4000/api/health`.

As variáveis de ambiente do backend são:

| Variável | Finalidade | Valor da AWS atual |
|---|---|---|
| `CONQUEST_DB` | Caminho do banco SQLite persistente | `/var/lib/conquest/conquest.sqlite` |
| `CONQUEST_DIST` | Pasta do build Vite | `/opt/conquest/dist` |
| `PORT` | Porta HTTP do Node.js (loopback) | `4000` |
| `CONQUEST_ADMIN_USER` | Usuário inicial de administrador (opcional) | Não configurado na unidade systemd atual |
| `CONQUEST_ADMIN_PASSWORD` | Senha inicial para criar administrador (opcional; **não versionar**) | Não configurada na unidade systemd atual |

As senhas devem ser longas, únicas e guardadas em configuração protegida fora do Git. **Não registre senhas, tokens ou chaves neste repositório.** O serviço `seedAdmin()` só cria um usuário admin se `CONQUEST_ADMIN_PASSWORD` estiver definido quando iniciar e se esse usuário não existir.

## 4. Como a infraestrutura AWS foi configurada

**Estado da infraestrutura verificado em 23/11/2026:**

| Componente | Configuração |
|---|---|
| Provedor | Amazon Web Services — EC2 |
| Região / zona | `us-east-2` / `us-east-2a` |
| Instância | `i-0201778b1ea2903b2` |
| Tipo de máquina | `t3.micro` |
| Sistema | Amazon Linux 2023 |
| Acesso público | `http://3.149.254.9/` |
| Nginx | Proxy HTTP, porta pública 80 |
| Node.js | Serviço `conquest` gerenciado pelo `systemd`, porta interna `127.0.0.1:4000` |
| Diretório da aplicação | `/opt/conquest` |
| Banco | `/var/lib/conquest/conquest.sqlite` (SQLite no disco EBS da instância) |
| Regra pública de firewall EC2 | TCP 80 `0.0.0.0/0`; porta 4000 não exposta |
| Administração da instância | AWS Systems Manager / Session Manager |
| HTTPS | **Ainda não configurado** |
| Endereço IP fixo | **Não configurado**; pode mudar ao parar e iniciar EC2 |

As instâncias, EBS, endereço IPv4 e tráfego podem consumir créditos AWS ou gerar custos. Não há garantia de custo zero.

### Servidor HTTP (Nginx)

O arquivo de produção da instância encaminha solicitações HTTP ao Node.js na porta 4000. Exemplo equivalente:

```nginx
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 100k;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Este exemplo é para o **Nginx instalado na EC2**, não para `infra/nginx.conf`, utilizado pelo Docker estático do projeto original.

## 5. Consultar e administrar o servidor AWS

Na console AWS, escolha a região **Ohio (us-east-2)** e abra **EC2 → Instâncias → `i-0201778b1ea2903b2`**. Para conexão administrativa autorizada use **Conectar → Session Manager**.

No terminal da instância:

```bash
sudo systemctl status conquest
sudo systemctl status nginx
sudo journalctl -u conquest -n 80 --no-pager
curl http://127.0.0.1/api/health
```

**Atualização manual após alterar o GitHub:**

```bash
cd /opt/conquest
sudo git pull --ff-only
sudo npm ci --no-audit --no-fund
sudo npm test
sudo npm run build
sudo systemctl restart conquest
curl http://127.0.0.1/api/health
```

O workflow `.github/workflows/ci-cd.yml` faz testes, build, Pages e GHCR. O workflow `.github/workflows/aws-entregavel5.yml` **verifica a URL já publicada**, mas **não faz deploy automático na EC2**. O comando manual acima é necessário quando houver alteração funcional no servidor.

## 6. Configurações do Nhost (funcionalidade original opcional)

Para usar as funções externas originais (duelos, autenticação Nhost, GraphQL, Storage e Realtime), configure as variáveis públicas:

```dotenv
VITE_NHOST_SUBDOMAIN=
VITE_NHOST_REGION=
```

O Vite incorpora `VITE_*` **durante o build**; alterar ambiente após a compilação não altera o frontend já gerado. No GitHub Pages, use **Settings → Secrets and variables → Actions → Variables** para `NHOST_SUBDOMAIN` e `NHOST_REGION`.

**Nunca exponha** `NHOST_ADMIN_SECRET`, tokens particulares ou senhas em arquivos `VITE_*`. Consulte `docs/NHOST.md` e `docs/NHOST_DUELOS.md`. O funcionamento completo de uma partida real entre duas contas e do WebSocket em produção requer validação separada.

## 7. Execução dos testes

```bash
npm test
npm run build
```

A suíte inclui testes Vitest do jogo, testes Node da Function do duelo e `tests/entregavel5.node.mjs` para cadastro, autenticação, pontuação e permissões. O arquivo `scripts/live-check.mjs` testa a API em execução e **cria registros fictícios** no banco; utilize somente em ambiente de demonstração.

Para verificar a API em produção sem criar registros:

```bash
curl http://3.149.254.9/api/health
curl http://3.149.254.9/api/ranking
```

### Cuidados

A URL AWS ainda usa **HTTP**. Use apenas contas fictícias para a apresentação; não utilize credenciais pessoais, dados sensíveis nem dados reais. Para uso real é necessário configurar HTTPS, backups, monitoramento, proteção contra abuso e endereço estável.
