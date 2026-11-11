# CONQUEST — Unity Windows e trilha web

**Agora ha uma estrutura de projeto Unity 6.3 LTS com codigo C# e gerador de cena URP** em [ConquestUnity](ConquestUnity/README.md).

O gerador cria o prototipo visual de vila/castelo, terreno com texturas, iluminacao cinematografica, camera em terceira pessoa, personagem provisório e 3 cristais.
**Nenhum Unity Editor foi executado aqui e a cena ainda nao foi gerada nem validada em um PC.**

Arquivos de planejamento:
- [PLAN.md](PLAN.md) — roadmap tecnico e testes a fazer.
- [STORY.md](STORY.md) — narrativa planejada e conflitos de conjuntos.
- [CREDITS.md](CREDITS.md) — licencas e referencias.

## Para comecar

1. Instalar Unity Hub com 6.3 LTS e Windows Build Support.
2. No Unity Hub, abrir projeto existente na pasta unity-remake/ConquestUnity.
3. Configurar URP Asset em Project Settings > Graphics (se necessario).
4. Executar Tools > Conquest > Gerar cenario 3D URP e pressionar Play.
5. Seguir [ConquestUnity/README.md](ConquestUnity/README.md) para controles, exportacao e limitacoes.

A versao web Vite/Babylon.js permanece independente: ela atende aos requisitos
academicos de Nhost, Oracle Cloud, Docker, Portainer e GitHub Actions.
