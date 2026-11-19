// Banco e gabarito exclusivos da Nhost Function. NUNCA importar no frontend.
import { createHash } from 'node:crypto';

export const DUEL_ROUNDS = 6;
export const POINTS_PER_HIT = 100;

const QUESTIONS = Object.freeze([
  { text: 'A = {1, 2} e B = {2, 3}. Qual é A ∪ B?', options: ['{2}', '{1, 2, 3}', '{1, 3}', '∅'], answer: 1 },
  { text: 'A = {1, 2} e B = {2, 3}. Qual é A ∩ B?', options: ['{1, 3}', '{1, 2, 3}', '{2}', '∅'], answer: 2 },
  { text: 'A = {1, 2, 3} e B = {2}. Qual é A − B?', options: ['{1, 3}', '{2}', '{1, 2, 3}', '∅'], answer: 0 },
  { text: 'Qual é um subconjunto de {a, b, c}?', options: ['{a, d}', '{b, c}', '{c, d}', '{d}'], answer: 1 },
  { text: 'A união de um conjunto A com o conjunto vazio vale:', options: ['∅', 'A', 'U', '{0}'], answer: 1 },
  { text: 'A interseção de A com o conjunto vazio vale:', options: ['A', 'U', '∅', '{0}'], answer: 2 },
  { text: 'U = {1, 2, 3, 4} e A = {1, 4}. Qual é Aᶜ?', options: ['{1, 4}', '{2, 3}', '∅', 'U'], answer: 1 },
  { text: 'Se A ⊆ B, então A ∩ B é:', options: ['A', 'B', '∅', 'U'], answer: 0 },
  { text: 'Dois conjuntos cuja interseção é vazia são:', options: ['Iguais', 'Disjuntos', 'Unitários', 'Universais'], answer: 1 },
  { text: 'A = {1, 3} e B = {3, 5}. Qual é B − A?', options: ['{1}', '{3}', '{5}', '{1, 5}'], answer: 2 },
  { text: 'Qual é a cardinalidade de {a, b, c, d}?', options: ['2', '3', '4', '5'], answer: 2 },
  { text: 'A interseção de {a, b} e {b, c} vale:', options: ['{a, c}', '{a, b, c}', '{b}', '∅'], answer: 2 },
  { text: 'A ∪ A é sempre igual a:', options: ['A', '∅', 'U', 'Aᶜ'], answer: 0 },
  { text: 'A − A é sempre igual a:', options: ['A', 'U', '∅', '{0}'], answer: 2 },
  { text: 'Qual afirmação vale para A = {2, 4}?', options: ['3 ∈ A', '2 ∈ A', '5 ∈ A', 'A = ∅'], answer: 1 },
  { text: 'O complemento de A em U unido a A é:', options: ['A', '∅', 'U', 'A ∩ U'], answer: 2 },
]);

export function questionIndex(duelId, round) {
  if (!/^[\da-f-]{36}$/i.test(duelId) || !Number.isInteger(round) || round < 1 || round > DUEL_ROUNDS) {
    throw new RangeError('Rodada ou partida inválida.');
  }
  const digest = createHash('sha256').update(duelId + ':' + round).digest();
  return digest.readUInt32BE(0) % QUESTIONS.length;
}

export function publicQuestion(duelId, round) {
  const { text, options } = QUESTIONS[questionIndex(duelId, round)];
  return { text, options: [...options] };
}

export function checkDuelAnswer(duelId, round, choice) {
  if (!Number.isInteger(choice) || choice < 0 || choice > 3) throw new RangeError('Alternativa inválida.');
  const answer = QUESTIONS[questionIndex(duelId, round)].answer;
  return { correct: answer === choice, correctOption: answer };
}
