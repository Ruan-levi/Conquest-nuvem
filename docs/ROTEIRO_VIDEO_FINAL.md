# CONQUEST — roteiro de gravação do trabalho final

**Disciplina:** Desenvolvimento de Software em Nuvem — UNIFOR  
**Equipe:** Grupo 08  
**Orientação do professor Estevão Simão:** entregar **um vídeo por equipe**, mesmo que apenas um integrante narre, com os demais arquivos e artefatos na atividade do AVA.

> Este documento é um roteiro de gravação, **não é prova de que as integrações foram implantadas**. Grave e mostre apenas funcionalidades que realmente estiverem disponíveis. O prazo exato é o informado na atividade do AVA; confirme-o antes do envio.

## Antes de começar — conferência rápida

- [ ] O endereço publicado abre no navegador e o jogo 3D funciona; teste uma segunda aba anônima.
- [ ] O workflow do GitHub Actions está verde para o commit/branch **efetivamente publicado**.
- [ ] Se o Nhost estiver configurado, confira cadastro, login, acesso ao painel e uma partida verificada; não exiba e-mails, tokens, senhas, chaves ou dados pessoais de terceiros.
- [ ] Se houver VPS Oracle, teste a URL HTTPS, o contêiner Docker e a stack no Portainer; **não apresente a VPS como publicada se ainda não existir**.
- [ ] Abra antecipadamente as abas do GitHub, jogo, painel do Nhost e Portainer (se houver). Aumente o zoom do navegador para facilitar a leitura no vídeo.
- [ ] Utilize conta demonstrativa sem dados sensíveis. Desative notificações do computador.

## Sugestão de vídeo — 6 a 8 minutos

| Tempo aproximado | O que mostrar na tela | Narração sugerida |
|---|---|---|
| 00:00–00:45 | Tela inicial do CONQUEST | “Este é o CONQUEST, um RPG educativo tridimensional criado para praticar Teoria dos Conjuntos. O jogador explora um vale, responde questões e enfrenta guardiões para concluir sua jornada.” |
| 00:45–01:35 | Página inicial, modos, ranking e acesso à conta | “Na página inicial, o usuário escolhe iniciar a jornada ou acessar conta e classificação. O ranking competitivo usa apenas resultados do desafio verificados pelo servidor, quando a integração está ativa.” |
| 01:35–02:45 | Gameplay: personagem, controles, Liora, cristais e um guardião | “O personagem se movimenta em um ambiente 3D, recebe objetivos, interage com a personagem Liora e resolve questões matemáticas em batalhas. O jogo informa vida, pontuação e progresso.” |
| 02:45–03:45 | Login, cadastro e painel Nhost, **se implantados** | “A autenticação é integrada ao Nhost. Ele também fornece PostgreSQL e GraphQL; mostramos os dados de uma conta de demonstração e, se disponível, o desafio de seis perguntas validado por uma função no servidor.” |
| 03:45–04:35 | GitHub: organização dos diretórios, PR, testes e Actions | “O código-fonte fica versionado no GitHub. Usamos Vite e JavaScript no frontend, Babylon.js para o cenário 3D, testes automatizados e GitHub Actions para validar o projeto e gerar a implantação.” |
| 04:35–05:25 | Deploy: GitHub Pages; Docker, Portainer e Oracle Cloud **somente se publicados** | “A versão de demonstração é acessível pelo GitHub Pages. O projeto também oferece Dockerfile, Compose e pipeline de imagem. [Se estiver funcionando:] A versão da VPS Oracle Cloud é executada em contêiner, administrada pelo Portainer e servida via HTTPS.” |
| 05:25–06:20 | Requisitos e resultados, com quadro de status | “Entre os requisitos implementados estão navegação 3D, desafios de conjuntos, interface responsiva e fluxo de conta. As integrações em nuvem são mostradas de acordo com seu estado real. Também identificamos melhorias futuras, como duelo online de dois jogadores.” |
| 06:20–06:50 | Tela final do jogo, URL do repositório | “O CONQUEST demonstra como aplicar programação 3D, testes e serviços de nuvem em uma experiência educacional. Obrigado.” |

**Importante:** Se o professor exigir o conjunto completo de plataformas, não omita as pendências: explique o que existe, o que falta e o impedimento (como conta Oracle ainda não criada). Não substitua a demonstração real por telas simuladas.

## Material para anexar no AVA

1. **Um único arquivo de vídeo** ou o link solicitado pela atividade. Verifique se abre sem pedir permissão aos avaliadores.
2. Link do [repositório oficial](https://github.com/Ruan-levi/Conquest-nuvem), indicando branch/commit exibido no vídeo.
3. Link da [versão de demonstração](https://ruan-levi.github.io/Conquest-nuvem/) **somente após conferir que o deploy está atualizado**; incluir URL da VPS OCI se efetivamente implantada.
4. Arquivos e documentos exigidos na atividade, incluindo [checklist acadêmico](TRABALHO_FINAL.md), [instruções de publicação](PUBLICACAO.md), testes e evidências dos serviços.

## Última verificação

- [ ] O vídeo possui áudio claro, imagem legível e mostra o jogo **funcionando**.
- [ ] Apresenta proposta/objetivo, tecnologias e funcionalidades principais.
- [ ] Mostra os requisitos obrigatórios e as plataformas realmente utilizadas.
- [ ] As URLs e os arquivos anexados abrem no AVA em uma sessão sem permissões especiais.
- [ ] A equipe enviou **um único vídeo** dentro do prazo da atividade.
