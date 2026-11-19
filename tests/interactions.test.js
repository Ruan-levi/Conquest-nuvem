import { describe, expect, it } from "vitest";
import { nearbyScenicSpot, inspectScenicSpot, SCENIC_SPOTS } from "../src/game/interactions.js";

describe("interações opcionais do Vale", () => {
  it("encontra o ponto mais próximo dentro do raio", () => {
    const location = nearbyScenicSpot({ x: -4.3, z: -2.8 });
    expect(location?.id).toBe("village-board");
    expect(nearbyScenicSpot({ x: 0, z: 100 })).toBeNull();
  });

  it("rejeita posição inválida", () => {
    expect(nearbyScenicSpot({ x: NaN, z: 2 })).toBeNull();
    expect(nearbyScenicSpot(null)).toBeNull();
  });

  it("explica teoria dos conjuntos sem modificar pontos", () => {
    const state = { health: 55, score: 100 };
    const result = inspectScenicSpot(state, SCENIC_SPOTS[0]);
    expect(result.type).toBe("lore");
    expect(result.message).toContain("União");
    expect(state).toEqual({ health: 55, score: 100 });
  });

  it("cura apenas uma vez, sem ultrapassar a vida máxima", () => {
    const state = { health: 92, score: 123 };
    const fountain = SCENIC_SPOTS.find((spot) => spot.id === "healing-fountain");
    expect(inspectScenicSpot(state, fountain).type).toBe("healed");
    expect(state.health).toBe(100);
    state.health = 30;
    expect(inspectScenicSpot(state, fountain).type).toBe("used");
    expect(state.health).toBe(30);
    expect(state.score).toBe(123);
  });

  it("não consome a cura se o jogador já está com vida cheia", () => {
    const state = { health: 100 };
    const fountain = SCENIC_SPOTS.find((spot) => spot.id === "healing-fountain");
    expect(inspectScenicSpot(state, fountain).type).toBe("full");
    state.health = 70;
    expect(inspectScenicSpot(state, fountain).type).toBe("healed");
    expect(state.health).toBe(90);
  });

  it("ignora interações inexistentes", () => {
    expect(inspectScenicSpot({ health: 50 }, { id: "not-real" }).type).toBe("none");
  });
});
