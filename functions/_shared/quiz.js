// Banco de perguntas exclusivo do backend. Nao importar este modulo no frontend.
export const QUIZ_LENGTH = 6;
export const POINTS_PER_CORRECT = 100;

const QUESTIONS = Object.freeze([
  { text: 'Se A = {1,2} e B = {2,3}, qual e A uniao B?', options: ['{2}', '{1,2,3}', '{1,3}', 'Vazio'], answer: 1 },
  { text: 'Se A = {1,2,3} e B = {2,4}, qual e A intersecao B?', options: ['{1,4}', '{1,2,3,4}', '{2}', 'Vazio'], answer: 2 },
  { text: 'Se A = {1,2,3} e B = {2}, qual e A menos B?', options: ['{1,3}', '{2}', '{1,2,3}', 'Vazio'], answer: 0 },
  { text: 'Qual conjunto e subconjunto de {a,b,c}?', options: ['{a,d}', '{b,c}', '{c,d}', '{d}'], answer: 1 },
  { text: 'A uniao de A com o conjunto vazio e igual a:', options: ['Vazio', 'A', 'Universo', '{0}'], answer: 1 },
  { text: 'A intersecao de A com o conjunto vazio e:', options: ['A', 'Universo', 'Vazio', '{0}'], answer: 2 },
  { text: 'Se U = {1,2,3,4} e A = {1,4}, qual o complemento de A?', options: ['{1,4}', '{2,3}', 'Vazio', '{1,2,3,4}'], answer: 1 },
  { text: 'Se A esta contido em B, entao A intersecao B e:', options: ['A', 'B', 'Vazio', 'Universo'], answer: 0 },
  { text: 'Dois conjuntos cuja intersecao e vazia sao chamados:', options: ['Iguais', 'Disjuntos', 'Unitarios', 'Universais'], answer: 1 },
  { text: 'Se A = {1,3} e B = {3,5}, entao B menos A e:', options: ['{1}', '{3}', '{5}', '{1,5}'], answer: 2 },
  { text: 'Qual e a cardinalidade de {a,b,c,d}?', options: ['2', '3', '4', '5'], answer: 2 },
  { text: 'A intersecao de {a,b} e {b,c} e:', options: ['{a,c}', '{a,b,c}', '{b}', 'Vazio'], answer: 2 },
  { text: 'A uniao de A com o proprio A e:', options: ['A', 'Vazio', 'Universo', 'A complemento'], answer: 0 },
  { text: 'A diferenca entre um conjunto A e ele mesmo e:', options: ['A', 'Universo', 'Vazio', '{0}'], answer: 2 },
  { text: 'Qual relacao e verdadeira para A = {2,4}?', options: ['3 pertence a A', '2 pertence a A', '5 pertence a A', 'A e vazio'], answer: 1 },
]);

export function questionCount() { return QUESTIONS.length; }
export function publicQuestion(index) {
  const q = QUESTIONS[index];
  if (!q) throw new RangeError('Pergunta invalida');
  return { text: q.text, options: [...q.options] };
}
export function checkAnswer(index, choice) {
  if (!Number.isInteger(choice) || choice < 0 || choice > 3) throw new RangeError('Alternativa invalida');
  const q = QUESTIONS[index];
  if (!q) throw new RangeError('Pergunta invalida');
  return { correct: choice === q.answer, correctOption: q.answer };
}
export function nextQuestionIndex(previous, rng) {
  if (!Number.isInteger(previous) || previous < 0 || previous >= QUESTIONS.length) {
    throw new RangeError('Pergunta anterior invalida');
  }
  const selection = rng(QUESTIONS.length - 1);
  if (!Number.isInteger(selection) || selection < 0 || selection >= QUESTIONS.length - 1) {
    throw new RangeError('Gerador de perguntas invalido');
  }
  return selection >= previous ? selection + 1 : selection;
}
export function isValidRunId(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}