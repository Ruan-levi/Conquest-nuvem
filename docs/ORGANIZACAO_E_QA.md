# CONQUEST — organização e qualidade visual

## Como o projeto funciona

O **CONQUEST web** é uma única aplicação Vite + Babylon.js. O GitHub Pages
publica uma demonstração estática do frontend; a implantação Oracle/Portainer
publica o mesmo frontend em Docker. O Nhost é o backend de Auth, PostgreSQL,
GraphQL, Storage, Realtime e Functions — não é uma segunda versão do jogo.
O protótipo Unity em **unity-remake/** é independente e não substitui o trabalho
acadêmico em nuvem.

## Organização de pastas

| Caminho | Papel |
|---|---|
| src/main.js | Orquestração do jogo, controles e interface |
| src/game/logic.js | Progressão, combate, vida e pontos demonstrativos |
| src/game/questions.js | Perguntas locais da campanha |
| src/game/world-map.js | Missões, posição dos objetivos e limites |
| src/game/interactions.js | Pontos de interesse e regras de exploração opcionais |
| src/game/scene.js | Montagem da cena 3D, personagem, câmera e atualização |
| src/game/environment/textures.js | Texturas procedurais do solo, trilha, pedra, madeira, telhado e água |
| src/game/environment/scenery.js | Lanternas, flores, fonte, mural, monolito, fogueira e vagalumes |
| src/services/nhost.js | Integração cliente com serviços Nhost |
| functions/ | Backend serverless do desafio verificado (PR #15) |
| nhost/ | Configuração, metadados Hasura e migrações (PR #15) |
| tests/ | Testes automatizados de lógica e interações |
| infra/ | Nginx e publicação Oracle/Portainer |
| unity-remake/ | Protótipo Unity separado |
| .github/workflows/ | CI/CD GitHub |
| docs/ | Requisitos, publicação, QA e arquitetura |

**Regra de organização:** componentes adicionais ficam em módulos de
responsabilidade única. Não mova index.html, Dockerfile, vite.config.js,
nhost/ ou .github/ sem atualizar ferramentas, GitHub Actions e caminhos
relativos; esses locais são convenções dos respectivos sistemas.

## Melhorias visuais (incremento ao plano)

- Grama, trilha, pedra, madeira, telhas e rio recebem texturas procedurais,
  sem baixar assets externos e sem comprometer licenças.
- O vale ganha iluminação diurna mais clara, neblina, lanternas, flores,
  marcações de trilha e vagalumes.
- Interações opcionais com **E**: mural da vila (união), pedra da interseção,
  fogueira (complemento) e fonte de cura utilizável uma vez por jornada.
- Redução da resolução das texturas e quantidade de decoração em aparelhos
  móveis para preservar desempenho.
- Interações educativas não alteram pontos nem progressão obrigatória.

## Checklist QA antes de mesclar

1. Rodar npm install, npm test e npm run build.
2. No desktop: iniciar campanha, falar com Liora, coletar cristais,
   derrotar guardiões e Cael.
3. Verificar texturas sem flashes, textura preta, erros WebGL ou vazamento
   de memória após reiniciar o jogo.
4. Aproximar-se do mural, fonte, pedra e fogueira; pressionar **E** e
   confirmar mensagem. A fonte cura uma vez e jamais passa de 100 HP.
5. Perto de um objetivo obrigatório, **E** deve priorizar a missão.
6. Testar mobile/baixo desempenho, inclusive orientação e controles.
7. Confirmar que login, GraphQL e upload Storage continuam operantes
   após a integração da PR #15, por duas contas diferentes.
8. Conferir a publicação em GitHub Pages e no ambiente Oracle/Portainer.

## Diagnóstico de integração GitHub / Nhost

- A PR #15 contém mudanças de Nhost ainda separadas da main. Se o Nhost
  estiver vinculado exclusivamente à branch main, arquivos da PR não são
  incluídos nesse deploy até a integração. Conferir qual branch está conectada.
- Os metadados Hasura versionados precisam ser aplicados sem apagar tabelas
  de autenticação e Storage. Verificar no dashboard se o último deploy é verde.
- Os 7 testes do desafio serverless verificam regras locais, mas não provam
  operações reais Nhost. Testar token expirado, permissões entre usuários,
  idempotência de resposta e pontuação no banco.
- O ranking global precisa de subscription realtime; multiplayer de dois
  jogadores e publicação Oracle continuam no backlog original.
- Nunca incluir NHOST_ADMIN_SECRET, tokens ou senhas em código do navegador.

## Documentos relacionados

- docs/NHOST.md: autenticação, tabelas, ACL e Storage.
- docs/TRABALHO_FINAL.md: matriz da entrega acadêmica.
- docs/QUIZ_VALIDADO.md (PR #15): backend de pontuação verificada.
- docs/ROADMAP_DESENVOLVIMENTO.md (PR #15): planejamento das etapas.
