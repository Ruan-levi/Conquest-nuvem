# Conquest — Oracle Cloud (OCI) e Portainer

**Status:** roteiro preparado. Nenhuma instancia OCI ou stack foi implantada nesta etapa.

## Criar VPS e proteger acesso

1. No painel Oracle, crie VM Ubuntu suportada na sua regiao e atribua IP publico.
2. Configurar VCN, subnet, gateway e NSG. Entrada: 80 e 443 publicos;
   porta 22 somente do seu IP de administracao com chave SSH.
3. Nao abrir 8080, 9000, 9443, 2375 ou endpoint Docker para internet.
4. No Ubuntu, aplicar atualizacoes, firewall e instalacao oficial de Docker
   Engine com Compose Plugin; confirmar comando docker compose version.
5. Criar DNS A de seu dominio/subdominio apontando para o IP publico.
6. Fazer backup de configuracoes e guardar chaves de acesso fora do repo.

## Portainer CE local protegido

Exemplo em Ubuntu Docker instalado, com painel limitado a loopback:

    docker volume create portainer_data
    docker run -d --name portainer --restart unless-stopped \
      -p 127.0.0.1:9443:9443 \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v portainer_data:/data \
      portainer/portainer-ce:lts

Do PC, abra um tunel SSH e acesse https://127.0.0.1:9443,
conferindo a identidade do host e o certificado do Portainer:

    ssh -L 9443:127.0.0.1:9443 ubuntu@IP_PUBLICO_DA_VM

O socket Docker concede privilegios altos; restrinja administradores.

## Implantar stack no Portainer

- Stacks -> Add stack -> Git repository
- Repository URL: https://github.com/Ruan-levi/Conquest-nuvem
- Reference: refs/heads/main
- Compose path: docker-compose.yml
- Imagem GHCR: ghcr.io/ruan-levi/conquest-nuvem:latest (publica OU configure acesso privado)
- O compose publica a porta 8080 SOMENTE em 127.0.0.1 do host.
- Instale Caddy no host, usando Caddyfile.example com o DNS real;
  HTTPS automatico exige DNS valido e acesso publico 80/443.
- Testar curl -I http://127.0.0.1:8080/ no host e abrir URL HTTPS.

Vite incorpora VITE_NHOST_SUBDOMAIN e VITE_NHOST_REGION no build.
Configure Actions Variables NHOST_SUBDOMAIN e NHOST_REGION
no GitHub antes de recompilar imagem; runtime .env do Compose nao resolve.

## Publicacao automatica

CI do GitHub publica imagem GHCR apos testes. Existem 2 formas distintas:

1. Portainer Business Edition: webhook de stack, com Re-pull image
   e URL protegida. Configurar Actions Secret PORTAINER_WEBHOOK_URL e
   Actions Variable ENABLE_OCI_DEPLOY=true. Evitar expor todo painel.
2. Portainer CE: stack criada via Git repository, GitOps Updates/polling
   com Re-pull image e Force redeployment quando disponiveis.
   O pacote GHCR deve estar pronto antes da proxima sincronizacao.

O webhook direto de stack requer Portainer Business Edition.
Se a stack foi criada via Web editor, polling de Git repository nao se aplica.
Aprovacao do job de imagem NAO comprova que a VPS foi atualizada.

## Evidencia academica

Testar partida via HTTPS na VPS, acompanhar logs do jogo/Portainer,
confirmar imagem em execucao, demonstrar Auth, consultas/insercoes Nhost,
Storage privado, subscription Realtime e GitHub Actions.
Nao divulgar tokens, URLs secretas de webhook ou chaves SSH.

Fontes: https://docs.portainer.io/user/docker/stacks/add
e https://docs.portainer.io/user/docker/stacks/webhooks
