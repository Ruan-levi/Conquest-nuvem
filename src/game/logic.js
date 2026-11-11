import { WORLD, currentTarget, distance2D } from "./world-map.js";
import { QUESTION_BANK } from "./questions.js";

export const MAX_HEALTH = 100;
export const WALK_SPEED = 5.2;
export const RUN_SPEED = 9.0;

export function createGameState() {
  return {
    phase: "meet-liora",
    position: { x: 0, z: -3 },
    crystals: [],
    guardianIndex: 0,
    defeated: [],
    health: MAX_HEALTH,
    score: 0,
    correct: 0,
    questionsAnswered: 0,
    battle: null,
    toast: "",
    startedAt: Date.now()
  };
}

// W anda PARA A FRENTE (+Z na câmera inicial); S para trás (-Z).
// O deslocamento é calculado com base no yaw da câmera e normalizado na diagonal.
export function movementVector(keys, yaw = 0) {
  const forward = Number(Boolean(keys.w || keys.arrowup)) - Number(Boolean(keys.s || keys.arrowdown));
  const strafe = Number(Boolean(keys.d || keys.arrowright)) - Number(Boolean(keys.a || keys.arrowleft));
  const magnitude = Math.hypot(forward, strafe);
  if (magnitude === 0) return { x: 0, z: 0 };
  const f = forward / magnitude;
  const r = strafe / magnitude;
  return {
    x: Math.sin(yaw) * f + Math.cos(yaw) * r,
    z: Math.cos(yaw) * f - Math.sin(yaw) * r
  };
}

export function approachVelocity(current, desired, maxStep) {
  if (current < desired) return Math.min(current + maxStep, desired);
  return Math.max(current - maxStep, desired);
}

export function canInteract(state, radius = 3.2) {
  const target = currentTarget(state);
  return target && distance2D(state.position, target) <= radius ? target : null;
}

export function interact(state) {
  const target = canInteract(state);
  if (!target || state.battle) return { type: "none" };
  if (target.id === "liora") return { type: "dialogue" };
  if (state.phase === "crystals") {
    if (!state.crystals.includes(target.id)) {
      state.crystals.push(target.id);
      state.score += 35;
    }
    if (state.crystals.length === WORLD.crystals.length) state.phase = "guardians";
    return { type: "crystal", label: target.label };
  }
  if (state.phase === "guardians" || state.phase === "boss") {
    const id = state.phase === "boss" ? "cael" : target.id;
    const maxHits = id === "cael" ? 3 : 2;
    state.battle = { id, title: target.label, hits: 0, maxHits, round: 0, locked: false };
    return { type: "battle", battle: state.battle };
  }
  return { type: "none" };
}

export function acceptLioraQuest(state) {
  if (state.phase !== "meet-liora") return false;
  state.phase = "crystals";
  state.score += 25;
  return true;
}

export function getBattleQuestion(state) {
  const battle = state.battle;
  if (!battle) return null;
  const bank = QUESTION_BANK[battle.id];
  return bank[battle.round % bank.length];
}

export function answerQuestion(state, index) {
  if (!state.battle || state.battle.locked) return { type: "ignored" };
  const battle = state.battle;
  const question = getBattleQuestion(state);
  const correct = Number(index) === question.answer;
  state.questionsAnswered += 1;
  if (correct) {
    state.correct++;
    state.score += battle.id === "cael" ? 160 : 100;
    battle.hits++;
  } else {
    state.health = Math.max(0, state.health - (battle.id === "cael" ? 22 : 18));
  }
  battle.round++;
  if (state.health <= 0) {
    state.phase = "defeat";
    state.battle = null;
    return { type: "defeat", correct, answer: question.answer };
  }
  if (battle.hits >= battle.maxHits) {
    state.defeated.push(battle.id);
    state.score += battle.id === "cael" ? 350 : 125;
    state.health = Math.min(MAX_HEALTH, state.health + 12);
    if (battle.id === "cael") state.phase = "victory";
    else {
      state.guardianIndex++;
      if (state.guardianIndex >= WORLD.guardians.length) state.phase = "boss";
    }
    state.battle = null;
    return { type: battle.id === "cael" ? "victory" : "guardian-defeated", correct, answer: question.answer, id: battle.id };
  }
  return { type: "answered", correct, answer: question.answer };
}

export function stageLabel(state) {
  return {
    "meet-liora": "ETAPA 1 / 4",
    crystals: "ETAPA 2 / 4",
    guardians: "ETAPA 3 / 4",
    boss: "ETAPA 4 / 4",
    victory: "CONCLUÍDO",
    defeat: "DERROTA"
  }[state.phase] || "";
}

export function makeResult(state) {
  return {
    score: state.score,
    correct_answers: state.correct,
    total_answers: state.questionsAnswered,
    completed: state.phase === "victory",
    played_at: new Date().toISOString()
  };
}
