import { describe, it, expect } from "vitest";
import { createGameState, movementVector, interact, acceptLioraQuest, getBattleQuestion, answerQuestion, canInteract, makeResult } from "../src/game/logic.js";
import { WORLD, currentTarget } from "../src/game/world-map.js";
import { QUESTION_BANK, validateQuestion } from "../src/game/questions.js";

describe("Movimentacao WASD", () => {
  it("corrige W = frente (+Z), S = tras (-Z)", () => {
    expect(movementVector({ w: true }, 0).z).toBe(1);
    expect(movementVector({ s: true }, 0).z).toBe(-1);
  });
  it("A esquerda e D direita", () => {
    expect(movementVector({ a: true }, 0).x).toBe(-1);
    expect(movementVector({ d: true }, 0).x).toBe(1);
  });
  it("gira movimento junto com camera", () => {
    const vector = movementVector({ w: true }, Math.PI / 2);
    expect(vector.x).toBeCloseTo(1, 6);
    expect(vector.z).toBeCloseTo(0, 6);
  });
  it("na diagonal mantem velocidade normalizada", () => {
    const vector = movementVector({ w: true, d: true }, 0);
    expect(Math.hypot(vector.x, vector.z)).toBeCloseTo(1);
  });
});
describe("Progressao de jogo", () => {
  it("inicia proximo de Liora", () => {
    const s = createGameState();
    expect(s.phase).toBe("meet-liora");
    expect(currentTarget(s).id).toBe("liora");
    expect(s.battle).toBeNull();
  });
  it("interage so quando perto", () => {
    const s = createGameState();
    expect(canInteract(s)).toBeNull();
    s.position = { x: WORLD.liora.x, z: WORLD.liora.z };
    expect(interact(s).type).toBe("dialogue");
    expect(acceptLioraQuest(s)).toBe(true);
  });
  it("reune os tres cristais", () => {
    const s = createGameState();
    acceptLioraQuest(s);
    for (const c of WORLD.crystals) {
      s.position = { x: c.x, z: c.z };
      expect(interact(s).type).toBe("crystal");
    }
    expect(s.phase).toBe("guardians");
    expect(currentTarget(s).id).toBe("union");
  });
  it("vence os guardioes e o chefe", () => {
    const s = createGameState();
    acceptLioraQuest(s);
    for (const c of WORLD.crystals) {
      s.position = { x: c.x, z: c.z };
      interact(s);
    }
    for (const enemy of [...WORLD.guardians, WORLD.boss]) {
      s.position = { x: enemy.x, z: enemy.z };
      expect(interact(s).type).toBe("battle");
      let remaining = 8;
      while (s.battle && remaining-- > 0) {
        answerQuestion(s, getBattleQuestion(s).answer);
      }
    }
    expect(s.phase).toBe("victory");
    expect(s.defeated).toHaveLength(4);
    expect(makeResult(s).completed).toBe(true);
  });
  it("erro reduz vida mas nao acrescenta pontos", () => {
    const s = createGameState();
    acceptLioraQuest(s);
    for (const c of WORLD.crystals) {
      s.position = { x: c.x, z: c.z };
      interact(s);
    }
    s.position = { x: WORLD.guardians[0].x, z: WORLD.guardians[0].z };
    interact(s);
    const before = s.score;
    const q = getBattleQuestion(s);
    const r = answerQuestion(s, (q.answer + 1) % 4);
    expect(r.correct).toBe(false);
    expect(s.health).toBe(82);
    expect(s.score).toBe(before);
  });
});
describe("Perguntas", () => {
  it("todas possuem 4 opcoes e resposta valida", () => {
    for (const bank of Object.values(QUESTION_BANK)) for (const q of bank) {
      expect(validateQuestion(q)).toBe(true);
    }
  });
});
