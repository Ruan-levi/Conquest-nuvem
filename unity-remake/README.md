# CONQUEST — trilha de remake Unity Windows

Este diretório inicia a **trilha de planejamento** de um remake do CONQUEST em Unity 6.3 LTS e URP.

**Não é um projeto Unity gerado ou validado.** Nenhum Editor Unity, asset de terceiros, jogo Windows ou vídeo de referência foi aberto neste momento.

Documentos:
- [PLAN.md](PLAN.md) — etapas, arquitetura, controles, QA e critérios de aceite.
- [STORY.md](STORY.md) — proposta provisória de narrativa e progressão matemática.
- [CREDITS.md](CREDITS.md) — fontes e licenças a verificar quando forem realmente importadas.

## O que permanece funcionando separadamente

O código web de `src/` (Vite/Babylon.js) e os workflows de GitHub Pages/Oracle não são substituídos. O enunciado do trabalho final de Nuvem exige Vite, BaaS, Docker, Portainer e Oracle, não apenas um executável Unity para Windows.

## Como começar efetivamente no Editor

1. Disponibilizar o vídeo `reference/Gravacao_de_Tela_2026-11-10_105724.mp4`.
2. Abrir Unity Hub com Unity 6.3 LTS (Windows Build Support) e criar projeto **3D URP** em subpasta `unity-remake/ConquestUnity`.
3. Importar Input System, Cinemachine e Test Framework, depois configurar os 3 URP Assets.
4. Executar os marcos do [PLAN](PLAN.md) com evidências de Editor/PlayMode/Win64.
5. Não publicar licenças, credenciais ou FBX com redistribuição restrita.

O desenvolvimento do remake deve ocorrer em commits separados e sob o diretório do Unity, preservando a aplicação web.
