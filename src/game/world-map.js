export const WORLD = Object.freeze({
  liora: { id: "liora", label: "Anciã Liora", x: 0, z: 6, color: "#ffd68d" },
  crystals: [
    { id: "crystal-1", label: "Cristal da Sabedoria", x: -6.8, z: 13.5, color: "#54d6ff" },
    { id: "crystal-2", label: "Cristal da Coragem", x: 8.5, z: 17.5, color: "#c58bff" },
    { id: "crystal-3", label: "Cristal do Equilíbrio", x: -7.0, z: 28, color: "#76ffbf" }
  ],
  guardians: [
    { id: "union", label: "Guardião da União", x: -12, z: 37, color: "#4bd6ff", symbol: "∪" },
    { id: "intersection", label: "Guardião da Interseção", x: 0, z: 46, color: "#af8aff", symbol: "∩" },
    { id: "difference", label: "Guardião do Complemento", x: 12, z: 55, color: "#5ee5a7", symbol: "∁" }
  ],
  boss: { id: "cael", label: "Cael, o Excludente", x: 0, z: 74, color: "#ff9b67" }
});

export const WORLD_BOUNDS = Object.freeze({ minX: -26, maxX: 26, minZ: -16, maxZ: 87 });

export function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function nearestUncollectedCrystal(state) {
  const remaining = WORLD.crystals.filter((c) => !state.crystals.includes(c.id));
  remaining.sort((a, b) => distance2D(a, state.position) - distance2D(b, state.position));
  return remaining[0] ?? null;
}

export function currentTarget(state) {
  if (state.phase === "meet-liora") return { ...WORLD.liora, instruction: "Converse com Liora para começar a jornada.", action: "Conversar" };
  if (state.phase === "crystals") {
    const crystal = nearestUncollectedCrystal(state);
    return crystal ? { ...crystal, instruction: "Siga a seta luminosa e colete o cristal.", action: "Coletar" } : null;
  }
  if (state.phase === "guardians") {
    const enemy = WORLD.guardians[state.guardianIndex];
    return enemy ? { ...enemy, instruction: "Responda corretamente para derrotar o guardião.", action: "Enfrentar" } : null;
  }
  if (state.phase === "boss") return { ...WORLD.boss, instruction: "Derrote Cael para libertar o vale!", action: "Enfrentar" };
  return null;
}
