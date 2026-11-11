# Publicação — Conquest no GitHub Pages e na Oracle Cloud

## A. GitHub Pages (versão de demonstração)

1. Acesse https://github.com/Ruan-levi/Conquest-nuvem/settings/pages — o workflow Vite já concluiu um deploy com sucesso, mas existe também um workflow automático Jekyll de publicação da branch.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**. Isso evita que a publicação Jekyll da branch substitua o site Vite por arquivos-fonte.
3. Acesse https://github.com/Ruan-levi/Conquest-nuvem/actions e confira o workflow **Conquest - build, testes e publicacao**.
4. Se necessário, abra o workflow e clique em **Run workflow**.
5. Confira a aprovação dos jobs **verify** e **pages**.
6. Só depois de confirmar o deploy, abra https://ruan-levi.github.io/Conquest-nuvem/

O Vite utiliza base /Conquest-nuvem/ no build de Pages. No contêiner Docker a base é /.

**Sem configurar Pages em Settings, a URL pode permanecer indisponível.** O workflow não elimina essa etapa.

## B. VPS Oracle + Docker + Portainer

**Esta é a entrega exigida pelo professor, além do Pages.**

1. Provisionar VPS Linux na Oracle Cloud (OCI).
2. Configurar IP público, firewall, SSH seguro e regras de rede mínimas.
3. Instalar Docker e Portainer com a documentação oficial, sem deixar o painel administrativo exposto.
4. Validar o job **container** do GitHub Actions: deverá construir imagem e publicá-la em **ghcr.io/ruan-levi/conquest-nuvem:latest**.
5. Tornar o pacote GHCR público ou autenticar o Portainer para permitir download.
6. Importar a stack a partir do arquivo docker-compose.yml.
7. Usar um proxy reverso com HTTPS na frente do contêiner; evite expor a porta 8080 diretamente à internet.
8. Abrir o endereço público, executar o jogo, observar os logs e testar os serviços Nhost.
9. Preparar a atualização automatizada: habilitar GitOps ou webhook da Stack/contêiner, conforme a edição e configuração do Portainer.

## C. Automatizar a atualização OCI

Somente depois de instalar a VPS e configurar o Portainer:

- Em **Secrets**, criar **PORTAINER_WEBHOOK_URL** com URL privada do webhook.
- Em **Variables**, criar **ENABLE_OCI_DEPLOY** com valor **true**.
- Validar que o job container publicou a nova imagem **antes** de tentar o webhook.

O job deploy-oci ficará desabilitado até a variável ser configurada. O webhook só funciona se a sua edição e configuração do Portainer oferecerem esse recurso. Caso contrário, substitua a etapa por mecanismo GitOps compatível.

## D. Demonstração acadêmica

Na apresentação ao professor:
- Mostrar uma partida completa do Conquest com perguntas e progresso.
- Mostrar dados reais do Nhost e as permissões configuradas.
- Fazer alteração pequena no GitHub.
- Apresentar **npm test** e **npm run build** no GitHub Actions.
- Mostrar Portainer atualizar o contêiner e abrir a URL da **VPS OCI**.
- Registrar evidências da execução e elaborar relatório técnico final.

Links úteis: https://vite.dev/guide/static-deploy ; https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
