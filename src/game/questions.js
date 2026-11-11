// Perguntas alinhadas ao conceito original: união, interseção, complemento e diferença.
export const QUESTION_BANK = Object.freeze({
  union: [
    { text: "Se A = {1, 2} e B = {2, 3}, qual é A ∪ B?", options: ["{2}", "{1, 2, 3}", "{1, 3}", "{1, 2, 2, 3}"], answer: 1 },
    { text: "A união de {a, b} com {b, c} resulta em:", options: ["{b}", "{a, c}", "{a, b, c}", "∅"], answer: 2 },
    { text: "A ∪ ∅ é sempre igual a:", options: ["∅", "A", "U", "{0}"], answer: 1 }
  ],
  intersection: [
    { text: "Se A = {1, 2, 3} e B = {2, 4}, qual é A ∩ B?", options: ["{1, 3, 4}", "{2}", "{1, 2, 3, 4}", "∅"], answer: 1 },
    { text: "Qual é a interseção de {a, b} com {c, d}?", options: ["{a, b, c, d}", "∅", "{a, d}", "{b, c}"], answer: 1 },
    { text: "Se A está contido em B, então A ∩ B é:", options: ["B", "∅", "A", "A ∪ B"], answer: 2 }
  ],
  difference: [
    { text: "Se A = {1, 2, 3} e B = {2}, qual é A − B?", options: ["{1, 3}", "{2}", "{1, 2, 3}", "∅"], answer: 0 },
    { text: "Se U = {1, 2, 3, 4} e A = {1, 4}, qual é Aᶜ em U?", options: ["{1, 4}", "{2, 3}", "{1, 2, 3, 4}", "∅"], answer: 1 },
    { text: "Em U = {a, b, c}, o complemento de {a, b} é:", options: ["{a, b}", "∅", "{c}", "U"], answer: 2 }
  ],
  cael: [
    { text: "A = {1, 2}, B = {2, 3}. Quanto vale (A ∪ B) − (A ∩ B)?", options: ["{2}", "{1, 3}", "{1, 2, 3}", "∅"], answer: 1 },
    { text: "Se A ∩ B = ∅, dizemos que os conjuntos são:", options: ["Iguais", "Complementares", "Disjuntos", "Universais"], answer: 2 },
    { text: "U = {1, 2, 3, 4}, A = {1, 3}. Quanto vale A ∪ Aᶜ?", options: ["A", "∅", "{2, 4}", "U"], answer: 3 },
    { text: "Qual propriedade é verdadeira para qualquer conjunto A?", options: ["A ∩ ∅ = A", "A ∪ ∅ = A", "A ∪ A = ∅", "A − A = A"], answer: 1 }
  ]
});

export function validateQuestion(question) {
  return Boolean(
    question &&
    typeof question.text === "string" &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    Number.isInteger(question.answer) &&
    question.answer >= 0 &&
    question.answer < question.options.length
  );
}
