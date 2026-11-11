# Trabalho final — conformidade e pendências

Baseado no enunciado UNIFOR **Cloud-Powered Mini-Games com Docker e BaaS**.

| Requisito do professor | Entregável presente | Situação |
|---|---|---|
| Mini-game frontend Vite | Código em src + package.json | **Build GitHub Actions aprovado** |
| Jogabilidade e pontuação | Liora, cristais, guardiões e Cael | Código publicado; execução real a validar |
| Pelo menos 4 funções BaaS | Auth, GraphQL, PostgreSQL e extensões planejadas | **Pendente: integrações reais** |
| Autenticação e banco persistente | src/services/nhost.js | Cliente preparado; configurar Hasura |
| Permissões ACL/RLS | docs/NHOST.md | **A configurar e testar** |
| Dockerfile | Dockerfile e nginx.conf | **Imagem Docker compilada e enviada ao GHCR** |
| OCI com Portainer | docker-compose.yml | **Pendente: VPS/conta** |
| CI/CD e 1 teste automatizado | .github/workflows/ci-cd.yml + tests | **10 testes e build concluídos com sucesso** |
| Deploy automático Oracle | Job deploy-oci opcional | **Pendente: webhook/GitOps** |
| Link do repositório | Conquest-nuvem | Concluído |
| Link do jogo na Oracle | URL futura | **Pendente** |
| Relatório final | A produzir após provas técnicas | **Pendente** |
| Demonstração ao vivo | Jogo, CI/CD, Portainer, Nhost | **Pendente** |
| Multiplayer dois jogadores | Ainda não desenvolvido | **Pendente** |

### Próximas prioridades

1. Conferir a experiência 3D no navegador (o primeiro workflow já aprovou 10 testes, build, Pages e GHCR).
2. Ativar GitHub Pages e testar o jogo com WebGL.
3. Conectar Nhost real, criar tabela e permissões e demonstrar autenticação/persistência.
4. Integrar Storage e Realtime para comprovar os recursos BaaS.
5. Testar Docker, preparar Oracle Cloud/Portainer e HTTPS.
6. Fazer deploy automático real e relatório com evidências.

**Importante:** Pages hospeda uma demonstração web. A obrigação de OCI com Portainer continua existindo.

**Evidência automática:** [GitHub Actions #43043313992](https://github.com/Ruan-levi/Conquest-nuvem/actions/runs/43043313992). Não substitui o teste em WebGL, BaaS e VPS.
