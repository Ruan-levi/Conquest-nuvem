# Trabalho final — conformidade e pendências

Baseado no enunciado UNIFOR **Cloud-Powered Mini-Games com Docker e BaaS**.

| Requisito do professor | Entregável presente | Situação |
|---|---|---|
| Mini-game frontend Vite | Código em src + package.json | **Build GitHub Actions aprovado** |
| Jogabilidade e pontuação | Liora, cristais, guardiões e Cael | Código publicado; integrante relatou gameplay demonstrada no vídeo; QA adicional recomendado |
| Pelo menos 4 funções BaaS | Auth, PostgreSQL/GraphQL, Storage e Realtime preparados no frontend | **Código preparado; integrar e demonstrar em Nhost real** |
| Autenticação e banco persistente | src/services/nhost.js | Login e histórico no frontend; configurar tabela/permissões no Hasura |
| Permissões ACL/RLS | docs/NHOST.md | **A configurar e testar** |
| Dockerfile | Dockerfile e nginx.conf | **Imagem Docker compilada e enviada ao GHCR** |
| OCI com Portainer | docker-compose.yml | **Pendente: VPS/conta** |
| CI/CD e 1 teste automatizado | .github/workflows/ci-cd.yml + tests | **16 testes Vitest, build, GHCR e Pages aprovados no workflow #30** |
| Deploy automático Oracle | Job deploy-oci opcional | **Pendente: webhook/GitOps** |
| Link do repositório | Conquest-nuvem | Concluído |
| Link do jogo na Oracle | URL futura | **Pendente** |
| Relatório final | A produzir após provas técnicas | **Pendente** |
| Vídeo de demonstração final (obrigatório) | Um vídeo por equipe, mostrando proposta, jogo, tecnologias e plataformas | **Gravado, segundo a equipe**; confirmar envio do vídeo e dos artefatos no AVA. Não afirmar demonstração de serviços pendentes |
| Portal inicial e melhorias incrementais | Login/cadastro antecipado, histórico individual, retorno ao portal e cenário interativo | **Publicado no Pages**; conferir [plano revisado](PLANO_DE_TRABALHO_REVISADO.md) |
| Multiplayer dois jogadores | Ainda não desenvolvido | **Pendente** |

### Próximas prioridades

1. Confirmar que o vídeo já gravado e todos os arquivos exigidos foram anexados ao AVA e estão acessíveis.
2. Conferir a experiência 3D e o login no navegador; o workflow #30 aprovou 16 testes, build, Pages e GHCR.
3. Conectar Nhost real, criar tabela e permissões e demonstrar autenticação/persistência.
4. Conectar Storage e Realtime já adicionados no frontend, aplicar permissões e comprovar os recursos BaaS.
5. Testar Docker, preparar Oracle Cloud/Portainer e HTTPS.
6. Fazer deploy automático real e relatório com evidências, caso essas etapas continuem exigidas.

**Importante:** Pages hospeda uma demonstração web. A obrigação de OCI com Portainer continua existindo.

**Evidência automática atualizada:** [GitHub Actions #30](https://github.com/Ruan-levi/Conquest-nuvem/actions/runs/44555324162). Não substitui o teste em WebGL, BaaS e VPS.
