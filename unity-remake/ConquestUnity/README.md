# CONQUEST UNITY — prototipo visual 3D (URP)

**Versao:** Unity 6.3 LTS, projeto com URP 17.3 e scripts C#. **Nao e um jogo Windows compilado.**
O Unity Editor nao foi executado durante a criacao dos arquivos no GitHub, logo a cena ainda
precisa ser gerada/validada no Editor. A jogabilidade matematica completa continua na versao
web Babylon.js (raiz src/ do repositorio).

## Abrir pela primeira vez — Windows

1. Instale Unity Hub e Unity **6.3 LTS** (preferencialmente um patch atualizado da mesma serie).
   Marque **Windows Build Support (IL2CPP)** se for gerar executavel Win64.
2. Clone o repositorio no PC e, no Unity Hub, clique em **Add project from disk**.
   Selecione a pasta exata: unity-remake/ConquestUnity
3. Espere o Unity baixar URP e compilar C#. O arquivo ProjectVersion.txt usa 6000.3.0f1;
   uma revisao 6.3 LTS mais recente pode pedir upgrade dos arquivos do Editor.
4. **Obrigatorio:** se Project Settings > Graphics ainda nao tiver um render pipeline,
   crie um em Assets > Create > Rendering > URP Asset (with Universal Renderer).
   Atribua o asset em Edit > Project Settings > Graphics > Default Render Pipeline.
   Em Edit > Project Settings > Quality, remova overrides incompatíveis ou use o mesmo URP Asset.
   Sem essa configuracao, materiais poderao aparecer rosa e o gerador avisara.
5. Clique em **Tools > Conquest > Gerar cenario 3D URP**.
   O gerador cria Assets/ConquestGenerated e salva a cena Assets/Scenes/ValeDosConjuntos.unity,
   adicionando-a ao Build Settings. A pasta Generated e substituida ao executar o menu novamente.
6. Clique em **Play**. Use o Game View para testar o 3D.
7. Salve e registre no Git os arquivos *.meta gerados pelo Unity, a cena e os assets
   produzidos; nao envie Library, Temp ou Builds para o repositorio.

**Atencao:** se aparecer erro de Input no Console, ative Edit > Project Settings > Player
> Other Settings > Active Input Handling = Both (o prototipo usa o Input Manager classico).
O Editor pode solicitar reinicializacao.

## O que foi implementado por codigo

- Terreno 3D de 260 x 260 metros com montanhas perifericas e vila central plana.
- 3 camadas de terreno (grama, terra/trilha e pedra) com texturas proceduralmente geradas.
- 12 casas, fonte, portao/castelo, 125 distribuicoes tentadas de pinheiros,
  rochas e arbustos; os meshes usam materiais PBR (URP/Lit).
- Luz solar com sombras suaves, pontos de luz, fog, ACES, Bloom e Color Grading.
- Personagem proxy C# em terceira pessoa com W/A/S/D, Shift, Space e animacao
  simples de membros; camera orbital com colisao, zoom, Q/R e botao direito do mouse.
- 3 cristais colecionaveis com material emissivo e luz; HUD de objetivo e FPS.
- F1/F2/F3: presets demonstrativos de distancia de sombras e nevoa.
  **Nao** alteram automaticamente render scale/MSAA/SSAO do URP Asset.
- Materiais, malhas e texturas sao assets Unity salvos e editaveis.

## Melhorias ainda necessarias para qualidade AAA/realismo

- Importar modelos PBR autorais/licenciados, personagens Humanoid rigados,
  animacoes reais, normal maps, roughness, albedo e ambient occlusion.
- Construir navmesh, missões/quiz/combate do jogo original,
  cinematics, controles de volume/som, audio espacial e UI completa.
- Ajustar Lighting Window (Bake GI/Light Probes, Reflection Probes) e
  adicionar SSAO Renderer Feature + Volume Override ao renderer URP,
  caso o computador suporte. O gerador ainda nao faz bake de iluminacao.
- Criar preset URP Low/Medium/High usando diferentes URP Assets com medidas de FPS.
- Reproduzir aparencia do video original: arquivo de referencia nao foi encontrado no repo.
- Build Windows, abrir em PC real, verificar GPU/RAM/FPS e empacotar corretamente.

**Somente depois de gerar/validar a cena no Editor** pode-se afirmar que o Unity
compilou o projeto, que a imagem esta correta ou que um .exe foi produzido.

## Build Windows depois dos testes

File > Build Profiles > Windows > Switch Platform > Build. Verifique se
Assets/Scenes/ValeDosConjuntos.unity esta no build e salve em Builds/Windows.
Distribua a pasta de build completa, nao apenas o arquivo .exe.

## Quest, Unity e Cloud

"Conquest" e o nome do jogo; este projeto destina-se ao Windows.
Nao e uma build VR Meta Quest.
Esta pasta e independente do jogo web Vite/Babylon.js. Os requisitos
academicos de Nhost, Oracle, Docker/Portainer e CI/CD continuam na **versao web**.
A versao Windows ainda nao sincroniza conta, multiplayer ou scores com Nhost.

Docs Unity:
- https://unity.com/releases/unity-6/support
- https://docs.unity.com/en-us/engine/6000.3/manual/render-pipelines/universal-render-pipeline/urp-quality-settings/urp-asset-create
- https://docs.unity.com/en-us/engine/6000.3/manual/render-pipelines/choose-a-render-pipeline/feature-comparison
