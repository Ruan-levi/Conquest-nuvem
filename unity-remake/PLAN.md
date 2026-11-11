# CONQUEST — Plano do remake Unity (Windows)

**Status:** planejamento e auditoria técnica. **Nenhum projeto Unity foi criado, aberto ou compilado nesta etapa.**

## 0. Fonte de verdade e bloqueios

O prompt de 11/11/2026 solicita reproduzir o vídeo `reference/Gravacao_de_Tela_2026-11-10_105724.mp4`. Esse vídeo **não está disponível neste repositório nem entre os arquivos localizados nesta conversa**. Portanto a análise abaixo é baseada **somente no texto fornecido pelo usuário** e na descrição anterior do jogo; todas as hipóteses visuais são provisórias.

**Primeira ação quando o vídeo estiver disponível:** extrair keyframes temporizados em intervalos de 2 segundos com ffmpeg (sem necessariamente publicar todas as imagens), elaborar tabela `timestamp → HUD/mapa/NPC/missão/diálogo/interface`, reconciliar nomenclatura de personagens (o prompt usa **Llora**; o projeto web anterior usa **Liora**). Não anunciar “reprodução fiel” antes desta comparação.

**Restrição real de ferramentas:** o GitHub pode ser lido/editado, mas o Unity Editor não está acessível pelas ferramentas disponíveis nesta conversa; não se pode declarar Unity instalado, scene montada, jogo rodado ou build Windows gerado sem evidência.

## 1. Dois produtos, uma identidade

- **Produto A: CONQUEST Unity (Windows)** — RPG 3D em terceira pessoa, executável standalone 64-bit para computadores escolares, com interface e física nativas do Unity.
- **Produto B: CONQUEST Web/Nuvem (existente)** — preservar integralmente a aplicação Vite/Babylon.js em `src/`, o GitHub Pages, Nhost, o Docker e o CI/CD. A disciplina exige frontend Vite, 4 funções BaaS, Oracle VPS, Portainer e deploy automático; o executável Windows **não substitui** esses critérios.

**Regra arquitetural:** compartilhar dados originais de matemática/roteiros em JSON (versão, id, objetivos, gabarito, explicações) quando útil; não tentar executar Unity dentro do frontend web nem empacotar o .exe como site Vite.

## 2. Stack pretendida

- **Unity:** 6.3 LTS + URP, versão exata do patch fixada no projeto assim que instalado.
- **Entrada:** Input System novo, Action Maps Player/UI; WASD relativo à câmera, Shift correr, Space dash, E interagir, Esc pausar.
- **Personagem:** CharacterController e motor com aceleração/frenagem, gravidade, rotação suavizada, Animator Humanoid/Blend Tree 2D (idle, walk, run, dash, hit, attack, death).
- **Câmera:** Cinemachine Third Person Follow + mecanismo de colisão/de-oclusão adequado à versão instalada; suavização, zoom limitado, obstáculo e sensibilidade ajustável.
- **NPCs/inimigos:** navegação por NavMesh, estado de diálogos, perseguição, telegráfico de ataques e eventos animados.
- **Conteúdo:** ScriptableObjects (Missão, Diálogo, Inimigo, Pergunta, Capítulo, VFX) ou JSON com validador de esquema; *texto e gabaritos ficam nos dados*, jamais repetidos em scripts de UI.
- **Persistência:** PlayerPrefs apenas para preferências; dados de progresso em arquivo de save versionado e validado. Nhost pertence à trilha Web até definir integração Windows real.
- **Teste:** EditMode para regras puras de conjuntos, PlayMode para interação/câmera, validação de cenas, build Win64 em batchmode e análise de logs.

## 3. Mecânica educacional testável

- Domínios: pertinência, subconjuntos, união, interseção, diferença, complementar, Venn.
- Exemplo **Escudo de interseção:** o inimigo mostra `A = {1,2,3}`; o jogador escolhe `B` entre opções. O dano exige acertar `A ∩ B` do desafio; o sistema nunca exige mera “tentativa de clicar em B” sem regra matemática explícita.
- **União:** combinar dois conjuntos para recuperar a energia de um aliado, com cálculo validado.
- **Diferença:** selecionar `A − B` corretamente para remover proteção do inimigo.
- **Complementar:** usar `U \ A`; o universo `U` será sempre mostrado para evitar ambiguidade.
- **Erros:** feedback curto, com a operação e explicação da resposta correta; penalidade de vida calibrada e nova tentativa sem estigmatizar erro.
- **Balanceamento:** dificuldade cresce por capítulo; sem probabilidades que impeçam concluir a história em uma sessão de ~10 minutos; testes garantem que respostas, objetivos e danos resultam em progressão viável.

## 4. Roadmap com critérios de aceite

