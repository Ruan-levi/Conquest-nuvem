# CONQUEST — História, personagens e progressão matemática

**Versão de roteiro proposta com base no texto do usuário; NÃO baseada em inspeção do vídeo ainda indisponível.**
**Ortografia em aberto:** “Llora” no prompt; “Liora” no jogo web. Manter como item a validar no vídeo.

## Premissa
O Vale dos Conjuntos é mantido em equilíbrio por cristais que representam as relações entre os conjuntos. Cael, o Excludente, fragmentou o conhecimento, e os habitantes da vila arruinada precisam de um Aprendiz dos Conjuntos para restabelecer as relações e desarmar os guardiões.

**Princípio pedagógico:** nenhum avanço essencial deve depender apenas de coletar objetos ou derrotar inimigos arbitrariamente. O desafio matemático é o mecanismo da progressão.

## Personagens

| Nome provisório | Função narrativa | Mecânica |
|---|---|---|
| Aprendiz dos Conjuntos | Protagonista em terceira pessoa | Anda, corre, usa dash, interage, responde e manipula conjuntos |
| Llora/Liora | Mentor(a) e porta de entrada da história | Apresenta tutorial, pergunta de pertinência e missão principal |
| Juno | Companheiro(a) da vila | Side quest: conduzir ao altar de cristais; permite ensinar subconjuntos |
| Guardião da União | Primeiro obstáculo | A ∪ B e agrupamento sem repetição |
| Guardião da Interseção | Segundo obstáculo | A ∩ B e elementos comuns |
| Guardião da Diferença | Terceiro obstáculo | A − B e complementar U \ A |
| Cael, o Excludente | Chefe final | Desafios combinados e diagrama de Venn |

**Personagens, títulos e ordem exata poderão mudar após o vídeo**. Os guardiões e Cael são reaproveitados conceitualmente da versão de Conquest já documentada.

## Capítulo 1 — O chamado da vila (aprox. 2 minutos)

**Local:** vila arruinada, praça com fonte circular e castelo ao fundo.

1. Jogador surge próximo ao portão da vila; HUD “Aprendiz dos Conjuntos”, 5/5 de vida, pontos, barra de dash, progresso e missão.
2. Seta aponta para Llora/Liora. Interação **E conversar**, fala curta com opção de pular digitação.
3. Mentor mostra objetos/cristais e pergunta: “2 pertence a A = {1,2,3}?”.
4. Acerto ensina pertinência e destrava orientação para Juno; erro explica símbolo ∈ e permite tentar novamente.

**Objetivo visual:** nenhuma missão sem waypoint, objetivo de texto e raio de interação.

## Capítulo 2 — Juno e o altar (aprox. 2 minutos)

1. Localizar Juno no caminho da praça.
2. Side quest: conduzi-lo(a) ao altar de treinamento; NPC acompanha com navegação, para em obstáculos, retorna se perder distância.
3. Altar apresenta três cristais azuis; primeiro desafio de **subconjuntos**: “{1,2} ⊆ {1,2,3}?”.
4. Dash desbloqueia e o HUD passa a mostrar recarga.

**Aprendizado:** diferença entre elemento pertencer e conjunto estar contido em outro.

## Capítulo 3 — Guardiões do vale (aprox. 4 minutos)

**União:** A = {1,2,3}, B = {3,4,5}. O jogador seleciona `A ∪ B = {1,2,3,4,5}`; resposta certa causa quebra de defesa e anim. de ataque.

**Interseção:** o inimigo apresenta escudo `A`; entre conjuntos possíveis, escolher `B` que forme a interseção solicitada. Exemplo: A = {1,2,3}, B = {3,4,5}; interseção = {3}. A interface mostra conjuntos, não só símbolos de operação.

**Diferença e complementar:** com U = {1,2,3,4,5}, A = {1,3,5}, B = {3,4}; jogador calcula A − B = {1,5} e Aᶜ = {2,4}. Explicação breve aparece no erro; não penalizar com uma longa sequência repetitiva.

**Feedback de combate:** ataque telegráfico, números de dano, hit-stop curto, partículas leves, invulnerabilidade de dash limitada, recuperação e som com variação de tom.

## Capítulo 4 — O castelo de Cael (aprox. 2 minutos)

1. Portão abre após guardiões; waypoint indica entrada.
2. Cael apresenta diagrama de Venn com A e B e uma região destacada.
3. Combate final de três fases:
   - identificar região de A ∩ B;
   - operar A ∪ B e A − B;
   - reconhecer Aᶜ em um universo U explicitamente definido.
4. Vitória ao resolver as operações e usar o dash contra o telegráfico do chefe.

**Tela final:** resumo de acertos, temas aprendidos, tentativas, pontuação e convite para jogar novamente.

## Roteiro de dados (proposto)

`MissionData`: id, chapter, title, description, waypoint, prerequisites, objectives[], onComplete[].

`DialogueData`: id, speakerId, lines[], choices[] (choiceId, label, nextId, conditionId), voiceEventId.

`QuestionData`: id, topic, difficulty, universe[], setA[], setB[], expectedOperation, options[], correctOptionId, explanation, retries.

`EnemyData`: id, displayName, health, attackPatternId, quizPool[], tutorialHintId, lootIds[].

`ChapterData`: id, title, missions[], tutorialSkills[], estimatedDurationSeconds.

Todos os dados devem ser versionados, lidos por serviços reutilizáveis e validados por testes; o conteúdo de matemática deve ter gabarito calculável por funções puras.

## Acessibilidade, aprendizagem e edição

- Permitir avançar diálogo sem sons de letra e desativar flashes/tremores.
- Não exigir decoreba: mostrar a operação de conjunto visualmente e incluir “Por quê?” após erro.
- Não confundir feedback punitivo do combate com humilhação do aluno.
- Conteúdos futuros substituíveis por novos JSON/ScriptableObjects, sem reescrever scripts de personagem, missões ou UI.

**A confirmar com vídeo:** nomes exatos, ordem e duração das tarefas, HUD completo, mapa, aparência dos NPCs, textos e fluxo observados.