### Marco 0 — Auditoria de vídeo e versões
- Vídeo adquirido, quadros amostrados a cada 2s, inventário de HUD/textos/câmera/mapa/personagens/missões e divergências.
- Conferir Unity 6.3 LTS instalado; abrir projeto original apenas se os arquivos editáveis existirem; preservar a versão web atual.
- Critério: inventário com screenshots e decisões, licença/uso dos recursos do Unity original verificados.

### Marco 1 — Projeto Unity mínimo confiável
- Novo projeto URP; estrutura `Assets/_Project/{Art,Audio,Data,Prefabs,Scenes,Scripts,Settings,UI}`.
- Unity Input System, Cinemachine, Unity Test Framework; .asmdef por módulos `Core`, `Gameplay`, `UI`, `Editor`, `Tests`.
- Git LFS conforme tamanho e termos de redistribuição de assets, .gitignore Unity.
- Critério: Unity abre sem erros/avisos de compilação do projeto, cena de teste executa e build Win64 mínimo existe.

### Marco 2 — Vertical slice da vila
- Vila, praça, fonte, portão, caminhos, cercas, casas, pinheiros/montanhas, NPCs e cristais visíveis.
- CharacterController, câmera colisionável, marcha/corrida/dash e animações.
- Critério: fluxo W/S/D/A correto, direção guiada, colisões com paredes e portão, botão E interage e há percurso claro sem travamentos.

### Marco 3 — Missões/diálogos/quiz
- Capítulos e side quest Juno; tutorial, 3 cristais, interação com Llora/Liora (grafia após vídeo).
- Sistema de diálogo com texto gradual e opção de avançar instantaneamente; áudio acessível, com controle de volume.
- Perguntas de dados externos e explicação de erro.
- Critério: concluir tutorial e side quest sem intervenções no editor; missões e HUD refletem os dados.

### Marco 4 — Combate matemático e final
- Guardiões por operação; telegráfico, resposta matemática, hit-stop, câmera/partículas/áudio, vitórias e derrotas.
- Chefe final, retorno ao menu, salvar/carregar progresso.
- Critério: sessão concluída ponta a ponta; todos os ataques testados; Venn e complemento possuem universo definido.

### Marco 5 — Direção de arte e qualidade
- Materiais e shaders URP, água, cristais, grama, céu/névoa, clima de vila viva.
- Pré-baked lightmaps e Light Probes para estáticos, sombras com distância reduzida em hardware fraco, LOD/instancing, culling e pools.
- Quality URP assets **Baixo/Médio/Alto** com resolução, tela cheia, FPS, sombras, SSAO, pós e render scale. Presets salvos em PlayerPrefs e deteção inicial conservadora.
- Critério: sem materiais rosas ou texturas faltando; qualidade trocada em runtime; experiência confortável no Baixo.

### Marco 6 — QA, otimização e distribuição
- EditMode + PlayMode; build Win64 em batchmode, logs arquivados.
- Testar pelo menos PC integrado e PC com GPU dedicada; reportar CPU, GPU, RAM, resolução, FPS médio e 1% low e cenas usadas no benchmark.
- **60 FPS em 1080p com iGPU é meta condicionada a teste em hardware real**, nunca promessa automática.
- Entregar `Builds/Windows/` com dados do Unity + EXE em ZIP, README de instalação/controles, CREDITS.md e relatório sobre limitações.
- **Nunca subir builds gigantes, licenças restritas ou material de terceiros indevidamente ao GitHub.** Release assets são preferíveis para ZIP de distribuição; Git LFS para fontes grandes quando autorizado.

## 5. Decisões importantes antes de codificar

1. **Não remover a versão web**, pois o professor exige Vite e Oracle.
2. **Não usar o vídeo como “analisado” até tê-lo de fato.**
3. **Não confundir CC0 com Mixamo**: Adobe permite uso em jogos, porém existem restrições sobre redistribuir os FBX originais; usar assets CC0 como padrão quando a distribuição do projeto-fonte for pública.
4. **Não prometer 60 FPS** sem medições em equipamentos com placa integrada.
5. **Não solicitar senhas ou tokens no chat**; cada usuário autentica as próprias contas e configura segredos protegidos no GitHub quando aplicável.
6. **Não pagar por assets** sem autorização; escolher primeiro versões gratuitas CC0 realmente disponíveis, registrar alternativas e licença.

## 6. Referências verificadas

- Unity 6.3 LTS: https://unity.com/releases/unity-6/support
- URP: https://docs.unity.com/en-us/engine/6000.7/manual/render-pipelines/universal-render-pipeline/urp-quality-settings/urp-asset-and-renderer
- Build Windows batchmode: https://docs.unity.com/en-us/engine/6000.6/manual/building-and-publishing/build-command-line
- Quaternius Medieval Village: https://quaternius.com/packs/medievalvillagemegakit.html
- Quaternius Universal Animation Library: https://quaternius.com/packs/universalanimationlibrary.html
- Mixamo: https://helpx.adobe.com/pt/creative-cloud/faq/mixamo-faq.html
